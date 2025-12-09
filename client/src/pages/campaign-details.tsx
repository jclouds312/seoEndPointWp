
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, RefreshCw, Eye, Send, MoreHorizontal, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";

// Tipos de datos que coinciden con el backend de Firestore
interface ContentPost {
  id: string;
  title: string;
  status: 'draft' | 'published';
  seoScore: number;
  createdAt: any; // Firestore Timestamp
}

interface CampaignDetails {
  campaign: {
    id: string;
    name: string;
    description: string;
  };
  posts: ContentPost[];
}

export default function CampaignDetailsPage() {
  const queryClient = useQueryClient();
  const [, params] = useRoute("/campaign/:id");
  const campaignId = params?.id;

  // Obtener detalles de la campaña y sus posts
  const { data, isLoading, error } = useQuery<CampaignDetails>({
    queryKey: ['campaignDetails', campaignId],
    queryFn: async () => {
      if (!campaignId) throw new Error('Campaign ID is missing');
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch campaign details');
      return response.json();
    },
    enabled: !!campaignId, // Solo se ejecuta si hay un campaignId
  });

  // Mutación para publicar un post
  const publishMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/content/${postId}/publish`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to publish post');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignDetails', campaignId] });
      toast({ title: "Post Publicado", description: "El post ha sido publicado con éxito." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Mutación para eliminar un post
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/content/${postId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete post');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignDetails', campaignId] });
      toast({ title: "Post Eliminado", description: "El post ha sido eliminado." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <SidebarLayout><div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin" /></div></SidebarLayout>;
  }

  if (error) {
    return <SidebarLayout><div className="text-red-500">Error: {error.message}</div></SidebarLayout>;
  }

  const { campaign, posts } = data || {};

  return (
    <SidebarLayout>
        <div className="mb-8">
            <Link href="/campaigns" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Volver a Campañas
            </Link>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{campaign?.name}</h1>
                    <p className="text-slate-500 mt-1">{campaign?.description}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/bulk-content-generator?campaignId=${campaignId}`}>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Plus className="w-4 h-4" />
                            Generar Contenido
                        </Button>
                    </Link>
                </div>
            </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenido Generado</CardTitle>
          <CardDescription>Lista de todos los posts generados para esta campaña.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Puntuación SEO</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className={post.status === 'published' ? 'bg-green-100 text-green-700' : ''}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.seoScore}</TableCell>
                    <TableCell>{post.createdAt ? new Date(post.createdAt._seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        {post.status === 'draft' && (
                            <Button variant="ghost" size="sm" onClick={() => publishMutation.mutate(post.id)}>
                                <Send className="w-4 h-4 mr-2" /> Publicar
                            </Button>
                        )}
                         <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(post.id)} className="text-red-500">
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No hay posts en esta campaña todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
