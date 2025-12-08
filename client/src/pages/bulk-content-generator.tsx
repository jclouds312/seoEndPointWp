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
  Clock,
  TrendingUp,
  FileText,
  Save,
  Trash2,
  Eye,
  Send
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

  // Fetch saved content history
  const { data: savedContents = [], refetch: refetchSaved } = useQuery<GeneratedPost[]>({
    queryKey: ['saved-contents'],
    queryFn: async () => {
      const response = await fetch('/api/content/list');
      if (!response.ok) throw new Error('Error al cargar contenido guardado');
      const data = await response.json();
      return data.contents;
    }
  });

  const generateBulkMutation = useMutation({
    mutationFn: async () => {
      const topics = baseTopics.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

      if (topics.length === 0) {
        throw new Error('Debes proporcionar al menos un tema');
      }

      const postsToGenerate = Math.min(postsCount, topics.length);
      const selectedTopics = topics.slice(0, postsToGenerate);

      const results: GeneratedPost[] = [];

      // Generate content one by one to show progress
      for (let i = 0; i < selectedTopics.length; i++) {
        setCurrentGenerating(i + 1);
        setProgress(((i + 1) / selectedTopics.length) * 100);

        let endpoint = '/api/generate-content';
        if (aiProvider === 'claude') endpoint = '/api/generate-content-claude';
        if (aiProvider === 'free') endpoint = '/api/generate-content-free';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: `${selectedTopics[i]} - Guía completa ${new Date().getFullYear()}`,
            keywords: keywordList.length > 0 ? keywordList : ['legal', 'abogado'],
            wordCount: wordCount + (i * 50), // Slight variation
            tone: i % 2 === 0 ? 'profesional-empático' : 'profesional-informativo',
            language: 'es',
            model: aiProvider === 'free' ? 'gpt-4o' : undefined
          })
        });

        if (!response.ok) {
          throw new Error(`Error generando contenido ${i + 1}`);
        }

        const data = await response.json();
        const generatedPost: GeneratedPost = {
          title: data.title,
          content: data.content,
          metaDescription: data.metaDescription,
          seoScore: data.seoScore,
          keywords: keywordList,
          featuredImage: undefined // Initialize featuredImage
        };

        // Generate featured image for each post
        try {
          const imageResponse = await fetch('/api/images/blog-header', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: generatedPost.title,
              keywords: keywordList.length > 0 ? keywordList : ['legal']
            })
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            generatedPost.featuredImage = imageData.imageUrl;
          } else {
             console.error('Error generating image:', imageResponse.statusText);
          }
        } catch (err) {
          console.error('Error generating image:', err);
        }

        results.push(generatedPost);

        // Small delay to avoid rate limits
        if (i < selectedTopics.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return results;
    },
    onSuccess: (data) => {
      setGeneratedPosts(data);
      setProgress(100);
      setCurrentGenerating(0);
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
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (post: GeneratedPost) => {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...post,
          status: 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar contenido');
      }

      return response.json();
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
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar contenido');
      }

      return response.json();
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
      const response = await fetch(`/api/content/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'published' })
      });

      if (!response.ok) {
        throw new Error('Error al publicar contenido');
      }

      return response.json();
    },
    onSuccess: () => {
      refetchSaved();
      toast({
        title: "Contenido publicado",
        description: "El contenido se marcó como publicado"
      });
    }
  });

  const handleGenerate = () => {
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
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generador</TabsTrigger>
          <TabsTrigger value="history">Historial ({savedContents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
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
                  <Label>Temas Base (separados por coma)</Label>
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
                    <p className="text-xs text-center text-slate-500">
                      {Math.round(progress)}% completado
                    </p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAsJSON}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar JSON
                        </Button>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveMutation.mutate(post)}
                                disabled={saveMutation.isPending}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
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
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Listo para Generar Contenido
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Configura tus parámetros y presiona el botón para generar {postsCount} posts de alta calidad
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {savedContents.length > 0 ? (
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
                            <Clock className="w-3 h-3" />
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
    </SidebarLayout>
  );
}