
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
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@shared/schema";

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
    name: "Personal Injury Guide",
    description: "Complete guide for injury victims",
    structure: ["Introduction", "Types of Injuries", "Legal Rights", "Compensation", "Next Steps", "FAQ"],
    tone: "professional-empathetic",
    keywords: ["personal injury", "compensation", "legal rights"]
  },
  {
    id: "accident-steps",
    name: "Post-Accident Steps",
    description: "What to do after an accident",
    structure: ["Immediate Actions", "Documentation", "Medical Care", "Legal Consultation", "Insurance Claims"],
    tone: "instructive-supportive",
    keywords: ["car accident", "accident lawyer", "insurance claim"]
  },
  {
    id: "case-study",
    name: "Case Study",
    description: "Success story template",
    structure: ["Client Situation", "Challenges", "Legal Strategy", "Results", "Takeaways"],
    tone: "professional-persuasive",
    keywords: ["case result", "settlement", "victory"]
  }
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
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return res.json();
    }
  });

  // Generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: async (data: {
      campaignId: string;
      template: string;
      prompt: string;
      keywords: string;
      wordCount: number;
      creativity: number;
      includeImages: boolean;
      includeSEO: boolean;
    }) => {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to generate content');
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast({
        title: "Contenido generado",
        description: "El contenido ha sido creado exitosamente con IA"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar el contenido",
        variant: "destructive"
      });
    }
  });

  // Publish content mutation
  const publishContentMutation = useMutation({
    mutationFn: async (data: {
      campaignId: string;
      title: string;
      content: string;
      status: 'draft' | 'published';
    }) => {
      const res = await fetch('/api/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to publish content');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contenido publicado",
        description: "El contenido ha sido publicado exitosamente"
      });
    }
  });

  const handleGenerate = () => {
    if (!selectedCampaign || !contentPrompt) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una campaña y escribe un prompt",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    generateContentMutation.mutate({
      campaignId: selectedCampaign,
      template: selectedTemplate,
      prompt: contentPrompt,
      keywords: targetKeywords,
      wordCount: wordCount[0],
      creativity: creativity[0],
      includeImages,
      includeSEO
    });
    setIsGenerating(false);
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

    publishContentMutation.mutate({
      campaignId: selectedCampaign,
      title: contentPrompt.slice(0, 100),
      content: generatedContent,
      status
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
                <Label>Prompt de Contenido *</Label>
                <Textarea 
                  placeholder="Ejemplo: Escribe un artículo completo sobre qué hacer después de un accidente de carro en California, incluyendo pasos legales, documentación necesaria y cuándo contactar un abogado..."
                  value={contentPrompt}
                  onChange={(e) => setContentPrompt(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
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
                    <Button variant="outline" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerar
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
                <Tabs defaultValue="content">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Contenido</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="meta">Metadata</TabsTrigger>
                  </TabsList>
                  <TabsContent value="content" className="mt-4">
                    <div className="prose max-w-none bg-white p-6 rounded-lg border border-slate-200">
                      <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                    </div>
                  </TabsContent>
                  <TabsContent value="seo" className="mt-4 space-y-4">
                    <Card>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Densidad de Keywords</span>
                          <Badge className="bg-green-100 text-green-700">Óptimo</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Legibilidad</span>
                          <Badge className="bg-green-100 text-green-700">8.5/10</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Enlaces Internos</span>
                          <Badge className="bg-yellow-100 text-yellow-700">3 sugeridos</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="meta" className="mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input defaultValue="Auto-generated SEO title..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea rows={3} defaultValue="Auto-generated meta description..." />
                      </div>
                    </div>
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
