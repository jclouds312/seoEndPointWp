
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sparkles, RefreshCw, CheckCircle2, Info, ArrowLeft, FileText, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearch, useLocation, Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Tipos de datos
interface GeneratedPost { id?: string; title: string; content: string; metaDescription: string; seoScore: number; }
interface CampaignDetails { campaign: { id: string; name: string; }; }

export default function BulkContentGenerator() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const campaignId = searchParams.get('campaignId');

  // Estado del formulario
  const [postsCount, setPostsCount] = useState(4);
  const [baseTopics, setBaseTopics] = useState("lesiones personales, accidentes de auto, compensación laboral");
  const [keywords, setKeywords] = useState("abogado, miami, indemnización");
  const [wordCount, setWordCount] = useState(1200);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'free'>('gemini');
  const [apiKey, setApiKey] = useState("");

  // Estado de la UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  // Obtener detalles de la campaña si el ID está en la URL
  const { data: campaignData, isLoading: isLoadingCampaign } = useQuery<CampaignDetails>({
    queryKey: ['campaignDetails', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('No se pudieron cargar los detalles de la campaña');
      return response.json();
    },
    enabled: !!campaignId, // Solo se ejecuta si hay un campaignId
  });

  // Mutación para la generación masiva, ahora consciente de la campaña
  const generateBulkMutation = useMutation({
    mutationFn: async () => {
      const topics = baseTopics.split(',').map(t => t.trim()).filter(Boolean);
      if (topics.length === 0) throw new Error('Debes proporcionar al menos un tema.');

      const postsToGenerate = Math.min(postsCount, topics.length);
      const selectedTopics = topics.slice(0, postsToGenerate);

      setProgress(10);

      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: selectedTopics,
          keywords,
          wordCount,
          aiProvider,
          apiKey: aiProvider === 'gemini' ? apiKey : undefined,
          campaignId: campaignId, // <-- AQUÍ SE ENVÍA EL ID DE CAMPAÑA
          bulkType: 'standard'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido al generar contenido.');
      }

      const data = await response.json();
      setProgress(100);
      return data.contents as GeneratedPost[];
    },
    onSuccess: (data) => {
      setGeneratedPosts(data);
      queryClient.invalidateQueries({ queryKey: ['campaignDetails', campaignId] });
      toast({
        title: "¡Éxito!",
        description: `Se generaron ${data.length} posts para la campaña "${campaignData?.campaign.name || ''}".`,
      });

      // Redirección automática a la página de la campaña
      if (campaignId) {
        setTimeout(() => {
          setLocation(`/campaign/${campaignId}`);
        }, 1200); // Pequeño delay para que el usuario vea el mensaje
      }
    },
    onError: (error: any) => {
      toast({ title: "Error de Generación", description: error.message, variant: "destructive" });
      setIsGenerating(false);
      setProgress(0);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerate = () => {
    if (aiProvider === 'gemini' && !apiKey.trim()) {
      toast({ title: "Clave de API Requerida", description: "Ingresa tu Google AI API Key.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedPosts([]);
    generateBulkMutation.mutate();
  };

  return (
    <SidebarLayout>
      {/* Notificación de Contexto de Campaña */}
      {campaignId && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            {isLoadingCampaign ? (
              <div className="flex items-center gap-3"><RefreshCw className="w-4 h-4 animate-spin"/>Cargando campaña...</div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-blue-800">
                    Generando contenido para la campaña: "{campaignData?.campaign.name}"
                  </p>
                </div>
                <Link href={`/campaign/${campaignId}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3"/> Volver a la Campaña
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Generador Masivo de Contenido</h1>
          <p className="text-slate-500 mt-1">Define tus parámetros y crea múltiples artículos con IA.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel de Configuración */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Configuración</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* ... Campos del formulario ... */}
             <div className="space-y-2">
                <Label>Proveedor de IA</Label>
                <RadioGroup value={aiProvider} onValueChange={(v: any) => setAiProvider(v)}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="gemini" id="gemini" /><Label htmlFor="gemini">Google Gemini</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="free" id="free" /><Label htmlFor="free">Gratuito (Prueba)</Label></div>
                </RadioGroup>
            </div>

            {aiProvider === 'gemini' && (
                <div className="space-y-2">
                    <Label>Google AI API Key</Label>
                    <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Ingresa tu clave de API"/>
                </div>
            )}
            <div className="space-y-2">
                <Label>Temas Principales (separados por comas)</Label>
                <Textarea value={baseTopics} onChange={(e) => setBaseTopics(e.target.value)} placeholder="Ej: lesiones personales, accidentes de auto" rows={3} />
            </div>
             <div className="space-y-2">
                <Label>Palabras Clave Secundarias (separadas por comas)</Label>
                <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ej: abogado, indemnización" />
            </div>
             <div className="space-y-2">
                <Label>Número de Posts a Generar</Label>
                <Input type="number" value={postsCount} onChange={(e) => setPostsCount(Number(e.target.value))} min={1} />
            </div>

            <Separator className="my-4" />
            <Button className="w-full h-12 gap-2" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin"/>Generando...</> : <><Sparkles className="w-5 h-5"/>Generar Contenido</>}
            </Button>
            {isGenerating && <Progress value={progress} className="h-2 mt-2" />}
          </CardContent>
        </Card>

        {/* Panel de Resultados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resultados de la Generación</CardTitle>
            <CardDescription>Los posts generados aparecerán aquí.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating && generatedPosts.length === 0 && (
                <div className="text-center py-16"><RefreshCw className="mx-auto w-8 h-8 animate-spin text-blue-600"/><p className="mt-4 text-slate-500">La IA está trabajando... Esto puede tardar unos momentos.</p></div>
            )}
            {!isGenerating && generatedPosts.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg"><p className="text-slate-500">Los resultados aparecerán aquí después de la generación.</p></div>
            )}
            {generatedPosts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-green-600"><CheckCircle2/><h4>¡Generación completada! Serás redirigido en un momento.</h4></div>
                    {generatedPosts.map((post, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-slate-600 mt-1 truncate">{post.metaDescription}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs font-semibold">SEO Score: {post.seoScore}</span>
                             </div>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
