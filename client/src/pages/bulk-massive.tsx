import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, History, Globe, CheckCircle2, AlertCircle, ArrowRight, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarLayout from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";

interface GeneratedPost {
  id: string;
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
  status: string;
}

export default function BulkMassive() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPost, setCurrentPost] = useState(0);
  const [targetSite, setTargetSite] = useState("calinjurylaw");
  const [mainKeyword, setMainKeyword] = useState("");
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  const handleGenerate = async () => {
    if (!mainKeyword.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un tema o keyword",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setCurrentPost(0);
    setGeneratedPosts([]);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setCurrentPost(prev => {
        if (prev < 7) return prev + 1;
        return prev;
      });
    }, 500);
    
    try {
      const response = await fetch('/api/bulk-massive/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainKeyword,
          targetSite,
          count: 8
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al generar contenido');
      }

      const data = await response.json();
      
      setCurrentPost(8);
      setGeneratedPosts(data.contents || []);
      
      toast({
        title: "¡Generación Completada!",
        description: `${data.generated || 8} posts generados y guardados exitosamente`,
      });
      
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Error:', error);
      toast({
        title: "Error en Generación",
        description: error.message,
        variant: "destructive"
      });
      setCurrentPost(0);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                Enterprise Module
              </Badge>
              <Badge variant="outline" className="text-slate-500">v2.1.0</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Bulk Massive Generator</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Deploy high-velocity content clusters. Generate 8 interconnected, SEO-optimized legal articles simultaneously using the Super Version engine.
            </p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                History
             </Button>
             <Button variant="secondary" className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Templates
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Configuration Panel */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Core Configuration
                </CardTitle>
                <CardDescription>
                  Define the seed parameters for your 8-post content cluster.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                
                {/* Topic & Site Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Target Website</Label>
                    <Select value={targetSite} onValueChange={setTargetSite}>
                      <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calinjurylaw">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <span>California Personal Injury Lawyers Blog</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="techblog">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <span>TechBlog Main (WordPress)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="finance">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <span>Finance Daily (Ghost)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Content Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (United States)</SelectItem>
                        <SelectItem value="es">Spanish (Spain)</SelectItem>
                        <SelectItem value="fr">French (France)</SelectItem>
                        <SelectItem value="de">German (Germany)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Main Keyword / Topic Cluster</Label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. 'Car Accident Settlements in California'" 
                      className="h-12 text-lg pl-4 pr-12 border-slate-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={mainKeyword}
                      onChange={(e) => setMainKeyword(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      Seed
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    This seed will generate 8 distinct sub-topics covering different search intents (Informational, Commercial, etc).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Tone of Voice</Label>
                    <Select defaultValue="pro">
                      <SelectTrigger className="h-11 border-slate-200">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pro">Professional & Authoritative</SelectItem>
                        <SelectItem value="cas">Casual & Conversational</SelectItem>
                        <SelectItem value="aca">Academic & Technical</SelectItem>
                        <SelectItem value="per">Persuasive & Sales-oriented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Target Audience</Label>
                     <Select defaultValue="gen">
                      <SelectTrigger className="h-11 border-slate-200">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gen">General Public</SelectItem>
                        <SelectItem value="exp">Industry Experts</SelectItem>
                        <SelectItem value="beg">Beginners / Students</SelectItem>
                        <SelectItem value="dec">Decision Makers (B2B)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Toggles */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-5">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Advanced Enhancements
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium text-slate-700">Semantic Internal Linking</Label>
                      <p className="text-xs text-slate-500">Automatically link between the 8 generated posts to build a silo.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                  </div>
                  
                  <div className="h-px bg-slate-200/60" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium text-slate-700">Schema.org Structured Data</Label>
                      <p className="text-xs text-slate-500">Inject JSON-LD for Article, FAQ, and Breadcrumbs.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                  </div>

                  <div className="h-px bg-slate-200/60" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium text-slate-700">AI Image Generation</Label>
                      <p className="text-xs text-slate-500">Generate a unique hero image for each post using DALL-E 3.</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-indigo-600" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className={cn(
                      "w-full h-14 text-lg font-medium shadow-lg transition-all duration-300",
                      isGenerating || !mainKeyword
                        ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                    )}
                    onClick={handleGenerate}
                    disabled={isGenerating || !mainKeyword}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Orchestrating Content Cluster...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 fill-current" />
                        <span>Execute Bulk Massive (8 Posts)</span>
                        <ArrowRight className="h-5 w-5 ml-1 opacity-60" />
                      </div>
                    )}
                  </Button>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    Estimated time: ~2.5 minutes • Consumes 8 credits
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Status & Preview */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Status Card */}
            <Card className={cn(
              "border shadow-sm transition-all duration-500",
              isGenerating ? "border-indigo-200 shadow-indigo-100 ring-2 ring-indigo-500/10" : "border-slate-200"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  Generation Queue
                  {isGenerating && (
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 animate-pulse">
                      Processing
                    </Badge>
                  )}
                  {!isGenerating && generatedPosts.length > 0 && (
                    <Badge variant="secondary" className="bg-green-50 text-green-600">
                      Completado
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all duration-500",
                        currentPost > i 
                          ? "bg-green-50 border-green-200" 
                          : currentPost === i && isGenerating
                          ? "bg-indigo-50 border-indigo-200 scale-[1.02] shadow-sm" 
                          : "bg-white border-slate-100"
                      )}
                    >
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                        currentPost > i ? "bg-green-100 text-green-700" :
                        currentPost === i && isGenerating ? "bg-indigo-100 text-indigo-700 animate-pulse" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {currentPost > i ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {generatedPosts[i] ? (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-900 truncate">
                              {generatedPosts[i].title}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              SEO: {generatedPosts[i].seoScore}/100
                            </div>
                          </div>
                        ) : currentPost === i && isGenerating ? (
                           <div className="space-y-1.5">
                             <div className="h-2.5 bg-indigo-200 rounded w-24 animate-pulse" />
                             <div className="h-2 bg-indigo-100 rounded w-16" />
                           </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="h-2.5 bg-slate-200 rounded w-20" />
                            <div className="h-2 bg-slate-100 rounded w-12" />
                          </div>
                        )}
                      </div>

                      {currentPost === i && isGenerating && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              {isGenerating && (
                <CardFooter className="bg-slate-50 border-t border-slate-100 py-3">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Overall Progress</span>
                      <span>{Math.round((currentPost / 8) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                        style={{ width: `${(currentPost / 8) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardFooter>
              )}
              {!isGenerating && generatedPosts.length > 0 && (
                <CardFooter className="bg-green-50 border-t border-green-100 py-3">
                  <div className="w-full text-center">
                    <p className="text-sm font-medium text-green-900">
                      {generatedPosts.length} posts generados exitosamente
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.location.href = '/bulk-content-generator'}
                    >
                      Ver en Bulk Generator
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>

            {/* Recent Batches (Mock) */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Batches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { topic: "Truck Accident Liability", date: "2 hrs ago", status: "Completed" },
                    { topic: "Wrongful Death Claims", date: "Yesterday", status: "Published" },
                    { topic: "Slip and Fall Settlements", date: "3 days ago", status: "Drafts" }
                  ].map((batch, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{batch.topic}</p>
                        <p className="text-xs text-slate-500">{batch.date}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 h-5",
                        batch.status === "Published" ? "bg-green-50 text-green-600 border-green-200" :
                        batch.status === "Completed" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      )}>
                        {batch.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-xs h-8 text-slate-500 hover:text-slate-900">
                  View All History
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}