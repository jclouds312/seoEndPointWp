
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Copy, Check, Globe, Code, Trash2, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  blogUrl: string;
  description: string;
  embedCode: string;
  status: 'active' | 'paused';
  posts: number;
  createdAt: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'California Personal Injury',
      blogUrl: 'https://www.californiapersonalinjurylawyersblog.com',
      description: 'Main blog for California PI law content',
      embedCode: generateEmbedCode('californiapersonalinjurylawyersblog'),
      status: 'active',
      posts: 1284,
      createdAt: '2024-01-15'
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    blogUrl: '',
    description: ''
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function generateEmbedCode(blogIdentifier: string): string {
    return `<?php
/**
 * Plugin Name: SEO Automation Hub - ${blogIdentifier}
 * Description: Embeds the Replit SEO Dashboard into WordPress Admin
 * Version: 1.0.0
 * Author: Replit Agent
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

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
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

    const blogIdentifier = newCampaign.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      blogUrl: newCampaign.blogUrl,
      description: newCampaign.description,
      embedCode: generateEmbedCode(blogIdentifier),
      status: 'active',
      posts: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({ name: '', blogUrl: '', description: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Campaña creada",
      description: `La campaña "${campaign.name}" ha sido creada exitosamente`
    });
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast({
      title: "Campaña eliminada",
      description: "La campaña ha sido eliminada"
    });
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
    ));
  };

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
              <Button onClick={handleCreateCampaign}>
                Crear Campaña
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                    <CardDescription className="mb-3">{campaign.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {campaign.blogUrl}
                      </span>
                      <span>{campaign.posts} publicaciones</span>
                      <span>Creada: {campaign.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleCampaignStatus(campaign.id)}
                  >
                    {campaign.status === 'active' ? 'Pausar' : 'Activar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-700"
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
                    {copiedId === campaign.id ? (
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
    </SidebarLayout>
  );
}
