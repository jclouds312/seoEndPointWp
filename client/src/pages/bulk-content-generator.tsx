
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  RefreshCw,
  Download,
  Send,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface GeneratedPost {
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
}

export default function BulkContentGenerator() {
  const [postsPerMonth] = useState(8);
  const [baseTopics, setBaseTopics] = useState("lesiones personales, accidentes de auto, compensación laboral, negligencia médica");
  const [keywords, setKeywords] = useState("abogado, lesiones, compensación, derechos legales");
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [progress, setProgress] = useState(0);

  const generateBulkMutation = useMutation({
    mutationFn: async () => {
      const topics = baseTopics.split(',').map(t => t.trim());
      const keywordList = keywords.split(',').map(k => k.trim());
      
      // Generate 8 different content requests
      const requests = topics.slice(0, 8).map((topic, idx) => ({
        topic: `${topic} - Guía completa y actualizada`,
        keywords: keywordList,
        wordCount: 1000 + (idx * 100), // Vary word count slightly
        tone: idx % 2 === 0 ? 'profesional-empático' : 'profesional-informativo',
        language: 'es'
      }));

      const response = await fetch('/api/generate-bulk-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests })
      });

      if (!response.ok) {
        throw new Error('Error al generar contenido masivo');
      }

      const data = await response.json();
      return data.results;
    },
    onSuccess: (data) => {
      setGeneratedPosts(data);
      setProgress(100);
      toast({
        title: "¡Contenido generado exitosamente!",
        description: `Se generaron ${data.length} posts de alta calidad con OpenAI`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar contenido",
        description: error.message,
        variant: "destructive"
      });
      setProgress(0);
    }
  });

  const handleGenerate = () => {
    setProgress(0);
    setGeneratedPosts([]);
    generateBulkMutation.mutate();
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 1000);
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Generador Masivo de Contenido</h1>
          <p className="text-slate-500 mt-1">Crea 8 posts de alta calidad al mes con IA</p>
        </div>
        <Badge className="bg-purple-600 text-white px-4 py-2">
          <Calendar className="w-4 h-4 mr-2" />
          {postsPerMonth} Posts/Mes
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Temas Base (separa por comas)</Label>
                <Input
                  placeholder="lesiones personales, accidentes..."
                  value={baseTopics}
                  onChange={(e) => setBaseTopics(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  Se generará un post por cada tema (máx. 8)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Palabras Clave Objetivo</Label>
                <Input
                  placeholder="abogado, lesiones, compensación..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <Separator />

              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm mb-2">Características:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Generado con GPT-4
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    1000+ palabras por post
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    SEO optimizado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Contenido único
                  </li>
                </ul>
              </div>

              <Button
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleGenerate}
                disabled={generateBulkMutation.isPending || !baseTopics}
              >
                {generateBulkMutation.isPending ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generar {postsPerMonth} Posts
                  </>
                )}
              </Button>

              {generateBulkMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {generatedPosts.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No hay contenido generado
                </h3>
                <p className="text-slate-500 mb-6">
                  Configura los temas y palabras clave, luego haz clic en "Generar 8 Posts"
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">
                        {generatedPosts.length} posts generados exitosamente
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Send className="w-4 h-4 mr-2" />
                        Publicar Todos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {generatedPosts.map((post, idx) => (
                <Card key={idx} className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                        <CardDescription className="text-sm">{post.metaDescription}</CardDescription>
                      </div>
                      <Badge className="bg-blue-600 ml-4">
                        SEO: {post.seoScore}/100
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <div 
                        className="prose prose-sm max-w-none text-slate-700"
                        dangerouslySetInnerHTML={{ __html: post.content.substring(0, 500) + '...' }}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Vista Completa
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        Publicar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
