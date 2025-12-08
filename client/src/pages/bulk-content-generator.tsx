
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Sparkles,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock as ClockIcon,
  TrendingUp,
  FileText,
  Save,
  Trash2,
  Eye,
  Send,
  Globe,
  X,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface GeneratedPost {
  id?: string;
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
  keywords?: string[];
  status?: 'draft' | 'published';
  createdAt?: Date;
  featuredImage?: string;
}

export default function BulkContentGenerator() {
  const queryClient = useQueryClient();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const [postsCount, setPostsCount] = useState(4);
  const [baseTopics, setBaseTopics] = useState("lesiones personales, accidentes de auto, compensación laboral, negligencia médica, accidentes de trabajo, lesiones en construcción, accidentes de motocicleta, mordeduras de perro");
  const [keywords, setKeywords] = useState("abogado, lesiones, compensación, derechos legales");
  const [wordCount, setWordCount] = useState(1200);
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'gemini' | 'free'>('gemini');
  const [apiKey, setApiKey] = useState(""); // API Key state
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerating, setCurrentGenerating] = useState(0);
  const [promptSuggestion, setPromptSuggestion] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [previewPost, setPreviewPost] = useState<GeneratedPost | null>(null);
  const [activeTab, setActiveTab] = useState<string>("generator");

  useEffect(() => {
    const autoGenerate = searchParams.get('auto');
    const showResults = searchParams.get('results');
    
    if (showResults === 'true' && savedContents.length > 0) {
      setActiveTab('history');
      toast({
        title: "Mostrando resultados guardados",
        description: `Tienes ${savedContents.length} contenidos generados`
      });
    } else if (autoGenerate === 'true' && !isGenerating && baseTopics.trim()) {
      setTimeout(() => {
        handleGenerate();
      }, 500);
    }
  }, [searchParams]);

  const monthlyStats = [
    { month: 'Ene', posts: 8, views: 1200, conversions: 45 },
    { month: 'Feb', posts: 10, views: 1800, conversions: 68 },
    { month: 'Mar', posts: 8, views: 2100, conversions: 89 },
    { month: 'Abr', posts: 9, views: 2400, conversions: 102 },
    { month: 'May', posts: 10, views: 2900, conversions: 128 },
    { month: 'Jun', posts: 8, views: 3200, conversions: 145 }
  ];

  const contentTypeDistribution = [
    { name: 'Artículos Legales', value: 45, color: '#3b82f6' },
    { name: 'Guías Prácticas', value: 30, color: '#8b5cf6' },
    { name: 'Casos de Estudio', value: 15, color: '#10b981' },
    { name: 'FAQs', value: 10, color: '#f59e0b' }
  ];

  const seoPerformance = [
    { range: '90-100', count: 12 },
    { range: '80-89', count: 18 },
    { range: '70-79', count: 8 },
    { range: '60-69', count: 3 }
  ];

  const { data: savedContents = [], refetch: refetchSaved } = useQuery<GeneratedPost[]>({
    queryKey: ['saved-contents'],
    queryFn: async () => {
      const response = await fetch('/api/generated-content');
      if (!response.ok) throw new Error('Error al cargar contenido');
      const data = await response.json();
      return data.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        content: item.content,
        metaDescription: item.metaDescription || '',
        seoScore: item.seoScore || 0,
        status: item.status as 'draft' | 'published',
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        keywords: item.keywords?.split(',').map((k: string) => k.trim()) || [],
        featuredImage: item.featuredImage
      }));
    }
  });

  const generateBulkMutation = useMutation({
    mutationFn: async () => {
      const topics = baseTopics.split(',').map(t => t.trim()).filter(t => t.length > 0);

      if (topics.length === 0) {
        throw new Error('Debes proporcionar al menos un tema');
      }

      const postsToGenerate = Math.min(postsCount, topics.length);
      const selectedTopics = topics.slice(0, postsToGenerate);

      setCurrentGenerating(1);
      setProgress(10);

      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: selectedTopics,
          keywords: keywords || selectedTopics.join(', '),
          wordCount,
          aiProvider,
          apiKey: aiProvider === 'gemini' ? apiKey : undefined,
          campaignId: null,
          bulkType: 'standard'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error al generar contenido masivo';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const results: GeneratedPost[] = data.contents.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        content: item.content,
        metaDescription: item.metaDescription || '',
        seoScore: item.seoScore || 85,
        status: item.status as 'draft' | 'published',
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        keywords: item.keywords?.split(',').map((k: string) => k.trim()) || [],
        featuredImage: item.featuredImage
      }));

      return results;
    },
    onSuccess: (data) => {
      setGeneratedPosts(data);
      setProgress(100);
      setCurrentGenerating(0);
      refetchSaved();
      toast({
        title: "¡Contenido generado exitosamente!",
        description: `Se generaron ${data.length} posts de alta calidad con ${aiProvider}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar contenido",
        description: error.message,
        variant: "destructive"
      });
      setProgress(0);
      setCurrentGenerating(0);
      setIsGenerating(false);
      setGeneratedPosts([]);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  // ... (otras mutaciones)

  const handleGenerate = () => {
    if (aiProvider === 'gemini' && !apiKey.trim()) {
      toast({
        title: "API Key Requerida",
        description: "Por favor, ingresa tu Google AI API Key para usar Gemini.",
        variant: "destructive"
      });
      return;
    }
    
    const topics = baseTopics.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    if (topics.length === 0) {
      toast({
        title: "Error",
        description: "Debes proporcionar al menos un tema",
        variant: "destructive"
      });
      return;
    }

    if (topics.length < postsCount) {
      toast({
        title: "Advertencia",
        description: `Solo tienes ${topics.length} temas, pero solicitaste ${postsCount} posts. Se generarán ${topics.length} posts.`,
      });
    }

    setProgress(0);
    setCurrentGenerating(0);
    setGeneratedPosts([]);
    setIsGenerating(true);
    generateBulkMutation.mutate();
  };
  
  // ... (el resto del componente permanece igual)


  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generador Masivo de Contenido</h1>
          <p className="text-slate-500 mt-1">Genera hasta 10 posts de alta calidad mensuales con IA</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-600 text-white px-4 py-2 text-base">
            <Calendar className="w-4 h-4 mr-2" />
            x{postsCount} Posts configurados
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            <FileText className="w-4 h-4 mr-2" />
            {savedContents.length} guardados
          </Badge>
          {savedContents.length > 0 && (
            <Button
              variant="default"
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => setActiveTab('history')}
            >
              <Eye className="w-4 h-4" />
              Ver Resultados
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Dashboard
          </Button>
        </div>
      </div>

      {/* ... (resto del JSX) */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="generator" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Generador
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" />
            Historial ({savedContents.length})
            {savedContents.filter(c => c.status === 'draft').length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">
                {savedContents.filter(c => c.status === 'draft').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/50 dark:to-blue-950/50 shadow-md">
              <CardHeader className="border-b border-purple-100 dark:border-purple-900 bg-white/50 dark:bg-slate-900/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Configuración de Generación
                </CardTitle>
                <CardDescription>Define los parámetros para generar contenido masivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                 {/* ... (otros campos) */}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Proveedor de IA</Label>
                  <RadioGroup value={aiProvider} onValueChange={(value: any) => setAiProvider(value)}>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <RadioGroupItem value="gemini" id="gemini-bulk" />
                      <Label htmlFor="gemini-bulk" className="font-normal cursor-pointer flex-1">Google Gemini</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <RadioGroupItem value="free" id="free-bulk" />
                      <Label htmlFor="free-bulk" className="font-normal cursor-pointer flex-1">No-Cost AI (Mock)</Label>
                    </div>
                    {/* Add other providers as needed */}
                  </RadioGroup>
                </div>

                {aiProvider === 'gemini' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Google AI API Key</Label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Ingresa tu clave de API"
                      className="bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
                
                 {/* ... (otros campos) */}

                <Separator className="my-4" />

                <Button
                  className="w-full h-14 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar x{postsCount} Posts
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Generando contenido...</span>
                      <span>{Math.round(progress)}% completado</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ... (results panel) */}
          </div>
        </TabsContent>

        {/* ... (history tab) */}
      </Tabs>

      {/* ... (preview dialog) */}
    </SidebarLayout>
  );
}
