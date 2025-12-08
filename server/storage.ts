
import { firestore } from './firebase'; // Importa la instancia de Firestore
import { FieldValue } from 'firebase-admin/firestore';

// --- TIPOS Y ESTRUCTURAS DE DATOS ---

// Define la estructura para un post
export interface ContentPost {
  id?: string; // El ID será asignado por Firestore
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
  keywords: string;
  status: 'draft' | 'published';
  provider?: string;
  bulkType?: string; // Fuente: 'standard', 'massive', 'single'
  batchId?: string; // ID del lote de generación
  campaignId?: string; // ID de la campaña asociada
  createdAt?: FieldValue; // Gestionado por el servidor
  updatedAt?: FieldValue; // Gestionado por el servidor
  publishedAt?: FieldValue | null;
}

// Define la estructura para una campaña
export interface Campaign {
  id?: string; // El ID será asignado por Firestore
  name: string;
  description: string;
  blogUrl: string;
  status: 'active' | 'archived';
  postCount?: number; // Se puede actualizar con un contador
  createdAt?: FieldValue;
}

// --- INTERFAZ DE ALMACENAMIENTO (Contrato) ---

export interface IStorage {
  // Operaciones de Contenido
  saveGeneratedContent(data: ContentPost): Promise<ContentPost>;
  getAllGeneratedContent(campaignId?: string): Promise<ContentPost[]>;
  getGeneratedContent(id: string): Promise<ContentPost | null>;
  updateGeneratedContent(id: string, data: Partial<ContentPost>): Promise<ContentPost>;
  deleteGeneratedContent(id: string): Promise<void>;
  publishGeneratedContent(id: string): Promise<ContentPost>;

  // Operaciones de Campaña
  createCampaign(data: Campaign): Promise<Campaign>;
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign>;
}

// --- IMPLEMENTACIÓN CON FIRESTORE ---

class FirebaseStorage implements IStorage {
  private contentCollection = firestore.collection('generatedContent');
  private campaignCollection = firestore.collection('campaigns');

  // --- MÉTODOS DE CONTENIDO ---

  async saveGeneratedContent(data: ContentPost): Promise<ContentPost> {
    const docData = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: null,
    };
    const docRef = await this.contentCollection.add(docData);
    
    // Si hay un campaignId, actualizamos el contador de posts en la campaña
    if (data.campaignId) {
      const campaignRef = this.campaignCollection.doc(data.campaignId);
      await campaignRef.update({ postCount: FieldValue.increment(1) });
    }

    return { ...data, id: docRef.id };
  }

  async getAllGeneratedContent(campaignId?: string): Promise<ContentPost[]> {
    let query: FirebaseFirestore.Query = this.contentCollection;

    if (campaignId) {
      query = query.where('campaignId', '==', campaignId);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentPost));
  }

  async getGeneratedContent(id: string): Promise<ContentPost | null> {
    const doc = await this.contentCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as ContentPost : null;
  }

  async updateGeneratedContent(id: string, data: Partial<ContentPost>): Promise<ContentPost> {
    const docRef = this.contentCollection.doc(id);
    await docRef.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as ContentPost;
  }

  async deleteGeneratedContent(id: string): Promise<void> {
    const docRef = this.contentCollection.doc(id);
    const doc = await docRef.get();
    const data = doc.data() as ContentPost | undefined;

    await docRef.delete();

    // Si el post pertenecía a una campaña, decrementamos el contador
    if (data && data.campaignId) {
      const campaignRef = this.campaignCollection.doc(data.campaignId);
      await campaignRef.update({ postCount: FieldValue.increment(-1) });
    }
  }

  async publishGeneratedContent(id: string): Promise<ContentPost> {
    return this.updateGeneratedContent(id, {
      status: 'published',
      publishedAt: FieldValue.serverTimestamp(),
    });
  }

  // --- MÉTODOS DE CAMPAÑA ---

  async createCampaign(data: Campaign): Promise<Campaign> {
    const docData = {
      ...data,
      postCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    };
    const docRef = await this.campaignCollection.add(docData);
    return { ...data, id: docRef.id };
  }

  async getCampaigns(): Promise<Campaign[]> {
    const snapshot = await this.campaignCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const doc = await this.campaignCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Campaign : null;
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
      const docRef = this.campaignCollection.doc(id);
      await docRef.update(data);
      const updatedDoc = await docRef.get();
      return {id: updatedDoc.id, ...updatedDoc.data()} as Campaign
  }
}

// Exporta una instancia única de la clase de almacenamiento
export const storage = new FirebaseStorage();
