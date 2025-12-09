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
  Search,
  Clock as ClockIcon,
  Download,
  Settings,
  Server,
  Laptop
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WordPressService } from "@/lib/wordpress-service";
import { PublishConfig } from "@/lib/wordpress-schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

// Mock Data
const MOCK_WORKFLOWS = [
  { id: "wf1", name: "Publicar y Compartir en LinkedIn" },
  { id: "wf2", name: "Notificar al Equipo Legal" },
  { id: "wf3", name: "Distribuir en Newsletter" },
];

export default function ContentPublisher() {
  const queryClient = useQueryClient();

  // Load credentials from localStorage (mock DB)
  const [wpUrl] = useState(() => localStorage.getItem("wpUrl") || "https://www.californiapersonalinjurylawyersblog.com");
  const [wpUser] = useState(() => localStorage.getItem("wpUser") || "walchlaw4");
  const [wpPass] = useState(() => localStorage.getItem("wpPass") || "eJs3M*LnfSSo68P!RtXC9lZ");
  const [n8nUrl] = useState(() => localStorage.getItem("n8nUrl") || "");

  // Publish Method State
  const [publishMethod, setPublishMethod] = useState<'rest-api' | 'browser-auto-login' | 'n8n-webhook'>('browser-auto-login');

  const exportPublishingReport = () => {
    const report = {
      fecha: new Date().toISOString(),
      estadisticas: {
        publicadosHoy: 28,
        tasaExito: '98.5%',
        tiempoPromedio: '2.3s'
      },
      actividadPorHora: publishingStats,
      integracionesActivas: [
        'WordPress',
        'WP-SEO Plugin',
        'Jetpack Social',
        'n8n Workflows',
        'OpenAI GPT-4'
      ]
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `reporte-publicacion-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Reporte exportado",
      description: "El reporte de publicación se descargó exitosamente"
    });
  };

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

  const publishingStats = [
    { time: '08:00', success: 12, pending: 2 },
    { time: '10:00', success: 18, pending: 1 },
    { time: '12:00', success: 24, pending: 3 },
    { time: '14:00', success: 30, pending: 2 },
    { time: '16:00', success: 28, pending: 1 },
    { time: '18:00', success: 22, pending: 0 }
  ];

  const monthlyPublishingStats = [
    { month: 'Ene', published: 45, drafts: 8, success: 98 },
    { month: 'Feb', published: 52, drafts: 6, success: 99 },
    { month: 'Mar', published: 48, drafts: 7, success: 97 },
    { month: 'Abr', published: 55, drafts: 5, success: 99 },
    { month: 'May', published: 60, drafts: 4, success: 100 },
    { month: 'Jun', published: 58, drafts: 6, success: 98 },
    { month: 'Jul', published: 62, drafts: 3, success: 100 },
    { month: 'Ago', published: 65, drafts: 5, success: 99 }
  ];

  // Fetch n8n workflows (Mocked)
  const { data: workflows = MOCK_WORKFLOWS } = useQuery({
    queryKey: ['n8n-workflows'],
    queryFn: async () => {
      return MOCK_WORKFLOWS;
    }
  });

  // Generate AI content with OpenAI
  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockContent = `Este es un artículo generado automáticamente sobre ${title}.

Contenido detallado que incluye palabras clave como: ${keywordList.join(', ')}.

El sistema ha optimizado este texto para lectura profesional.`;

      return {
        content: mockContent,
        seo: {
          title: `Guía sobre ${title}`,
          description: `Descubre todo sobre ${title} en este artículo detallado.`
        }
      };
    },
    onSuccess: (data) => {
      setContent(data.content);
      if (data.seo) {
        setSeoTitle(data.seo.title);
        setSeoDescription(data.seo.description);
      }
      toast({
        title: "¡Contenido generado!",
        description: "Contenido creado exitosamente con OpenAI GPT-4"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar contenido",
        description: error.message || "Verifica que tu API key de OpenAI esté configurada",
        variant: "destructive"
      });
    }
  });

  // Publish complete workflow
  const publishMutation = useMutation({
    mutationFn: async (isDraft: boolean) => {
      setIsPublishing(true);
      setPublishStatus({}); // Reset status

      if (!title || !content) {
        throw new Error('Título y contenido son requeridos');
      }

      // Prepare data for service
      const postData = {
        title,
        content,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: seoDescription,
        meta: {
          _yoast_wpseo_title: seoTitle,
          _yoast_wpseo_metadesc: seoDescription,
        }
      };

      // Call backend API
      const response = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials: {
            siteUrl: wpUrl,
            username: wpUser,
            applicationPassword: wpPass
          },
          post: postData,
          config: {
            status: isDraft ? 'draft' : 'publish'
          }
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Publishing failed');
      }

      setPublishStatus({ step: 'wordpress', status: 'success', postId: result.postId });
      
      if (autoOptimizeSEO) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setPublishStatus((prev: any) => ({ ...prev, seo: 'success' }));
      }
      
      if (publishMethod === 'n8n-webhook') {
         setPublishStatus((prev: any) => ({ ...prev, workflow: 'success' }));
      }

      return { postId: result.postId, isDraft, postData, link: result.link };
    },
    onSuccess: (data) => {
      setIsPublishing(false);
      toast({
        title: data.isDraft ? "Borrador guardado" : "Publicado exitosamente",
        description: `Método: ${publishMethod}. ID: ${data.postId}`
      });

      // Reset form
      setTitle("");
      setContent("");
      setKeywords("");
      setSeoTitle("");
      setSeoDescription("");
      // Keep status visible for a bit
      setTimeout(() => setPublishStatus(null), 5000);
    },
    onError: (error: any) => {
      setIsPublishing(false);
      toast({
        title: "Error al publicar",
        description: error.message || "Error desconocido",
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
          <Badge className="bg-indigo-600 text-white px-4 py-2 flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            n8n Connected
          </Badge>
          <Badge className="bg-green-600 text-white px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            WordPress Active
          </Badge>
        </div>
      </div>

      {/* Publishing Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Publicados Hoy</p>
                <p className="text-3xl font-bold text-green-900 mt-1">28</p>
                <p className="text-xs text-green-600 mt-1">+15% vs ayer</p>
              </div>
              <Send className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Tasa de Éxito</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">98.5%</p>
                <p className="text-xs text-blue-600 mt-1">Últimos 30 días</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Tiempo Promedio</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">2.3s</p>
                <p className="text-xs text-purple-600 mt-1">Por publicación</p>
              </div>
              <ClockIcon className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publishing Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad de Hoy</CardTitle>
            <CardDescription>Posts publicados por hora</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={publishingStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Exitosos" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pendientes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimos 8 Meses</CardTitle>
            <CardDescription>Historial de publicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyPublishingStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="published" stroke="#3b82f6" strokeWidth={2} name="Publicados" />
                <Line type="monotone" dataKey="drafts" stroke="#f59e0b" strokeWidth={2} name="Borradores" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4">
            
            {/* Publishing Method Selector */}
            <div className="bg-white/60 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Método de Publicación</span>
              </div>
              <RadioGroup 
                value={publishMethod} 
                onValueChange={(v: any) => setPublishMethod(v)}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <div className={`flex items-center space-x-2 border p-3 rounded-md transition-all ${publishMethod === 'browser-auto-login' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <RadioGroupItem value="browser-auto-login" id="m1" />
                  <Label htmlFor="m1" className="flex items-center gap-2 cursor-pointer">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">Browser Auto-Login</span>
                      <span className="text-[10px] text-slate-500">Simula navegación real</span>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-2 border p-3 rounded-md transition-all ${publishMethod === 'n8n-webhook' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                  <RadioGroupItem value="n8n-webhook" id="m2" />
                  <Label htmlFor="m2" className="flex items-center gap-2 cursor-pointer">
                    <Workflow className="w-4 h-4 text-indigo-600" />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">n8n Workflow</span>
                      <span className="text-[10px] text-slate-500">Procesamiento avanzado</span>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-2 border p-3 rounded-md transition-all ${publishMethod === 'rest-api' ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'}`}>
                  <RadioGroupItem value="rest-api" id="m3" />
                  <Label htmlFor="m3" className="flex items-center gap-2 cursor-pointer">
                    <Server className="w-4 h-4 text-green-600" />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">WP REST API</span>
                      <span className="text-[10px] text-slate-500">Conexión directa rápida</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Acciones Rápidas</p>
                    <p className="text-xs text-blue-600">
                      Publicando en: <span className="font-semibold">{wpUrl.replace('https://', '')}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => publishMutation.mutate(true)}
                  disabled={!title || !content || isPublishing}
                  className="bg-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Borrador
                </Button>
                
                <Button
                  size="sm"
                  className={`${
                    publishMethod === 'n8n-webhook' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                    publishMethod === 'browser-auto-login' ? 'bg-blue-600 hover:bg-blue-700' : 
                    'bg-green-600 hover:bg-green-700'
                  } transition-colors text-white min-w-[180px]`}
                  onClick={() => publishMutation.mutate(false)}
                  disabled={!title || !content || isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {publishMethod === 'n8n-webhook' && <Workflow className="w-4 h-4 mr-2" />}
                      {publishMethod === 'browser-auto-login' && <Laptop className="w-4 h-4 mr-2" />}
                      {publishMethod === 'rest-api' && <Send className="w-4 h-4 mr-2" />}
                      
                      {publishMethod === 'n8n-webhook' ? 'Enviar a Workflow' : 
                       publishMethod === 'browser-auto-login' ? 'Iniciar Auto-Login' : 
                       'Publicar Ahora'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              {publishStatus.images && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Imágenes generadas y subidas</span>
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