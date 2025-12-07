
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Copy, Check, Globe, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/lib/schema";

// Mock data for frontend-only mode
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: "California Personal Injury",
    blogUrl: "https://californiapersonalinjurylawyersblog.com",
    description: "Primary SEO campaign for Los Angeles market",
    embedCode: "<?php ... ?>",
    status: "active",
    posts: 145,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-20"),
    userId: "user_1",
    config: {}
  },
  {
    id: 2,
    name: "Texas Accident Lawyers",
    blogUrl: "https://texasaccidentlawyers.com",
    description: "Expansion campaign for Houston area",
    embedCode: "<?php ... ?>",
    status: "paused",
    posts: 32,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-03-18"),
    userId: "user_1",
    config: {}
  }
];

export default function Campaigns() {
  const queryClient = useQueryClient();
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    blogUrl: '',
    description: ''
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Local state for campaigns to simulate database
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  // Mock Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return localCampaigns;
    },
    initialData: localCampaigns
  });

  // Mock Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: { name: string; blogUrl: string; description: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const blogIdentifier = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const embedCode = generateEmbedCode(blogIdentifier);
      
      const newId = Math.max(0, ...localCampaigns.map(c => c.id)) + 1;
      
      const newCampaignObj: Campaign = {
        id: newId,
        name: data.name,
        blogUrl: data.blogUrl,
        description: data.description,
        embedCode,
        status: 'active',
        posts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user_1",
        config: {}
      };
      
      setLocalCampaigns(prev => [...prev, newCampaignObj]);
      return newCampaignObj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setNewCampaign({ name: '', blogUrl: '', description: '' });
      setIsDialogOpen(false);
      toast({
        title: "Campaña creada",
        description: "La campaña ha sido creada exitosamente"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña",
        variant: "destructive"
      });
    }
  });

  // Mock Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLocalCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña actualizada",
        description: "El estado de la campaña ha sido actualizado"
      });
    }
  });

  // Mock Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLocalCampaigns(prev => prev.filter(c => c.id !== id));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña eliminada",
        description: "La campaña ha sido eliminada"
      });
    }
  });

  function generateEmbedCode(blogIdentifier: string): string {
    return `<?php
/**
 * Plugin Name: SEO Automation Hub - ${blogIdentifier}
 * Description: Embeds the Replit SEO Dashboard into WordPress Admin
 * Version: 1.0.0
 * Author: SEO Hub
 */

add_action('admin_menu', 'register_seo_hub_${blogIdentifier}');

function register_seo_hub_${blogIdentifier}() {
    add_menu_page(
        'SEO Automation',
        'SEO Hub',
        'manage_options',
        'seo-automation-hub-${blogIdentifier}',
        'render_seo_hub_${blogIdentifier}',
        'dashicons-chart-area',
        6
    );
}

function render_seo_hub_${blogIdentifier}() {
    ?>
    <div class="wrap" style="background: #fff; margin: 0; padding: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
        <iframe 
            src="https://[YOUR-REPLIT-URL].replit.app/?campaign=${blogIdentifier}" 
            style="width: 100%; height: 100vh; border: none;"
            title="SEO Automation Hub"
        ></iframe>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const wrap = document.querySelector('.wrap');
            if(wrap) {
                wrap.closest('#wpbody-content').style.padding = '0';
            }
        });
    </script>
    <?php
}
?>`;
  }

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id.toString());
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Código copiado",
      description: "El script de embed ha sido copiado al portapapeles"
    });
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.blogUrl) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    createCampaignMutation.mutate(newCampaign);
  };

  const handleDeleteCampaign = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const toggleCampaignStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateCampaignMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Campañas</h1>
          <p className="text-slate-500 mt-1">Administra múltiples blogs y genera scripts de embed personalizados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
              <DialogDescription>
                Configura un nuevo blog para gestión SEO automatizada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nombre de la Campaña *</Label>
                <Input 
                  id="campaign-name"
                  placeholder="Ej: Texas Car Accident Lawyers"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-url">URL del Blog *</Label>
                <Input 
                  id="blog-url"
                  placeholder="https://www.example.com"
                  value={newCampaign.blogUrl}
                  onChange={(e) => setNewCampaign({ ...newCampaign, blogUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe el propósito de esta campaña..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? 'Creando...' : 'Crear Campaña'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay campañas aún</h3>
            <p className="text-slate-500 mb-6">Crea tu primera campaña para comenzar</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Campaña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="border-slate-100 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        <Badge 
                          className={campaign.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700'}
                        >
                          {campaign.status === 'active' ? 'Activa' : 'Pausada'}
                        </Badge>
                      </div>
                      <CardDescription className="mb-3">{campaign.description || 'Sin descripción'}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {campaign.blogUrl}
                        </span>
                        <span>{campaign.posts} publicaciones</span>
                        <span>Creada: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                      disabled={updateCampaignMutation.isPending}
                    >
                      {campaign.status === 'active' ? 'Pausar' : 'Activar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteCampaignMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Script de Embed para WordPress</Label>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => handleCopy(campaign.id, campaign.embedCode)}
                      className="h-8 gap-2"
                    >
                      {copiedId === campaign.id.toString() ? (
                        <>
                          <Check className="w-3 h-3 text-green-600" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar Código
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed max-h-64">
                    {campaign.embedCode}
                  </pre>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-900 text-sm mb-2">Instrucciones de Instalación</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                      <li>Copia el código de arriba</li>
                      <li>Crea un archivo <code className="bg-white px-1 rounded">seo-hub-{campaign.name.toLowerCase().replace(/\s+/g, '-')}.php</code></li>
                      <li>Sube el archivo a <code className="bg-white px-1 rounded">/wp-content/plugins/</code></li>
                      <li>Activa el plugin en WordPress Admin</li>
                      <li>Reemplaza <code className="bg-white px-1 rounded">[YOUR-REPLIT-URL]</code> con tu URL de Replit</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}
