import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Copy, Check, Globe, Trash2, RefreshCw, BarChart2, MoreHorizontal, Settings } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/lib/schema";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Campaigns() {
  const queryClient = useQueryClient();
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    blogUrl: '',
    description: '',
    niche: '',
    language: 'Español'
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch campaigns from database
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof newCampaign) => {
      const blogIdentifier = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const embedCode = generateEmbedCode(blogIdentifier);

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          blogUrl: data.blogUrl,
          description: data.description,
          embedCode,
          status: 'active',
          posts: 0,
          config: { niche: data.niche, language: data.language }
        })
      });

      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setNewCampaign({ name: '', blogUrl: '', description: '', niche: '', language: 'Español' });
      setIsDialogOpen(false);
      toast({
        title: "¡Éxito!",
        description: "Campaña creada exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña.",
        variant: "destructive"
      });
    }
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Eliminada",
        description: "Campaña eliminada exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la campaña.",
        variant: "destructive"
      });
    }
  });

  function generateEmbedCode(blogIdentifier: string): string {
    return `<?php
/**
 * Plugin Name: SEO Automation Hub - ${blogIdentifier}
 * Description: Embeds the Replit SEO Dashboard into WordPress Admin
 * Version: 2.0.0
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
      title: "Copied!",
      description: "Embed code copied to clipboard."
    });
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.blogUrl) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Name and Blog URL.",
        variant: "destructive"
      });
      return;
    }
    createCampaignMutation.mutate(newCampaign);
  };

  const handleDeleteCampaign = (id: number) => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
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
          <h1 className="text-3xl font-bold text-slate-900">Campaign Management</h1>
          <p className="text-slate-500 mt-1">Manage multiple WordPress sites and automation pipelines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Configure a new WordPress site for automated SEO content.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input 
                    id="name"
                    placeholder="e.g. Legal Blog West"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche">Niche / Industry</Label>
                  <Input 
                    id="niche"
                    placeholder="e.g. Legal, Health, Tech"
                    value={newCampaign.niche}
                    onChange={(e) => setNewCampaign({ ...newCampaign, niche: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">WordPress Site URL *</Label>
                <Input 
                  id="url"
                  placeholder="https://mysite.com"
                  value={newCampaign.blogUrl}
                  onChange={(e) => setNewCampaign({ ...newCampaign, blogUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description & Goals</Label>
                <Textarea 
                  id="desc"
                  placeholder="Describe the content strategy for this site..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lang">Content Language</Label>
                <Select 
                  value={newCampaign.language} 
                  onValueChange={(val) => setNewCampaign({...newCampaign, language: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCampaign} disabled={createCampaignMutation.isPending}>
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                        className={campaign.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                      >
                        {campaign.status === 'active' ? 'Active' : campaign.status}
                      </Badge>
                      {(campaign.config as any)?.language && (
                        <Badge variant="outline" className="text-slate-500">
                          {(campaign.config as any).language}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mb-3">{campaign.description || 'No description provided.'}</CardDescription>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <a href={campaign.blogUrl} target="_blank" rel="noreferrer" className="hover:underline hover:text-blue-600">
                          {campaign.blogUrl.replace('https://', '')}
                        </a>
                      </span>
                      <span className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-slate-400" />
                        {campaign.posts} posts generated
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Settings className="w-4 h-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="bg-slate-50/50 border-t border-slate-100 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-slate-900">WordPress Plugin Code</Label>
                    <p className="text-xs text-slate-500">Install this code in your WordPress site to enable connection</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleCopy(campaign.id, campaign.embedCode)}
                    className="h-8 gap-2 border-slate-200 hover:bg-white hover:text-blue-600"
                  >
                    {copiedId === campaign.id.toString() ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative group">
                  <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed max-h-32 group-hover:max-h-64 transition-all duration-300">
                    {campaign.embedCode}
                  </pre>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/10 pointer-events-none group-hover:hidden" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SidebarLayout>
  );
}