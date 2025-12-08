
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, RefreshCw, BarChart2, MoreHorizontal, Settings, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

// Interfaz que coincide con la estructura de datos de Firestore
interface Campaign {
  id: string;
  name: string;
  blogUrl: string;
  description: string;
  status: 'active' | 'archived';
  postCount?: number;
}

export default function Campaigns() {
  const queryClient = useQueryClient();
  const [newCampaign, setNewCampaign] = useState({ name: '', blogUrl: '', description: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Obtener campañas desde la nueva API de Firebase
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    }
  });

  // Mutación para crear una campaña en Firestore
  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof newCampaign) => {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setNewCampaign({ name: '', blogUrl: '', description: '' });
      setIsDialogOpen(false);
      toast({ title: "¡Éxito!", description: "Campaña creada correctamente." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutación para eliminar una campaña de Firestore
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete campaign');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: "Campaña Eliminada", description: "La campaña se ha eliminado correctamente." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.blogUrl) {
      toast({ title: "Campos requeridos", description: "Por favor, completa el nombre y la URL.", variant: "destructive" });
      return;
    }
    createCampaignMutation.mutate(newCampaign);
  };

  const handleDeleteCampaign = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      deleteCampaignMutation.mutate(id);
    }
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
          <p className="text-slate-500 mt-1">Crea y gestiona tus campañas de contenido para diferentes sitios.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
              <Plus className="w-4 h-4" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
              <DialogDescription>Configura una nueva campaña para empezar a generar contenido.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Campaña *</Label>
                <Input id="name" placeholder="Ej: Blog de Abogados en Miami" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL del Sitio Web *</Label>
                <Input id="url" placeholder="https://misitio.com" value={newCampaign.blogUrl} onChange={(e) => setNewCampaign({ ...newCampaign, blogUrl: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Descripción</Label>
                <Textarea id="desc" placeholder="Describe la estrategia de contenido..." value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateCampaign} disabled={createCampaignMutation.isPending}>
                {createCampaignMutation.isPending ? 'Creando...' : 'Crear Campaña'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {campaigns.length > 0 ? campaigns.map((campaign) => (
          <Card key={campaign.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{campaign.name}</CardTitle>
                  <CardDescription className="mb-3">{campaign.description || 'Sin descripción.'}</CardDescription>
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-slate-400" />
                      {campaign.postCount || 0} posts generados
                    </span>
                    <span className="flex items-center gap-2">
                       <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className={campaign.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                         {campaign.status}
                       </Badge>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Link href={`/campaign/${campaign.id}`}>
                    <Button variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Gestionar Contenido
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" disabled><Settings className="w-4 h-4" /> Configuración</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600" onClick={() => handleDeleteCampaign(campaign.id)}>
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-semibold">No hay campañas todavía</h3>
              <p className="text-slate-500 mt-2">Haz clic en "Nueva Campaña" para empezar.</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
