
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, RefreshCw, CheckCircle2, Info, ArrowLeft, FileText, Eye, TrendingUp, BarChart3, Target, Zap, Globe, AlertCircle, Download, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearch, useLocation, Link } from "wouter";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GeneratedPost { 
  id?: string; 
  title: string; 
  content: string; 
  metaDescription: string; 
  seoScore: number; 
  keywords?: string;
}

interface CampaignDetails { 
  campaign: { 
    id: string; 
    name: string; 
  }; 
}

interface GenerationStats {
  totalWords: number;
  avgSeoScore: number;
  topKeywords: string[];
  estimatedReadTime: number;
  qualityDistribution: { name: string; value: number }[];
  contentByTopic: { topic: string; count: number; avgScore: number }[];
  progressData: { post: number; score: number; words: number }[];
}

const LEGAL_TOPICS = [
  "Accidentes de Auto en California",
  "Lesiones por Mordedura de Perro",
  "Accidentes de Motocicleta",
  "Accidentes Peatonales",
  "Lesiones en Accidentes de Camión",
  "Compensación Laboral",
  "Resbalones y Caídas",
  "Muerte Injusta (Wrongful Death)",
  "Lesiones Cerebrales Traumáticas (TBI)",
  "Fracturas y Lesiones Ortopédicas"
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BulkContentGenerator() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const campaignId = searchParams.get('campaignId');

  const [postsCount, setPostsCount] = useState(9);
  const [baseTopics, setBaseTopics] = useState("accidentes de auto, mordeduras de perro, lesiones peatonales");
  const [keywords, setKeywords] = useState("abogado California, compensación, indemnización, Southern California");
  const [wordCount, setWordCount] = useState(1200);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'free'>('gemini');
  const [apiKey, setApiKey] = useState("");
  const [tone, setTone] = useState("professional");
  const [targetRegion, setTargetRegion] = useState("california");

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data: campaignData, isLoading: isLoadingCampaign } = useQuery<CampaignDetails>({
    queryKey: ['campaignDetails', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('No se pudieron cargar los detalles de la campaña');
      return response.json();
    },
    enabled: !!campaignId,
  });

  const calculateStats = (posts: GeneratedPost[]): GenerationStats => {
    const totalWords = posts.reduce((sum, post) => sum + post.content.split(' ').length, 0);
    const avgSeoScore = posts.reduce((sum, post) => sum + post.seoScore, 0) / posts.length;
    
    const allKeywords = posts.flatMap(p => 
      (p.keywords || p.metaDescription).split(/[,\s]+/).filter(k => k.length > 3)
    );
    const keywordFreq = allKeywords.reduce((acc: Record<string, number>, k) => {
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const topKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

    const estimatedReadTime = Math.ceil(totalWords / 200);

    const qualityDistribution = [
      { name: 'Excelente (90-100)', value: posts.filter(p => p.seoScore >= 90).length },
      { name: 'Muy Bueno (80-89)', value: posts.filter(p => p.seoScore >= 80 && p.seoScore < 90).length },
      { name: 'Bueno (70-79)', value: posts.filter(p => p.seoScore >= 70 && p.seoScore < 80).length },
      { name: 'Aceptable (<70)', value: posts.filter(p => p.seoScore < 70).length }
    ];

    const topicMap: Record<string, { count: number; totalScore: number }> = {};
    posts.forEach(p => {
      const topic = p.title.split(':')[0].trim();
      if (!topicMap[topic]) topicMap[topic] = { count: 0, totalScore: 0 };
      topicMap[topic].count++;
      topicMap[topic].totalScore += p.seoScore;
    });

    const contentByTopic = Object.entries(topicMap).map(([topic, data]) => ({
      topic: topic.length > 25 ? topic.substring(0, 25) + '...' : topic,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count)
    }));

    const progressData = posts.map((p, i) => ({
      post: i + 1,
      score: p.seoScore,
      words: p.content.split(' ').length
    }));

    return {
      totalWords,
      avgSeoScore: Math.round(avgSeoScore),
      topKeywords,
      estimatedReadTime,
      qualityDistribution: qualityDistribution.filter(q => q.value > 0),
      contentByTopic,
      progressData
    };
  };

  const generateBulkMutation = useMutation({
    mutationFn: async () => {
      const topics = baseTopics.split(',').map(t => t.trim()).filter(Boolean);
      if (topics.length === 0) throw new Error('Debes proporcionar al menos un tema.');

      const postsToGenerate = Math.min(postsCount, topics.length * 3);
      const expandedTopics: string[] = [];
      
      topics.forEach(topic => {
        expandedTopics.push(topic);
        expandedTopics.push(`${topic} en ${targetRegion === 'california' ? 'California' : 'Texas'}`);
        expandedTopics.push(`Guía completa sobre ${topic}`);
      });

      const selectedTopics = expandedTopics.slice(0, postsToGenerate);

      setProgress(0);
      setCurrentPostIndex(0);

      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: selectedTopics,
          keywords,
          wordCount,
          aiProvider,
          apiKey: aiProvider === 'gemini' ? apiKey : undefined,
          campaignId: campaignId,
          bulkType: 'standard',
          tone,
          targetRegion
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido al generar contenido.');
      }

      const data = await response.json();
      
      for (let i = 0; i < data.contents.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCurrentPostIndex(i + 1);
        setProgress(Math.round(((i + 1) / data.contents.length) * 100));
        setGeneratedPosts(prev => [...prev, data.contents[i]]);
      }

      return data.contents as GeneratedPost[];
    },
    onSuccess: (data) => {
      setStats(calculateStats(data));
      setShowAnalytics(true);
      queryClient.invalidateQueries({ queryKey: ['campaignDetails', campaignId] });
      toast({
        title: "¡Generación Completada!",
        description: `Se generaron ${data.length} posts optimizados para SEO legal.`,
      });
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
    setStats(null);
    setShowAnalytics(false);
    generateBulkMutation.mutate();
  };

  const handlePublishToWordPress = async () => {
    if (generatedPosts.length === 0) {
      toast({ title: "Sin contenido", description: "Genera contenido primero.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api/wordpress/auto-publish-browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: 'https://www.californiapersonalinjurylawyersblog.com',
          username: 'walchlaw4',
          password: 'eJs3M*LnfSSo68P!RtXC9lZ',
          useN8n: true,
          postsPerMonth: 9,
          posts: generatedPosts.map(p => ({
            title: p.title,
            content: p.content,
            tags: p.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
            status: 'publish'
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "¡Publicación Exitosa!",
          description: `${result.published} de ${result.total} posts publicados en WordPress`,
        });
      } else {
        throw new Error(result.error || 'Fallo al publicar');
      }
    } catch (error: any) {
      toast({
        title: "Error de Publicación",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarLayout>
      {campaignId && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            {isLoadingCampaign ? (
              <div className="flex items-center gap-3"><RefreshCw className="w-4 h-4 animate-spin"/>Cargando campaña...</div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-blue-800">
                    Campaña: "{campaignData?.campaign.name}"
                  </p>
                </div>
                <Link href={`/campaign/${campaignId}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3"/> Volver
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Generador Masivo de Contenido Legal
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            Genera hasta 9 posts/mes optimizados para bufetes de abogados en California
          </p>
        </div>
        {generatedPosts.length > 0 && (
          <Button onClick={handlePublishToWordPress} className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Zap className="w-4 h-4" /> Publicar en WordPress
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Globe className="w-4 h-4 text-slate-500" />
                Región Objetivo
              </Label>
              <Select value={targetRegion} onValueChange={setTargetRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="california">California (Southern CA prioridad)</SelectItem>
                  <SelectItem value="texas">Texas</SelectItem>
                  <SelectItem value="florida">Florida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Proveedor de IA</Label>
              <RadioGroup value={aiProvider} onValueChange={(v: any) => setAiProvider(v)}>
                <div className="flex items-center space-x-2 p-2 rounded border border-green-200 bg-green-50">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini" className="flex-1 cursor-pointer">Google Gemini (Recomendado)</Label>
                  <Badge className="bg-green-600 text-white text-xs">Mejor SEO</Badge>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded border">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="cursor-pointer">Gratuito (Prueba)</Label>
                </div>
              </RadioGroup>
            </div>

            {aiProvider === 'gemini' && (
              <div className="space-y-2">
                <Label>Google AI API Key</Label>
                <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Ingresa tu clave de API"/>
                <p className="text-xs text-slate-500">
                  Obtén tu clave gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label>Temas Principales (separados por comas)</Label>
              <Textarea 
                value={baseTopics} 
                onChange={(e) => setBaseTopics(e.target.value)} 
                placeholder="Ej: accidentes de auto, mordeduras de perro" 
                rows={3}
                className="font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {LEGAL_TOPICS.slice(0, 4).map((topic, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setBaseTopics(prev => prev ? `${prev}, ${topic}` : topic)}
                  >
                    + {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Palabras Clave Secundarias</Label>
              <Input 
                value={keywords} 
                onChange={(e) => setKeywords(e.target.value)} 
                placeholder="Ej: abogado, indemnización, compensación" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Posts a Generar</Label>
                <Input type="number" value={postsCount} onChange={(e) => setPostsCount(Number(e.target.value))} min={1} max={9} />
              </div>
              <div className="space-y-2">
                <Label>Palabras por Post</Label>
                <Input type="number" value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} min={500} max={3000} step={100} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tono del Contenido</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profesional y Empático</SelectItem>
                  <SelectItem value="authoritative">Autoritativo y Técnico</SelectItem>
                  <SelectItem value="accessible">Accesible y Educativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-4" />
            
            <Button 
              className="w-full h-12 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" 
              onClick={handleGenerate} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin"/>
                  Generando Post {currentPostIndex}/{postsCount}...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5"/>
                  Generar {postsCount} Posts
                </>
              )}
            </Button>
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-slate-500">{progress}% completado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-purple-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Resultados y Análisis
              </span>
              {stats && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {generatedPosts.length} posts generados
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!isGenerating && generatedPosts.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">Los resultados aparecerán aquí después de la generación.</p>
                <p className="text-slate-400 text-sm mt-2">Configura los parámetros y presiona "Generar"</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-16">
                <RefreshCw className="mx-auto w-12 h-12 animate-spin text-blue-600 mb-4"/>
                <p className="mt-4 text-slate-600 font-medium">Generando contenido legal de alta calidad...</p>
                <p className="text-slate-500 text-sm mt-2">Post {currentPostIndex} de {postsCount}</p>
              </div>
            )}

            {stats && generatedPosts.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Total Palabras</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalWords.toLocaleString()}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">SEO Promedio</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-1">{stats.avgSeoScore}/100</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">Lectura (min)</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 mt-1">{stats.estimatedReadTime}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-orange-700 font-medium">Posts</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-900 mt-1">{generatedPosts.length}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Distribución de Calidad SEO</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={stats.qualityDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats.qualityDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Posts por Tema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.contentByTopic}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Progreso de Generación (SEO Score)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats.progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="post" label={{ value: 'Post #', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'SEO Score', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} name="SEO Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Posts Generados
                  </h3>
                  <div className="space-y-3">
                    {generatedPosts.map((post, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{post.title}</h4>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{post.metaDescription}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {post.content.split(' ').length} palabras
                                </Badge>
                                {post.keywords && (
                                  <Badge variant="outline" className="text-xs">
                                    {post.keywords.split(',')[0].trim()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge 
                              className={`ml-4 ${
                                post.seoScore >= 90 ? 'bg-green-100 text-green-700' :
                                post.seoScore >= 80 ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              SEO: {post.seoScore}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">Palabras Clave Principales Detectadas</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {stats.topKeywords.map((kw, i) => (
                          <Badge key={i} className="bg-blue-600 text-white">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
