import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, CheckCircle2, Info, ArrowLeft, FileText, Eye, TrendingUp, BarChart3, Target, Zap, Workflow, Globe } from "lucide-react";
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
  const [workflowMode, setWorkflowMode] = useState("draft"); // 'draft', 'auto-publish'

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [showResults, setShowResults] = useState(false);

  // ... (keep existing queries and calculations)

  const handlePublishAll = async () => {
    setIsPublishing(true);
    try {
      const wpUrl = localStorage.getItem("wpUrl") || "https://www.californiapersonalinjurylawyersblog.com";
      const wpUser = localStorage.getItem("wpUser") || "walchlaw4";
      const wpPass = localStorage.getItem("wpPass") || "eJs3M*LnfSSo68P!RtXC9lZ";
      const n8nUrl = localStorage.getItem("n8nUrl") || "";
      
      // Publish each post using the unified service
      const results = [];
      for (let i = 0; i < generatedPosts.length; i++) {
        const post = generatedPosts[i];
        
        toast({
          title: `Publicando ${i + 1}/${generatedPosts.length}`,
          description: post.title.substring(0, 50) + '...',
        });
        
        const result = await fetch('/api/wordpress/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentials: {
              siteUrl: wpUrl,
              username: wpUser,
              password: wpPass,
              applicationPassword: wpPass
            },
            n8nConfig: n8nUrl ? { webhookUrl: n8nUrl } : null,
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
              method: workflowMode === 'auto-publish' ? 'n8n-webhook' : 'browser-auto-login',
              status: 'publish'
            }
          })
        });
        
        const data = await result.json();
        results.push(data);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: "¡Publicación masiva completada!",
        description: `${results.filter(r => r.success).length}/${generatedPosts.length} posts publicados exitosamente`,
      });
      
      if (campaignId) {
        setLocation(`/campaign/${campaignId}`);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to trigger workflow", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  // ... (keep existing generate mutation and handleGenerate)

  return (
    <SidebarLayout>
      {/* ... (keep existing campaign header) */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Generador Masivo de Contenido</h1>
          <p className="text-slate-500 mt-1">Define tus parámetros y crea múltiples artículos con IA.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Configuración</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* ... (keep AI provider settings) */}

            {/* Add Workflow Settings */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="flex items-center gap-2"><Workflow className="w-4 h-4 text-indigo-500"/> Flujo de Trabajo</Label>
              <Select value={workflowMode} onValueChange={setWorkflowMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">📝 Guardar como Borrador</SelectItem>
                  <SelectItem value="auto-publish">🚀 Auto-Publicar (n8n + WP)</SelectItem>
                  <SelectItem value="schedule">📅 Programar Distribución</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ... (keep other settings) */}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {/* ... (keep existing results header) */}
          <CardContent>
            {/* ... (keep existing stats and states) */}

            {generatedPosts.length > 0 && showResults && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle2 className="w-5 h-5"/>
                    <h4 className="font-semibold">¡Generación completada!</h4>
                  </div>
                  <div className="flex gap-2">
                    {workflowMode === 'auto-publish' && (
                       <Button 
                         variant="default" 
                         className="bg-indigo-600 hover:bg-indigo-700 text-white"
                         onClick={handlePublishAll}
                         disabled={isPublishing}
                       >
                         {isPublishing ? (
                           <><RefreshCw className="w-4 h-4 mr-2 animate-spin"/> Procesando...</>
                         ) : (
                           <><Workflow className="w-4 h-4 mr-2"/> Ejecutar Workflow n8n</>
                         )}
                       </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setLocation('/content-manager')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Ver en Gestor
                    </Button>
                    {/* ... (keep other buttons) */}
                  </div>
                </div>
                {generatedPosts.map((post, index) => (
                  <div key={post.id || index} className="p-4 border rounded-lg hover:border-blue-300 transition-colors bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-slate-500">Post #{index + 1}</span>
                          <Badge variant="secondary" className="text-xs">
                            SEO: {post.seoScore}/100
                          </Badge>
                          {aiProvider === 'gemini' && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              <Zap className="w-3 h-3 mr-1"/>
                              AI Generated
                            </Badge>
                          )}
                          {workflowMode === 'auto-publish' && (
                            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                              <Workflow className="w-3 h-3 mr-1"/>
                              Ready for n8n
                            </Badge>
                          )}
                        </div>
                        {/* ... (keep rest of post card) */}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
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