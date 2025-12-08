
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Wand2, 
  Send, 
  Save, 
  Eye, 
  RefreshCw, 
  Sparkles,
  Settings2,
  Globe,
  Target,
  TrendingUp,
  Image as ImageIcon,
  Link2,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/lib/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  structure: string[];
  tone: string;
  keywords: string[];
}

const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: "injury-guide",
    name: "Guía de Lesiones Personales",
    description: "Guía completa para víctimas de lesiones",
    structure: ["Introducción", "Tipos de Lesiones", "Derechos Legales", "Compensación", "Próximos Pasos", "FAQ"],
    tone: "profesional-empático",
    keywords: ["lesión personal", "compensación", "derechos legales"]
  },
  {
    id: "accident-steps",
    name: "Pasos Post-Accidente",
    description: "Qué hacer después de un accidente",
    structure: ["Acciones Inmediatas", "Documentación", "Atención Médica", "Consulta Legal", "Reclamos de Seguro"],
    tone: "instructivo-apoyo",
    keywords: ["accidente de auto", "abogado de accidentes", "reclamo de seguro"]
  },
  {
    id: "case-study",
    name: "Estudio de Caso",
    description: "Plantilla de historia de éxito",
    structure: ["Situación del Cliente", "Desafíos", "Estrategia Legal", "Resultados", "Conclusiones"],
    tone: "profesional-persuasivo",
    keywords: ["resultado del caso", "acuerdo", "victoria"]
  }
];

// Mock Data
const MOCK_CAMPAIGNS: Campaign[] = [
  { 
    id: 1, 
    name: "California Personal Injury Lawyers Blog", 
    status: "active", 
    blogUrl: "https://www.californiapersonalinjurylawyersblog.com",
    embedCode: "xyz",
    description: "Primary SEO campaign for California personal injury niche",
    posts: 145,
    createdAt: new Date("2024-01-15"), 
    updatedAt: new Date("2024-03-20"),
    userId: "user_1",
    config: {}
  },
  { 
    id: 2, 
    name: "Texas Accident Lawyers", 
    status: "active", 
    blogUrl: "https://texasaccidentlawyers.com",
    embedCode: "abc",
    description: "Enfoque en lesiones de construcción",
    posts: 32,
    createdAt: new Date(), 
    updatedAt: new Date(),
    userId: "1",
    config: {}
  },
  { 
    id: 3, 
    name: "Tech Startup Legal Guide", 
    status: "draft", 
    blogUrl: "https://techlegalguide.com",
    embedCode: "def",
    description: "Legal resources for tech startups",
    posts: 5,
    createdAt: new Date(), 
    updatedAt: new Date(),
    userId: "1",
    config: {}
  },
];

