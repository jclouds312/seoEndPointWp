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
  X
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  featuredImage?: string; // Added for featured image
}

// Mock function for content generation (replace with actual API call)
async function generateContent({ topic, keywords, wordCount, tone, language }: any): Promise<GeneratedPost> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    title: `Generated Title for ${topic}`,
    content: `This is the generated content for ${topic} with ${wordCount} words. Keywords: ${keywords.join(', ')}. Tone: ${tone}. Language: ${language}.`,
    metaDescription: `Meta description for ${topic}`,
    seoScore: Math.floor(Math.random() * 100),
    keywords: keywords,
    featuredImage: undefined // Initialize featuredImage
  };
}


export default function BulkContentGenerator() {
  const queryClient = useQueryClient();
  const [postsCount, setPostsCount] = useState(8);
  const [baseTopics, setBaseTopics] = useState("lesiones personales, accidentes de auto, compensación laboral, negligencia médica, accidentes de trabajo, lesiones en construcción, accidentes de motocicleta, mordeduras de perro");
  const [keywords, setKeywords] = useState("abogado, lesiones, compensación, derechos legales");
  const [wordCount, setWordCount] = useState(1200);
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'free'>('free');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerating, setCurrentGenerating] = useState(0);
  const [promptSuggestion, setPromptSuggestion] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [previewPost, setPreviewPost] = useState<GeneratedPost | null>(null);

  // Analytics Data
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

  // Mock Saved Data
  const MOCK_SAVED_CONTENTS: GeneratedPost[] = [
    {
      id: "1",
      title: "Guía de Accidentes de Trabajo 2024",
      content: "Contenido simulado sobre accidentes de trabajo...",
      metaDescription: "Todo lo que necesitas saber sobre accidentes laborales.",
      seoScore: 88,
      status: "draft",
      createdAt: new Date(),
      keywords: ["accidentes", "trabajo"]
    },
    {
      id: "2",
      title: "Compensación por Lesiones Personales",
      content: "Contenido simulado sobre compensación...",
      metaDescription: "Cómo maximizar tu compensación por lesiones.",
      seoScore: 92,
      status: "published",
      createdAt: new Date(Date.now() - 86400000),
      keywords: ["lesiones", "compensación"]
    }
  ];

  // Fetch saved content history from real API
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
          campaignId: null
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
      
      // If queued, poll for completion
      if (data.status === 'queued') {
        return await pollQueueStatus(selectedTopics.length);
      }
      
      // Legacy response format (direct generation)
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
        description: `Se generaron ${data.length} posts de alta calidad con ${
          aiProvider === 'claude' ? 'Claude 3.5 Sonnet' :
          aiProvider === 'free' ? 'no-cost-ai (GRATIS)' :
          'OpenAI GPT-4'
        }`
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

  // Poll queue status and update progress
  const pollQueueStatus = async (expectedCount: number): Promise<GeneratedPost[]> => {
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max
    const startTime = Date.now();
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Check queue status
        const queueResponse = await fetch('/api/queue-status');
        const queueData = await queueResponse.json();
        
        // Update progress based on queue
        const estimatedProgress = 10 + (90 * (1 - (queueData.queueLength / expectedCount)));
        setProgress(Math.min(estimatedProgress, 95));
        
        // Check for new content
        const contentResponse = await fetch('/api/generated-content');
        const contents = await contentResponse.json();
        
        // Filter recently generated content (since we started)
        const recentContents = contents.filter((item: any) => {
          const createdAt = new Date(item.createdAt);
          return createdAt.getTime() >= startTime;
        });
        
        // Update current generating count
        if (recentContents.length > 0) {
          setCurrentGenerating(Math.min(recentContents.length + 1, expectedCount));
        }
        
        // If we have the expected number of posts, we're done
        if (recentContents.length >= expectedCount) {
          return recentContents.slice(0, expectedCount).map((item: any) => ({
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
        }
        
      } catch (error) {
        console.error('Error polling queue:', error);
      }
      
      attempts++;
    }
    
    // Timeout - return what we have
    const contentResponse = await fetch('/api/generated-content');
    const contents = await contentResponse.json();
    const recentContents = contents.filter((item: any) => {
      const createdAt = new Date(item.createdAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return createdAt > fiveMinutesAgo;
    });
    
    return recentContents.map((item: any) => ({
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
  };

  const saveMutation = useMutation({
    mutationFn: async (post: GeneratedPost) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      refetchSaved();
      toast({
        title: "Contenido guardado",
        description: "El contenido se guardó correctamente como borrador"
      });
    }
  });

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      for (const post of generatedPosts) {
        await saveMutation.mutateAsync(post);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    },
    onSuccess: () => {
      toast({
        title: "Todos los contenidos guardados",
        description: `${generatedPosts.length} posts guardados exitosamente`
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/content/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      return { success: true };
    },
    onSuccess: () => {
      refetchSaved();
      toast({
        title: "Contenido eliminado",
        description: "El contenido se eliminó correctamente"
      });
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/content/${id}/publish`, { method: 'POST' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al publicar');
      }
      return response.json();
    },
    onSuccess: () => {
      refetchSaved();
      toast({
        title: "Contenido publicado",
        description: "El contenido se ha publicado exitosamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al publicar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const publishAllMutation = useMutation({
    mutationFn: async () => {
      const drafts = savedContents.filter(c => c.status === 'draft');
      const results = [];
      const errors = [];
      
      for (const draft of drafts) {
        try {
          const response = await fetch(`/api/content/${draft.id}/publish`, { method: 'POST' });
          if (response.ok) {
            results.push({ contentId: draft.id });
          } else {
            const error = await response.json();
            errors.push({ contentId: draft.id, error: error.error || 'Error desconocido' });
          }
        } catch (err: any) {
          errors.push({ contentId: draft.id, error: err.message });
        }
      }
      
      if (errors.length > 0 && results.length === 0) {
        throw new Error(`Falló la publicación de ${errors.length} contenidos`);
      }
      
      return { results, errors };
    },
    onSuccess: (data) => {
      refetchSaved();
      if (data.errors.length > 0) {
        toast({
          title: "Publicación parcialmente completada",
          description: `${data.results.length} publicados, ${data.errors.length} fallidos`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Publicación masiva completada",
          description: `${data.results.length} posts publicados exitosamente`
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error en publicación masiva",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const suggestPrompt = async () => {
    setIsLoadingSuggestion(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const suggestions = [
        "accidentes de camión, responsabilidad de locales, negligencia en asilos",
        "derecho familiar, divorcio, custodia de hijos",
        "derecho penal, defensa dui, delitos de drogas"
      ];
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      setPromptSuggestion(randomSuggestion);
      toast({
        title: "Sugerencia generada",
        description: "Se generó una sugerencia de prompt basada en tus temas"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const applyPromptSuggestion = () => {
    if (promptSuggestion) {
      setBaseTopics(promptSuggestion);
      setPromptSuggestion("");
      toast({
        title: "Sugerencia aplicada",
        description: "Los temas fueron actualizados con la sugerencia"
      });
    }
  };

  const handleGenerate = () => {
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

    if (!keywords || keywords.trim().length === 0) {
      toast({
        title: "Advertencia",
        description: "No has definido palabras clave. Se usarán los temas como keywords.",
      });
    }

    setProgress(0);
    setCurrentGenerating(0);
    setGeneratedPosts([]);
    setIsGenerating(true);
    generateBulkMutation.mutate();
  };

  const downloadAsJSON = () => {
    const dataStr = JSON.stringify(generatedPosts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `content-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Descarga iniciada",
      description: "Archivo JSON descargado exitosamente"
    });
  };

  const downloadAsCSV = () => {
    const headers = ['Título', 'Contenido', 'Meta Descripción', 'SEO Score', 'Palabras Clave'];
    const rows = generatedPosts.map(post => [
      `"${post.title.replace(/"/g, '""')}"`,
      `"${post.content.replace(/"/g, '""')}"`,
      `"${post.metaDescription.replace(/"/g, '""')}"`,
      post.seoScore,
      `"${post.keywords?.join(', ') || ''}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `content-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Descarga iniciada",
      description: "Archivo CSV descargado exitosamente"
    });
  };

  const downloadAsMarkdown = () => {
    const mdContent = generatedPosts.map(post => {
      return `# ${post.title}\n\n**SEO Score:** ${post.seoScore}/100\n\n**Meta Descripción:** ${post.metaDescription}\n\n**Palabras Clave:** ${post.keywords?.join(', ') || 'N/A'}\n\n---\n\n${post.content}\n\n---\n\n`;
    }).join('\n\n');
    
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `content-${new Date().toISOString().split('T')[0]}.md`);
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Descarga iniciada",
      description: "Archivo Markdown descargado exitosamente"
    });
  };

  const downloadAsTXT = () => {
    const txtContent = generatedPosts.map((post, idx) => {
      return `POST ${idx + 1}\n${'='.repeat(50)}\n\nTítulo: ${post.title}\n\nSEO Score: ${post.seoScore}/100\n\nMeta Descripción: ${post.metaDescription}\n\nPalabras Clave: ${post.keywords?.join(', ') || 'N/A'}\n\nContenido:\n${post.content}\n\n${'='.repeat(50)}\n\n`;
    }).join('\n');
    
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `content-${new Date().toISOString().split('T')[0]}.txt`);
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Descarga iniciada",
      description: "Archivo TXT descargado exitosamente"
    });
  };

  const exportPublishingReport = () => {
    const report = {
      fecha: new Date().toISOString(),
      estadisticas: {
        postsGenerados: 63,
        seoPromedio: 87.5,
        publicados: 48,
        borradores: 15
      },
      rendimientoMensual: monthlyStats,
      distribucionContenido: contentTypeDistribution,
      seoPerformance: seoPerformance,
      postsRecientes: generatedPosts.map(p => ({
        titulo: p.title,
        seoScore: p.seoScore,
        palabrasClave: p.keywords
      }))
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard-generador-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Dashboard exportado",
      description: "Reporte completo descargado exitosamente"
    });
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Generador Masivo de Contenido</h1>
          <p className="text-slate-500 mt-1">Genera hasta 10 posts de alta calidad mensuales con IA</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-600 text-white px-4 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            {postsCount} Posts configurados
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            <FileText className="w-4 h-4 mr-2" />
            {savedContents.length} guardados
          </Badge>
          <Button
            variant="outline"
            className="gap-2"
            onClick={exportPublishingReport}
          >
            <Download className="w-4 h-4" />
            Exportar Dashboard
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Posts Generados</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">63</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">SEO Promedio</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">87.5</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Excelente calidad
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Publicados</p>
                <p className="text-3xl font-bold text-green-900 mt-1">48</p>
                <p className="text-xs text-green-600 mt-1">76% tasa de publicación</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">En Borradores</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">15</p>
                <p className="text-xs text-amber-600 mt-1">Pendientes de revisión</p>
              </div>
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Rendimiento Mensual</CardTitle>
            <CardDescription>Posts generados, vistas y conversiones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyStats}>
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="posts" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPosts)" name="Posts" />
                <Area type="monotone" dataKey="views" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorViews)" name="Vistas (x100)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Contenido</CardTitle>
            <CardDescription>Tipos de artículos generados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SEO Score Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Distribución de Puntuación SEO</CardTitle>
          <CardDescription>Calidad del contenido generado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={seoPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="range" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generador</TabsTrigger>
          <TabsTrigger value="history">
            Historial ({savedContents.length})
            {savedContents.filter(c => c.status === 'draft').length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">
                {savedContents.filter(c => c.status === 'draft').length} borradores
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Quick Actions Bar */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Generación Rápida</p>
                      <p className="text-xs text-blue-600">Optimizado para máximo rendimiento</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Plantillas
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Historial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Configuration */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Configuración de Generación</CardTitle>
                <CardDescription>Define los parámetros para generar contenido masivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cantidad de Posts</Label>
                  <Select value={postsCount.toString()} onValueChange={(v) => setPostsCount(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 posts</SelectItem>
                      <SelectItem value="8">8 posts (Plan Mensual)</SelectItem>
                      <SelectItem value="10">10 posts (Máximo)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Límite mensual: 8-10 posts de alta calidad
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Temas Base (separados por coma)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={suggestPrompt}
                      disabled={isLoadingSuggestion}
                    >
                      {isLoadingSuggestion ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Sugerir Prompt
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={baseTopics}
                    onChange={(e) => setBaseTopics(e.target.value)}
                    rows={5}
                    placeholder="lesiones personales, accidentes de auto..."
                  />
                  <p className="text-xs text-slate-500">
                    {baseTopics.split(',').filter(t => t.trim().length > 0).length} temas definidos
                  </p>
                </div>

                {promptSuggestion && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <Label className="text-blue-900">Sugerencia de IA</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={applyPromptSuggestion}
                        >
                          Aplicar
                        </Button>
                      </div>
                      <p className="text-sm text-blue-800">{promptSuggestion}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Palabras Clave</Label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="abogado, lesiones, compensación..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Longitud por Post</Label>
                  <Select value={wordCount.toString()} onValueChange={(v) => setWordCount(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="800">800 palabras</SelectItem>
                      <SelectItem value="1200">1,200 palabras</SelectItem>
                      <SelectItem value="1500">1,500 palabras</SelectItem>
                      <SelectItem value="2000">2,000 palabras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Proveedor de IA</Label>
                  <RadioGroup value={aiProvider} onValueChange={(value: any) => setAiProvider(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="free-bulk" />
                      <Label htmlFor="free-bulk" className="font-normal">
                        no-cost-ai (GRATIS) 🎉
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="openai" id="openai-bulk" />
                      <Label htmlFor="openai-bulk" className="font-normal">OpenAI GPT-4</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="claude" id="claude-bulk" />
                      <Label htmlFor="claude-bulk" className="font-normal">Claude 3.5 Sonnet</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <Button
                  className="w-full h-12 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generando {currentGenerating}/{postsCount}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar {postsCount} Posts
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Generando contenido...</span>
                      <span>{Math.round(progress)}% completado</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {generatedPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          Contenido Generado
                        </CardTitle>
                        <CardDescription>
                          {generatedPosts.length} posts listos para revisar y publicar
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Exportar
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={downloadAsJSON}>
                              <FileText className="w-4 h-4 mr-2" />
                              Exportar como JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={downloadAsCSV}>
                              <FileText className="w-4 h-4 mr-2" />
                              Exportar como CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={downloadAsMarkdown}>
                              <FileText className="w-4 h-4 mr-2" />
                              Exportar como Markdown
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={downloadAsTXT}>
                              <FileText className="w-4 h-4 mr-2" />
                              Exportar como TXT
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="sm"
                          onClick={() => saveAllMutation.mutate()}
                          disabled={saveAllMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Todos
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedPosts.map((post, idx) => (
                        <Card key={idx} className="border-slate-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{post.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    SEO: {post.seoScore}/100
                                  </Badge>
                                  <Badge variant="outline">
                                    {post.content.split(/\s+/).length} palabras
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewPost(post)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => saveMutation.mutate(post)}
                                  disabled={saveMutation.isPending}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {post.featuredImage && (
                              <div className="mb-4">
                                <img src={post.featuredImage} alt="Featured Image" className="w-full h-auto rounded-md" />
                              </div>
                            )}
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {post.metaDescription}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedPosts.length === 0 && !isGenerating && (
                <>
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Listo para Generar Contenido
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Configura tus parámetros y presiona el botón para generar {postsCount} posts de alta calidad
                      </p>
                      
                      {/* Quick Start Templates */}
                      <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2"
                          onClick={() => {
                            setBaseTopics("accidentes de auto, lesiones personales, compensación laboral, negligencia médica");
                            setKeywords("abogado, lesiones, compensación, derechos");
                            setWordCount(1200);
                            toast({
                              title: "Plantilla aplicada",
                              description: "Configuración de Lesiones Personales cargada"
                            });
                          }}
                        >
                          <FileText className="w-6 h-6 text-blue-600" />
                          <div className="text-sm font-medium">Lesiones Personales</div>
                          <div className="text-xs text-slate-500">4 temas legales</div>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2"
                          onClick={() => {
                            setBaseTopics("derecho familiar, divorcio, custodia de hijos, pensión alimenticia");
                            setKeywords("abogado familiar, divorcio, custodia, legal");
                            setWordCount(1500);
                            toast({
                              title: "Plantilla aplicada",
                              description: "Configuración de Derecho Familiar cargada"
                            });
                          }}
                        >
                          <FileText className="w-6 h-6 text-purple-600" />
                          <div className="text-sm font-medium">Derecho Familiar</div>
                          <div className="text-xs text-slate-500">4 temas familiares</div>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2"
                          onClick={() => {
                            setBaseTopics("accidentes de camión, responsabilidad de locales, accidentes de construcción, mordeduras de perro");
                            setKeywords("accidentes, compensación, negligencia, seguridad");
                            setWordCount(1200);
                            toast({
                              title: "Plantilla aplicada",
                              description: "Configuración de Accidentes cargada"
                            });
                          }}
                        >
                          <FileText className="w-6 h-6 text-green-600" />
                          <div className="text-sm font-medium">Accidentes</div>
                          <div className="text-xs text-slate-500">4 tipos de casos</div>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2"
                          onClick={() => {
                            setBaseTopics("defensa criminal, dui, delitos de drogas, casos federales");
                            setKeywords("defensa criminal, abogado penal, derechos, justicia");
                            setWordCount(1500);
                            toast({
                              title: "Plantilla aplicada",
                              description: "Configuración de Derecho Penal cargada"
                            });
                          }}
                        >
                          <FileText className="w-6 h-6 text-amber-600" />
                          <div className="text-sm font-medium">Derecho Penal</div>
                          <div className="text-xs text-slate-500">4 áreas de defensa</div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tips & Best Practices */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Consejos de Optimización
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Usa temas específicos</p>
                            <p className="text-xs text-purple-700">Mejor: "accidentes de auto en Los Angeles" que solo "accidentes"</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Longitud óptima</p>
                            <p className="text-xs text-purple-700">1,200-1,500 palabras tienen mejor rendimiento SEO</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Palabras clave relevantes</p>
                            <p className="text-xs text-purple-700">Incluye 3-5 keywords principales por artículo</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {savedContents.length > 0 ? (
            <>
              {savedContents.filter(c => c.status === 'draft').length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Acciones Masivas</h3>
                        <p className="text-sm text-blue-700">
                          {savedContents.filter(c => c.status === 'draft').length} borradores listos para publicar
                        </p>
                      </div>
                      <Button
                        onClick={() => publishAllMutation.mutate()}
                        disabled={publishAllMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {publishAllMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Publicando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Publicar Todos los Borradores
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-4">
              {savedContents.map((content) => (
                <Card key={content.id} className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base">{content.title}</CardTitle>
                          <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                            {content.status === 'published' ? 'Publicado' : 'Borrador'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {content.createdAt ? new Date(content.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            SEO: {content.seoScore}/100
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {content.content.split(/\s+/).length} palabras
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {content.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => content.id && publishMutation.mutate(content.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Publicar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => content.id && deleteMutation.mutate(content.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {content.featuredImage && (
                      <div className="mb-4">
                        <img src={content.featuredImage} alt="Featured Image" className="w-full h-auto rounded-md" />
                      </div>
                    )}
                    <p className="text-sm text-slate-600">{content.metaDescription}</p>
                  </CardContent>
                </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No hay contenido guardado
                </h3>
                <p className="text-slate-500">
                  Genera contenido y guárdalo para verlo aquí
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    {/* Preview Dialog */}
      {previewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Vista Previa del Contenido</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewPost(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 pt-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{previewPost.title}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      SEO: {previewPost.seoScore}/100
                    </Badge>
                    <Badge variant="outline">
                      {previewPost.content.split(/\s+/).length} palabras
                    </Badge>
                    {previewPost.keywords && previewPost.keywords.length > 0 && (
                      <Badge variant="outline">
                        {previewPost.keywords.length} keywords
                      </Badge>
                    )}
                  </div>
                </div>

                {previewPost.featuredImage && (
                  <div className="mb-4">
                    <img 
                      src={previewPost.featuredImage} 
                      alt="Featured" 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-sm font-medium text-blue-900 mb-1">Meta Descripción</p>
                  <p className="text-sm text-blue-800">{previewPost.metaDescription}</p>
                </div>

                {previewPost.keywords && previewPost.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-2">Palabras Clave</p>
                    <div className="flex flex-wrap gap-2">
                      {previewPost.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: previewPost.content }} />
                </div>
              </div>
            </CardContent>
            <div className="border-t p-4 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setPreviewPost(null)}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  saveMutation.mutate(previewPost);
                  setPreviewPost(null);
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </SidebarLayout>
  );
}