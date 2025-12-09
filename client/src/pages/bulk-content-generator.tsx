
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, CheckCircle2, Info, ArrowLeft, FileText, Eye, TrendingUp, BarChart3, Target, Zap, Workflow, Globe, Settings, Download, Share2, Code, Database, Cpu, LineChart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearch, useLocation, Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WordPressService } from "@/lib/wordpress-service";

interface GeneratedPost {
  id?: string;
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
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
}

export default function BulkContentGenerator() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const campaignId = searchParams.get('campaignId');

  const [postsCount, setPostsCount] = useState(4);
  const [baseTopics, setBaseTopics] = useState("lesiones personales, accidentes de auto, compensación laboral");
  const [keywords, setKeywords] = useState("abogado, miami, indemnización");
  const [wordCount, setWordCount] = useState(1200);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'free'>('gemini');
  const [apiKey, setApiKey] = useState("");
  const [workflowMode, setWorkflowMode] = useState("draft");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: campaignDetails } = useQuery<CampaignDetails>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: !!campaignId,
  });

  useEffect(() => {
    if (generatedPosts.length > 0) {
      const totalWords = generatedPosts.reduce((sum, post) => {
        const words = post.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
        return sum + words;
      }, 0);

      const avgSeoScore = generatedPosts.reduce((sum, post) => sum + post.seoScore, 0) / generatedPosts.length;
      const estimatedReadTime = Math.ceil(totalWords / 200);

      setStats({
        totalWords,
        avgSeoScore: Math.round(avgSeoScore),
        topKeywords: keywords.split(',').map(k => k.trim()).slice(0, 5),
        estimatedReadTime
      });
    }
  }, [generatedPosts, keywords]);

  const handlePublishAll = async () => {
    setIsPublishing(true);
    try {
      const wpUrl = localStorage.getItem("wpUrl") || "https://www.californiapersonalinjurylawyersblog.com";
      const wpUser = localStorage.getItem("wpUser") || "walchlaw4";
      const wpPass = localStorage.getItem("wpPass") || "eJs3M*LnfSSo68P!RtXC9lZ";
      const n8nUrl = localStorage.getItem("n8nUrl") || "";

      let published = 0;

      for (const post of generatedPosts) {
        if (workflowMode === 'auto-publish' && n8nUrl) {
          try {
            await fetch(n8nUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                credentials: { siteUrl: wpUrl, username: wpUser, applicationPassword: wpPass },
                post: {
                  title: post.title,
                  content: post.content,
                  excerpt: post.metaDescription,
                  slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  meta: {
                    _yoast_wpseo_title: post.title,
                    _yoast_wpseo_metadesc: post.metaDescription
                  }
                },
                workflowMode: 'auto-publish'
              })
            });
          } catch (n8nError) {
            console.error('n8n webhook error:', n8nError);
          }
        }

        const response = await fetch('/api/wordpress/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentials: {
              siteUrl: wpUrl,
              username: wpUser,
              applicationPassword: wpPass
            },
            post: {
              title: post.title,
              content: post.content,
              excerpt: post.metaDescription,
              slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              meta: {
                _yoast_wpseo_title: post.title,
                _yoast_wpseo_metadesc: post.metaDescription
              }
            },
            config: {
              status: workflowMode === 'auto-publish' ? 'publish' : 'draft'
            }
          })
        });

        const result = await response.json();

        if (result.success) {
          published++;
          toast({
            title: `${workflowMode === 'auto-publish' ? 'Published' : 'Saved'} ${published}/${generatedPosts.length}`,
            description: post.title,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Bulk Processing Complete!",
        description: `Successfully ${workflowMode === 'auto-publish' ? 'published' : 'saved'} ${published} posts.`,
      });

      if (campaignId) {
        setLocation(`/campaign/${campaignId}`);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to process posts", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: postsCount,
          topics: baseTopics,
          keywords: keywords,
          wordCount: wordCount,
          provider: aiProvider,
          apiKey: aiProvider === 'gemini' ? apiKey : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPosts(data.contents || []);
      setShowResults(true);
      setProgress(100);
      toast({
        title: "Generation Complete!",
        description: `Successfully generated ${data.contents?.length || 0} posts.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
      setProgress(0);
    }
  });

  const handleGenerate = () => {
    if (aiProvider === 'gemini' && !apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google AI API key",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setShowResults(false);
    setGeneratedPosts([]);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 800);

    generateMutation.mutate();
    
    setTimeout(() => {
      clearInterval(interval);
      setIsGenerating(false);
    }, 10000);
  };

  return (
    <SidebarLayout>
      {campaignDetails && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-medium">Campaign Context</p>
            <h3 className="text-lg font-bold text-slate-900">{campaignDetails.campaign.name}</h3>
          </div>
          <Link href={`/campaign/${campaignId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="outline" className="text-slate-600">v3.0</Badge>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Generador Masivo de Contenido
          </h1>
          <p className="text-slate-500 mt-2">Define tus parámetros y crea múltiples artículos optimizados con IA avanzada.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              Configuración del Motor
            </CardTitle>
            <CardDescription>Parámetros de generación avanzada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Cpu className="w-4 h-4 text-blue-500"/>
                Proveedor de IA
              </Label>
              <RadioGroup value={aiProvider} onValueChange={(val: 'gemini' | 'free') => setAiProvider(val)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Google Gemini Pro</span>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">Premium</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Alta calidad, requiere API key</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Free Templates</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Básico</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Sin límites, plantillas predefinidas</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {aiProvider === 'gemini' && (
              <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Google AI API Key
                </Label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white border-purple-300 focus:border-purple-500"
                />
                <p className="text-xs text-purple-700">Obtén tu clave en ai.google.dev</p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-500"/>
                Flujo de Trabajo
              </Label>
              <Select value={workflowMode} onValueChange={setWorkflowMode}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Seleccionar flujo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Guardar como Borrador
                    </div>
                  </SelectItem>
                  <SelectItem value="auto-publish">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Auto-Publicar (n8n + WP)
                    </div>
                  </SelectItem>
                  <SelectItem value="schedule">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Programar Distribución
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de Posts</Label>
              <Select value={postsCount.toString()} onValueChange={(val) => setPostsCount(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 6, 8, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} artículos</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Temas Base</Label>
              <Textarea
                value={baseTopics}
                onChange={(e) => setBaseTopics(e.target.value)}
                placeholder="Ej: accidentes laborales, lesiones vehiculares..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Keywords SEO</Label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="abogado, miami, compensación..."
              />
            </div>

            <div className="space-y-2">
              <Label>Palabras por Post: {wordCount}</Label>
              <input
                type="range"
                min="600"
                max="2000"
                step="100"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar Contenido
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-emerald-600" />
                Resultados y Métricas
              </CardTitle>
              {stats && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {generatedPosts.length} Posts Generados
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">Progreso de Generación</span>
                  <span className="text-indigo-600 font-bold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    { icon: Cpu, label: "Procesando IA", color: "text-blue-500" },
                    { icon: Database, label: "Optimizando SEO", color: "text-purple-500" },
                    { icon: Globe, label: "Preparando WP", color: "text-green-500" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg text-center border border-slate-200">
                      <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                      <p className="text-xs text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats && showResults && !isGenerating && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { icon: FileText, label: "Total Palabras", value: stats.totalWords.toLocaleString(), color: "bg-blue-500" },
                    { icon: TrendingUp, label: "SEO Promedio", value: `${stats.avgSeoScore}/100`, color: "bg-green-500" },
                    { icon: Eye, label: "Tiempo Lectura", value: `${stats.estimatedReadTime} min`, color: "bg-purple-500" },
                    { icon: Target, label: "Keywords", value: stats.topKeywords.length, color: "bg-orange-500" }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm">
                      <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4 pt-4 border-t">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle2 className="w-5 h-5"/>
                    <h4 className="font-semibold">¡Generación completada!</h4>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setLocation('/content-manager')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Ver en Gestor
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      onClick={handlePublishAll}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin"/> Procesando...</>
                      ) : workflowMode === 'auto-publish' ? (
                        <><Workflow className="w-4 h-4 mr-2"/> Ejecutar Workflow</>
                      ) : (
                        <><Globe className="w-4 h-4 mr-2"/> Publicar Todos</>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {generatedPosts.map((post, index) => (
                    <div key={post.id || index} className="p-5 border-2 rounded-xl hover:border-indigo-300 transition-all bg-white shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 text-xs font-bold bg-slate-900 text-white rounded">#{index + 1}</span>
                            <Badge variant="secondary" className="text-xs">
                              SEO: {post.seoScore}/100
                            </Badge>
                            {aiProvider === 'gemini' && (
                              <Badge className="text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
                                <Zap className="w-3 h-3 mr-1"/>
                                AI Gemini
                              </Badge>
                            )}
                            {workflowMode === 'auto-publish' && (
                              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                <Workflow className="w-3 h-3 mr-1"/>
                                n8n Ready
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.metaDescription}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {post.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length} palabras
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Optimizado SEO
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isGenerating && !showResults && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Listo para Generar</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Configure los parámetros y haga clic en "Generar Contenido" para crear artículos optimizados con IA.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