export default function ContentCreator() {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [contentPrompt, setContentPrompt] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [wordCount, setWordCount] = useState([1500]);
  const [creativity, setCreativity] = useState([0.7]);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeSEO, setIncludeSEO] = useState(true);
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'free'>('free');
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [seoMetadata, setSeoMetadata] = useState<any>(null);
  const [seoScore, setSeoScore] = useState<any>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isSuggestingPrompt, setIsSuggestingPrompt] = useState(false);

  // Fetch campaigns (Mocked)
  const { data: campaigns = MOCK_CAMPAIGNS } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      // Return mock data for prototype
      return MOCK_CAMPAIGNS;
    }
  });

  const handleSuggestPrompt = async () => {
    if (!targetKeywords) {
      toast({
        title: "Palabras clave requeridas",
        description: "Agrega palabras clave objetivo primero",
        variant: "destructive"
      });
      return;
    }

    setIsSuggestingPrompt(true);
    
    try {
      const keywords = targetKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      const response = await fetch('/api/no-cost-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en SEO y marketing de contenidos legal. Tu trabajo es sugerir prompts efectivos para generar artículos optimizados.'
            },
            {
              role: 'user',
              content: `Sugiere un prompt detallado para crear un artículo SEO sobre: ${keywords.join(', ')}. 
              
El prompt debe:
- Ser específico y detallado (mínimo 100 palabras)
- Incluir estructura sugerida (introducción, secciones principales, conclusión)
- Mencionar el tono y estilo deseado
- Sugerir elementos a incluir (estadísticas, ejemplos, casos de éxito)
- Enfocarse en intención de búsqueda del usuario

Solo responde con el prompt sugerido, sin explicaciones adicionales.`
            }
          ],
          model: 'gpt-4o',
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('Error al sugerir prompt');
      }

      const data = await response.json();
      setContentPrompt(data.content);
      
      toast({
        title: "¡Prompt sugerido!",
        description: "Revisa y ajusta el prompt según tus necesidades"
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error al sugerir prompt",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSuggestingPrompt(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCampaign || !contentPrompt) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una campaña y escribe un prompt",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    
    try {
      const keywords = targetKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      let endpoint = '/api/generate-content';
      if (aiProvider === 'claude') endpoint = '/api/generate-content-claude';
      if (aiProvider === 'free') endpoint = '/api/generate-content-free';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: contentPrompt,
          keywords: keywords.length > 0 ? keywords : ['legal', 'abogado'],
          wordCount: wordCount[0],
          tone: 'profesional-empático',
          language: 'es',
          model: aiProvider === 'free' ? 'gpt-4o' : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar contenido');
      }

      const data = await response.json();
      
      // Simulate streaming effect for better UX
      const chunks = data.content.split(/(?=[<])/);
      let currentText = "";
      
      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentText += chunks[i];
        setGeneratedContent(currentText);
      }

      // Set metadata
      if (data.metaDescription) {
        setSeoMetadata({
          title: data.title,
          description: data.metaDescription,
          slug: data.title.toLowerCase().replace(/ /g, '-').substring(0, 50)
        });
      }

      // Set SEO score
      if (data.seoScore) {
        setSeoScore({
          score: data.seoScore,
          keywordDensity: keywords.reduce((acc, k) => {
            acc[k] = 2.5;
            return acc;
          }, {} as any),
          suggestions: [
            "Contenido generado con IA optimizado para SEO",
            "Palabras clave integradas naturalmente",
            "Estructura de encabezados correcta"
          ],
          improvements: "Contenido de alta calidad generado con GPT-4. Revisa y personaliza según necesites."
        });
      }

      toast({
        title: "¡Contenido generado exitosamente!",
        description: `El contenido ha sido creado con ${
          aiProvider === 'claude' ? 'Claude 3.5 Sonnet' : 
          aiProvider === 'free' ? 'no-cost-ai (GRATIS)' : 
          'OpenAI GPT-4'
        }`
      });

      if (includeSEO) {
        handleOptimizeSEO(currentText);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error al generar contenido",
        description: error.message || "Verifica que tu API key de OpenAI esté configurada correctamente",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!generatedContent) {
      toast({
        title: "Sin contenido",
        description: "Genera contenido primero",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingImages(true);
    
    try {
      const keywords = targetKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      const response = await fetch('/api/images/blog-header', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: seoMetadata?.title || contentPrompt,
          keywords: keywords.length > 0 ? keywords : ['legal', 'abogado']
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar imagen');
      }

      const data = await response.json();
      setGeneratedImages([data.imageUrl]);
      
      toast({
        title: "¡Imagen generada!",
        description: "Imagen de cabecera creada con IA"
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error al generar imagen",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleGenerateMetadata = async () => {
    if (!generatedContent) return;

    // Mock metadata generation
    const mockMetadata = {
        title: `Guía Completa: ${contentPrompt.substring(0, 30)}...`,
        description: `Descubre todo lo que necesitas saber sobre ${contentPrompt}. Una guía experta para proteger tus derechos y maximizar tu compensación.`,
        slug: contentPrompt.toLowerCase().replace(/ /g, '-').substring(0, 50)
    };
    
    setSeoMetadata(mockMetadata);
    toast({ title: "Metadata Generada", description: "Meta título y descripción creados." });
  };

  const handleOptimizeSEO = async (contentToAnalyze = generatedContent) => {
    if (!contentToAnalyze) return;

    // Simular análisis SEO
    const mockScore = {
      score: 85,
      keywordDensity: {
        [targetKeywords || 'legal']: 2.5
      },
      suggestions: [
        "Densidad de keywords óptima",
        "Estructura de encabezados correcta",
        "Incluir más enlaces internos"
      ],
      improvements: "El contenido está bien optimizado. Considera agregar más ejemplos prácticos."
    };

    setSeoScore(mockScore);
  };

  const handlePublish = (status: 'draft' | 'published') => {
    if (!generatedContent) {
      toast({
        title: "Sin contenido",
        description: "Genera contenido primero antes de publicar",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: status === 'draft' ? "Borrador Guardado" : "Publicado Exitosamente",
      description: "El contenido ha sido procesado (Simulación)",
      variant: "default"
    });
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Creador de Contenido AI</h1>
          <p className="text-slate-500 mt-1">Genera contenido SEO optimizado con inteligencia artificial</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Vista Previa
          </Button>
          <Button className="gap-2 bg-primary hover:bg-blue-700" onClick={() => handlePublish('draft')}>
            <Save className="w-4 h-4" />
            Guardar Borrador
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Campaña *</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una campaña" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plantilla de Contenido</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="text-xs text-slate-500">
                    {CONTENT_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Palabras Clave Objetivo</Label>
                <Input 
                  placeholder="personal injury lawyer, car accident..."
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Longitud del Artículo: {wordCount[0]} palabras</Label>
                <Slider 
                  value={wordCount}
                  onValueChange={setWordCount}
                  min={500}
                  max={3000}
                  step={100}
                />
              </div>

              <div className="space-y-2">
                <Label>Creatividad: {creativity[0].toFixed(1)}</Label>
                <Slider 
                  value={creativity}
                  onValueChange={setCreativity}
                  min={0}
                  max={1}
                  step={0.1}
                />
                <p className="text-xs text-slate-500">
                  0 = Más factual, 1 = Más creativo
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Proveedor de IA</Label>
                  <RadioGroup value={aiProvider} onValueChange={(value: any) => setAiProvider(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free" className="font-normal">
                        no-cost-ai (GRATIS) 🎉
                        <span className="text-xs text-green-600 ml-2">Recomendado</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="openai" id="openai" />
                      <Label htmlFor="openai" className="font-normal">OpenAI GPT-4</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="claude" id="claude" />
                      <Label htmlFor="claude" className="font-normal">Claude 3.5 Sonnet</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sugerir imágenes</Label>
                  <Switch checked={includeImages} onCheckedChange={setIncludeImages} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Optimización SEO</Label>
                  <Switch checked={includeSEO} onCheckedChange={setIncludeSEO} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Características AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Optimización SEO automática
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Estructura de contenido inteligente
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Densidad de keywords optimizada
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Enlaces internos sugeridos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Generador de Contenido
              </CardTitle>
              <CardDescription>
                Describe el tema del artículo y deja que la IA cree contenido optimizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prompt de Contenido *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleSuggestPrompt}
                    disabled={isSuggestingPrompt || !targetKeywords}
                  >
                    {isSuggestingPrompt ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sugiriendo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Sugerir Prompt
                      </>
                    )}
                  </Button>
                </div>
                <Textarea 
                  placeholder="Ejemplo: Escribe un artículo completo sobre qué hacer después de un accidente de carro en California, incluyendo pasos legales, documentación necesaria y cuándo contactar un abogado..."
                  value={contentPrompt}
                  onChange={(e) => setContentPrompt(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  Tip: Agrega palabras clave objetivo arriba y usa "Sugerir Prompt" para obtener ideas de IA
                </p>
              </div>

              <Button 
                className="w-full h-12 text-lg gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleGenerate}
                disabled={isGenerating || !selectedCampaign}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generando contenido...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generar con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedContent && (
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Contenido Generado
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                      Regenerar
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={handleGenerateImages}
                      disabled={isGeneratingImages}
                    >
                      <ImageIcon className={`w-4 h-4 mr-2 ${isGeneratingImages ? 'animate-spin' : ''}`} />
                      Generar Imágenes
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handlePublish('published')}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publicar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" onValueChange={(value) => {
                  if (value === 'seo' && !seoScore) handleOptimizeSEO();
                  if (value === 'meta' && !seoMetadata) handleGenerateMetadata();
                }}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content">Contenido</TabsTrigger>
                    <TabsTrigger value="images">Imágenes</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="meta">Metadata</TabsTrigger>
                  </TabsList>
                  <TabsContent value="content" className="mt-4">
                    <div className="prose max-w-none bg-white p-6 rounded-lg border border-slate-200 max-h-[600px] overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                    </div>
                  </TabsContent>
                  <TabsContent value="images" className="mt-4">
                    {generatedImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {generatedImages.map((img, idx) => (
                          <Card key={idx}>
                            <CardContent className="pt-6">
                              <img 
                                src={img} 
                                alt={`Imagen generada ${idx + 1}`}
                                className="w-full rounded-lg border border-slate-200"
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-3"
                                onClick={() => window.open(img, '_blank')}
                              >
                                <Link2 className="w-4 h-4 mr-2" />
                                Abrir en nueva pestaña
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="pt-6 text-center py-12">
                          <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                          <p className="text-slate-500 mb-4">No hay imágenes generadas</p>
                          <Button onClick={handleGenerateImages} disabled={isGeneratingImages}>
                            {isGeneratingImages ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Generando...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generar Imágenes con DALL-E
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  <TabsContent value="seo" className="mt-4 space-y-4">
                    {seoScore ? (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Target className="w-5 h-5 text-blue-600" />
                              Puntuación SEO
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl font-bold text-blue-600">
                                {seoScore.score}
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all"
                                    style={{ width: `${seoScore.score}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Densidad de Keywords</Label>
                              {Object.entries(seoScore.keywordDensity).map(([keyword, density]: [string, any]) => (
                                <div key={keyword} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">{keyword}</span>
                                  <Badge variant={density > 3 ? 'destructive' : density < 0.5 ? 'secondary' : 'default'}>
                                    {density.toFixed(2)}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Sugerencias de Mejora</Label>
                              {seoScore.suggestions.map((suggestion: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-700">{suggestion}</span>
                                </div>
                              ))}
                            </div>
                            
                            {seoScore.improvements && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold">Análisis IA</Label>
                                  <p className="text-sm text-slate-600">{seoScore.improvements}</p>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="pt-6 text-center py-12">
                          <TrendingUp className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                          <p className="text-slate-500">Cargando análisis SEO...</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  <TabsContent value="meta" className="mt-4">
                    {seoMetadata ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Meta Title</Label>
                          <Input value={seoMetadata.title} readOnly />
                          <p className="text-xs text-slate-500">{seoMetadata.title?.length || 0} caracteres</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Meta Description</Label>
                          <Textarea rows={3} value={seoMetadata.description} readOnly />
                          <p className="text-xs text-slate-500">{seoMetadata.description?.length || 0} caracteres</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Open Graph Title</Label>
                          <Input value={seoMetadata.ogTitle} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>Open Graph Description</Label>
                          <Textarea rows={2} value={seoMetadata.ogDescription} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>Schema.org JSON-LD</Label>
                          <Textarea 
                            rows={6} 
                            value={seoMetadata.schema} 
                            readOnly 
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="pt-6 text-center py-12">
                          <Globe className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                          <p className="text-slate-500">Generando metadata SEO...</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
