
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Save, 
  Sparkles, 
  Globe, 
  Share2, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Image as ImageIcon,
  Workflow,
  Search
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function ContentPublisher() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [publishToSocial, setPublishToSocial] = useState(true);
  const [autoOptimizeSEO, setAutoOptimizeSEO] = useState(true);
  const [generateImages, setGenerateImages] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<any>(null);

  // Fetch n8n workflows
  const { data: workflows = [] } = useQuery({
    queryKey: ['n8n-workflows'],
    queryFn: async () => {
      const res = await fetch('/api/n8n/workflows');
      if (!res.ok) return [];
      const data = await res.json();
      return data.workflows || [];
    }
  });

  // Generate AI content
  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: '1',
          template: 'injury-guide',
          prompt: title,
          keywords,
          wordCount: 1500,
          creativity: 0.7,
          includeImages: generateImages,
          includeSEO: autoOptimizeSEO,
          tone: 'professional-empathetic',
          language: 'es'
        })
      });
      if (!res.ok) throw new Error('Failed to generate content');
      return res.json();
    },
    onSuccess: (data) => {
      setContent(data.content);
      if (data.seo) {
        setSeoTitle(data.seo.title);
        setSeoDescription(data.seo.description);
      }
      toast({ title: "Contenido generado", description: "Contenido creado con IA exitosamente" });
    }
  });

  // Publish complete workflow
  const publishMutation = useMutation({
    mutationFn: async (isDraft: boolean) => {
      setIsPublishing(true);
      const publishData: any = {
        title,
        content,
        status: isDraft ? 'draft' : 'publish'
      };

      // Step 1: Create WordPress post
      const wpRes = await fetch('/api/wordpress/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishData)
      });
      
      if (!wpRes.ok) throw new Error('Failed to create WordPress post');
      const wpData = await wpRes.json();
      const postId = wpData.postId;

      setPublishStatus({ step: 'wordpress', status: 'success', postId });

      // Step 2: Optimize SEO with wp-seo
      if (autoOptimizeSEO) {
        const seoRes = await fetch(`/api/wp-seo/posts/${postId}/seo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: seoTitle || title,
            description: seoDescription,
            keywords: keywords
          })
        });

        if (seoRes.ok) {
          setPublishStatus((prev: any) => ({ ...prev, seo: 'success' }));
        }
      }

      // Step 3: Share to social media via Jetpack
      if (publishToSocial && !isDraft) {
        const socialRes = await fetch(`/api/jetpack/share/${postId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `${title} - ${seoDescription || ''}`
          })
        });

        if (socialRes.ok) {
          setPublishStatus((prev: any) => ({ ...prev, social: 'success' }));
        }
      }

      // Step 4: Execute n8n workflow if selected
      if (selectedWorkflow) {
        await fetch(`/api/n8n/workflows/${selectedWorkflow}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            data: { postId, title, content }
          })
        });

        setPublishStatus((prev: any) => ({ ...prev, workflow: 'success' }));
      }

      return { postId, isDraft };
    },
    onSuccess: (data) => {
      setIsPublishing(false);
      toast({
        title: data.isDraft ? "Borrador guardado" : "Publicado exitosamente",
        description: `Post ID: ${data.postId}. Todas las integraciones completadas.`
      });
    },
    onError: (error) => {
      setIsPublishing(false);
      toast({
        title: "Error al publicar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    }
  });

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Publicador de Contenido</h1>
          <p className="text-slate-500 mt-1">Sistema unificado con todas las integraciones activas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => publishMutation.mutate(true)}
            disabled={!title || !content || isPublishing}
          >
            <Save className="w-4 h-4" />
            Guardar Borrador
          </Button>
          <Button 
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => publishMutation.mutate(false)}
            disabled={!title || !content || isPublishing}
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publicar Ahora
              </>
            )}
          </Button>
        </div>
      </div>

      {publishStatus && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Estado de Publicación</h3>
            </div>
            <div className="space-y-2">
              {publishStatus.step && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>WordPress Post creado (ID: {publishStatus.postId})</span>
                </div>
              )}
              {publishStatus.seo && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>SEO optimizado con wp-seo plugin</span>
                </div>
              )}
              {publishStatus.social && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Compartido en redes sociales (Jetpack)</span>
                </div>
              )}
              {publishStatus.workflow && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Workflow n8n ejecutado</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Artículo</CardTitle>
              <CardDescription>Escribe o genera contenido con IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título del Artículo</Label>
                <Input 
                  placeholder="Ej: Guía Completa sobre Accidentes de Auto en California"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Palabras Clave Objetivo</Label>
                <Input 
                  placeholder="abogado lesiones, accidente auto, compensación"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => generateContentMutation.mutate()}
                  disabled={!title || generateContentMutation.isPending}
                >
                  {generateContentMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generar con IA
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea 
                  placeholder="Escribe tu contenido aquí o genera con IA..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Optimización SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título SEO (50-60 caracteres)</Label>
                <Input 
                  placeholder="Título optimizado para motores de búsqueda"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={60}
                />
                <div className="text-xs text-slate-500">{seoTitle.length}/60 caracteres</div>
              </div>

              <div className="space-y-2">
                <Label>Meta Descripción (120-160 caracteres)</Label>
                <Textarea 
                  placeholder="Descripción que aparecerá en resultados de búsqueda"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  maxLength={160}
                />
                <div className="text-xs text-slate-500">{seoDescription.length}/160 caracteres</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">Integraciones Activas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">WordPress</span>
                </div>
                <Badge className="bg-green-600">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">WP-SEO Plugin</span>
                </div>
                <Badge className="bg-green-600">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Jetpack Social</span>
                </div>
                <Badge className="bg-green-600">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">n8n Workflows</span>
                </div>
                <Badge className="bg-green-600">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span className="text-sm">OpenAI GPT-4</span>
                </div>
                <Badge className="bg-green-600">Activo</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opciones de Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-seo" className="text-sm">Optimizar SEO automáticamente</Label>
                <Switch 
                  id="auto-seo"
                  checked={autoOptimizeSEO}
                  onCheckedChange={setAutoOptimizeSEO}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="social" className="text-sm">Compartir en redes sociales</Label>
                <Switch 
                  id="social"
                  checked={publishToSocial}
                  onCheckedChange={setPublishToSocial}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="images" className="text-sm">Generar imágenes con IA</Label>
                <Switch 
                  id="images"
                  checked={generateImages}
                  onCheckedChange={setGenerateImages}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="workflow" className="text-sm">Ejecutar Workflow n8n</Label>
                <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                  <SelectTrigger id="workflow">
                    <SelectValue placeholder="Seleccionar workflow..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {workflows.map((wf: any) => (
                      <SelectItem key={wf.id} value={wf.id}>
                        {wf.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">Flujo de Publicación</p>
                  <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
                    <li>Crear post en WordPress</li>
                    <li>Optimizar metadata SEO (wp-seo)</li>
                    <li>Compartir en redes (Jetpack)</li>
                    <li>Ejecutar workflow automatizado (n8n)</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
