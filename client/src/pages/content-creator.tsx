import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  CheckCircle2,
  Palette,
  Download,
  Bot,
  Zap,
  MoreHorizontal,
  PenTool,
  Eraser,
  Type,
  Workflow // Imported Workflow icon
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/lib/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { marked } from 'marked';

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
    name: "Legal Guide: Personal Injury",
    description: "Comprehensive guide for injury victims",
    structure: ["Introduction", "Types of Injuries", "Legal Rights", "Compensation", "Next Steps", "FAQ"],
    tone: "Professional & Empathetic",
    keywords: ["personal injury", "compensation", "legal rights"]
  },
  {
    id: "accident-steps",
    name: "Checklist: Post-Accident",
    description: "Actionable steps after an incident",
    structure: ["Immediate Actions", "Documentation", "Medical Attention", "Legal Consultation", "Insurance Claims"],
    tone: "Instructing & Supportive",
    keywords: ["car accident", "accident lawyer", "insurance claim"]
  },
  {
    id: "case-study",
    name: "Case Study Success",
    description: "Success story template",
    structure: ["Client Situation", "Challenges", "Legal Strategy", "Outcome", "Key Takeaways"],
    tone: "Professional & Persuasive",
    keywords: ["case result", "settlement", "victory"]
  }
];

export default function ContentCreator() {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [contentPrompt, setContentPrompt] = useState(`IDEAL CLIENT & CASE PROFILE (FOR CONTENT TARGETING ONLY – DO NOT OUTPUT THIS TEXT)

The ideal client is:

- An ADULT injured in a:
  - Car, truck, motorcycle, bicycle, or pedestrian accident, OR
  - Dog bite / dog attack
- Accident occurred in CALIFORNIA, preferably Southern California
  (Los Angeles, San Fernando Valley, Riverside, Ventura, Orange County, etc.)
- Liability:
  - Client is NOT at fault
  - Clear liability cases preferred (especially rear-end collisions), but other
    injury accidents are also welcome
- Property damage:
  - Significant visible damage to the client’s vehicle is ideal
  - More damage to the vehicles involved is generally better for the claim
- Injuries:
  - Serious injuries or death (wrongful death cases are highly preferred)
  - Common high-value injuries include:
    - Death / wrongful death
    - Head injuries, concussion, traumatic brain injury (TBI)
    - Complex Regional Pain Syndrome (CRPS), Reflex Sympathetic Dystrophy (RSD),
      fibromyalgia and other neuropathic or regional pain syndromes
    - Any type of fracture
    - Injuries and/or pain to: face, TMJ, neck, shoulders, upper/mid/low back,
      spine, arms, hands, fingers, hips, knees (including torn ligaments),
      legs, ankles, feet, toes
- Medical treatment:
  - Client required (or reasonably should receive) medical care such as:
    - Emergency room or urgent care
    - Follow-up with doctors, specialists, chiropractors, physical therapy,
      injections, surgery and/or rehabilitation
  - Even if no emergency treatment so far, the case can still be good if
    treatment is appropriate and likely
- Insurance:
  - Client and other driver/party typically have auto or appropriate insurance
  - Uninsured motorist (UM) and underinsured motorist (UIM) cases are also
    desirable

CONTENT INSTRUCTIONS BASED ON IDEAL CLIENT
- Prioritize topics, examples and FAQs that speak directly to these types of clients.
- When giving examples, focus on:
  - Not-at-fault California accident victims, especially in Southern California
  - Clear liability rear-end crashes with major property damage
  - Serious injuries, wrongful death and cases needing significant medical care.
- Emphasize:
  - Medical treatment, documentation of injuries, and impact on daily life
  - Insurance coverage issues, including UM/UIM
  - Why these clients should contact the firm quickly for help.`);
  const [targetKeywords, setTargetKeywords] = useState("");
  const [wordCount, setWordCount] = useState([1500]);
  const [creativity, setCreativity] = useState([0.7]);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeSEO, setIncludeSEO] = useState(true);
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'free'>('free');
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isSuggestingPrompt, setIsSuggestingPrompt] = useState(false);
  const [imageStyle, setImageStyle] = useState("photorealistic");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");


  const campaigns = [
    { id: 1, name: "California Personal Injury Blog" },
    { id: 2, name: "Texas Accident Lawyers" },
    { id: 3, name: "Tech Startup Legal Guide" }
  ];

  const handleSuggestPrompt = async () => {
    if (!targetKeywords) {
      toast({
        title: "Keywords Required",
        description: "Please enter target keywords first.",
        variant: "destructive"
      });
      return;
    }

    setIsSuggestingPrompt(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const keywords = targetKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const suggestedPrompt = `Write a comprehensive and authoritative guide about "${keywords.join(', ')}".

Suggested Structure:
1. Introduction: Definition and relevant statistics.
2. Legal Framework: Applicable laws and victim rights.
3. Actionable Steps: Step-by-step guide to protecting the claim.
4. Common Mistakes: What to avoid.
5. Conclusion: Importance of legal counsel.

Tone: Professional, empathetic, and educational.`;

      const similarPrompts = [
        `Explain the process of filing a ${keywords[0]} claim in California, focusing on common pitfalls and how to maximize compensation.`,
        `Create a checklist for victims of ${keywords[0]} to ensure they document everything needed for a successful legal case.`,
        `Discuss the long-term impact of ${keywords[0]} injuries and why immediate medical attention is crucial for both health and legal reasons.`
      ];

      setContentPrompt(suggestedPrompt);
      toast({
        title: "Prompt Suggested!",
        description: (
          <div className="flex flex-col gap-2">
            <span>Main prompt applied. Try these variations too:</span>
            <ul className="list-disc pl-4 text-xs mt-1">
              {similarPrompts.map((p, i) => (
                <li key={i} className="cursor-pointer hover:underline" onClick={() => setContentPrompt(p)}>
                  Variation {i + 1}
                </li>
              ))}
            </ul>
          </div>
        ),
        duration: 8000
      });
    } finally {
      setIsSuggestingPrompt(false);
    }
  };

  const handleGenerate = async () => {
    if (!contentPrompt) {
      toast({ title: "Prompt Required", description: "Please describe what you want to write.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const topic = targetKeywords || 'Personal Injury Law';

      const mockContent = `
# ${topic}: A Guide for California Accident Victims

*Disclaimer: This article is for informational purposes only and does not constitute legal advice. For personalized guidance, contact our office.*

## Introduction

If you or a loved one has been injured in **${topic}** in California, particularly in Southern California, understanding your legal rights is crucial. At **California Personal Injury Lawyers Blog**, we see firsthand the devastating impact these incidents can have on victims and their families.

From **Los Angeles** to **Riverside**, accident victims often face mounting medical bills, lost wages, and the stress of dealing with insurance companies. This guide will walk you through what you need to know if you've been injured through no fault of your own.

## Understanding Liability in California

In California, establishing liability is the cornerstone of any personal injury claim. Whether it's a **rear-end collision** on the I-405 or a **dog bite** in a residential neighborhood, you must prove that another party was negligent.

### The "Not-at-Fault" Standard
For our ideal clients—those who are clearly not at fault—the path to compensation is clearer, but not guaranteed. Insurance companies will often try to minimize payouts, even when liability seems obvious.

**Key Evidence to Preserve:**
1.  **Photos of Property Damage:** Significant visible damage to your client’s vehicle is powerful evidence.
2.  **Police Reports:** Essential for establishing the facts of the accident.
3.  **Witness Statements:** Independent verification of your account.

## Common Injuries and Medical Treatment

We specialize in helping clients who have suffered serious, life-altering injuries. It is imperative that you seek immediate medical attention, even if you think your injuries are minor.

**High-Value Injury Claims Often Involve:**
*   **Traumatic Brain Injuries (TBI):** Concussions and head trauma.
*   **Orthopedic Injuries:** Fractures, torn ligaments in knees/shoulders.
*   **Chronic Pain Conditions:** CRPS or RSD developing after trauma.
*   **Spinal Injuries:** Herniated discs in the neck or back.

**The Importance of Consistent Treatment**
Gaps in medical care can destroy your case. Whether it's emergency room visits, chiropractic care, or surgery, follow your doctor's orders. This documents the severity of your injury and justifies your claim for compensation.

## Dealing with Insurance Companies

Insurance adjusters are trained to pay you as little as possible. They may ask for a recorded statement or offer a quick settlement before you know the full extent of your injuries.

**Do not sign anything without consulting an attorney.**

We also handle cases involving **Uninsured (UM)** and **Underinsured (UIM)** motorist coverage, which is vital if the at-fault driver lacks adequate insurance.

## Conclusion: Why You Need an Attorney

Navigating a personal injury claim in California is complex. You need an advocate who understands the local courts and knows how to maximize the value of your case.

If you have been injured in an accident, don't face the insurance companies alone. Contact us today for a free consultation to discuss your case.
      `;

      const chunks = mockContent.split("");
      let currentText = "";
      for (let i = 0; i < chunks.length; i++) {
        if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 10));
        currentText += chunks[i];
        setGeneratedContent(currentText);
      }

      toast({ title: "Content Generated", description: `Created with ${aiProvider === 'free' ? 'no-cost-ai' : aiProvider}.` });

      if (includeImages) handleGenerateImages();

    } catch (error: any) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to generate content.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImages = async () => {
    setIsGeneratingImages(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGeneratedImages([
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=60"
      ]);
      toast({ title: "Images Generated", description: `Created 2 ${imageStyle} images.` });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handlePreview = () => {
    if (!generatedContent) {
      toast({ title: "Nothing to preview", description: "Generate content first.", variant: "destructive" });
      return;
    }
    const htmlContent = marked(generatedContent);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Content Preview</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.x/dist/typography.min.css" />
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="prose lg:prose-xl mx-auto p-8">
            ${htmlContent}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedContent.split('\n')[0].replace('# ', ''),
          content: generatedContent,
          campaignId: selectedCampaign || null,
          seoScore: Math.floor(Math.random() * 20) + 80,
          metaDescription: "Generated meta description",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-contents'] });
      toast({ title: "Draft Saved!", description: "Your content has been saved." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveDraft = () => {
    if (!generatedContent) {
      toast({ title: "Nothing to save", description: "Generate content first.", variant: "destructive" });
      return;
    }
    saveDraftMutation.mutate();
  };

  const handleAutoPublish = async () => {
    if (!generatedContent) {
      toast({
        title: "No content",
        description: "Generate content first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const title = generatedContent.split('\n')[0].replace('# ', '');

      const wpUrl = localStorage.getItem("wpUrl") || "https://www.californiapersonalinjurylawyersblog.com";
      const wpUser = localStorage.getItem("wpUser") || "walchlaw4";
      const wpPass = localStorage.getItem("wpPass") || "eJs3M*LnfSSo68P!RtXC9lZ";

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
            title: title,
            content: generatedContent.replace(/^# .+\n/, ''),
            excerpt: seoDescription || generatedContent.substring(0, 160),
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            meta: {
              _yoast_wpseo_title: seoTitle || title,
              _yoast_wpseo_metadesc: seoDescription
            }
          },
          config: {
            status: 'publish'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Published to WordPress!",
          description: (
            <div className="flex flex-col gap-1">
              <span>Post ID: {result.postId}</span>
              <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View Post</a>
            </div>
          )
        });

        setGeneratedContent("");
        setTargetKeywords("");
        setSeoTitle("");
        setSeoDescription("");
      } else {
        throw new Error(result.error || 'Publishing failed');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };


  return (
    <SidebarLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Content Studio</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Generate SEO-optimized content with advanced AI models
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white border-slate-200 hover:bg-slate-50" onClick={handlePreview}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button
            variant="default"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleAutoPublish}
            disabled={!generatedContent}
          >
            <Globe className="w-4 h-4" />
            Auto-Publish to WordPress
          </Button>
          <Button
            className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
            onClick={handleSaveDraft}
            disabled={saveDraftMutation.isPending}
          >
            {saveDraftMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">

        {/* LEFT PANEL - Editor */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <Card className="flex-1 border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="border-b border-slate-100 p-2 flex items-center gap-1 bg-slate-50/50 backdrop-blur-sm">
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Type className="w-4 h-4 text-slate-600" /></Button>
               <Separator orientation="vertical" className="h-4 mx-1" />
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Sparkles className="w-4 h-4 text-purple-600" /></Button>
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ImageIcon className="w-4 h-4 text-blue-600" /></Button>
               {/* Added Workflow icon */}
               <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Workflow className="w-4 h-4 text-green-600" /></Button>
               <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 px-2">
                 {isGenerating ? <span className="flex items-center gap-1 text-blue-600"><RefreshCw className="w-3 h-3 animate-spin" /> Writing...</span> : <span>Ready</span>}
               </div>
            </div>

            <div className="flex-1 p-0 relative">
              <Textarea
                className="w-full h-full resize-none border-0 focus-visible:ring-0 p-6 text-lg font-serif leading-relaxed text-slate-800 placeholder:text-slate-300"
                placeholder="Start writing or generate content..."
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
              />
              {!generatedContent && !isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-2 opacity-30">
                    <PenTool className="w-12 h-12 mx-auto text-slate-400" />
                    <p className="text-xl font-medium text-slate-600">Canvas Empty</p>
                    <p className="text-sm">Use the AI Assistant to generate a draft</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Generated Images Preview Strip */}
          {generatedImages.length > 0 && (
            <div className="h-32 flex gap-4 overflow-x-auto pb-2">
              {generatedImages.map((img, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-video h-full shrink-0">
                  <img src={img} alt="Generated" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full"><Download className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL - Assistant */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <Card className="border-slate-200 shadow-lg h-full overflow-y-auto custom-scrollbar">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="w-5 h-5 text-blue-600" />
                AI Assistant
              </CardTitle>
              <CardDescription>Configure generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              <div className="space-y-3">
                <Label>Target Campaign</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Keywords</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-9 bg-white"
                    placeholder="e.g. personal injury, lawyer..."
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Content Prompt</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={handleSuggestPrompt} disabled={isSuggestingPrompt}>
                     {isSuggestingPrompt ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                     Auto-Suggest
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe what you want to write about..."
                  className="min-h-[100px] resize-none bg-white font-mono text-sm"
                  value={contentPrompt}
                  onChange={(e) => setContentPrompt(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-slate-900 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Advanced Settings
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-500">Word Count</Label>
                    <span className="text-xs font-medium">{wordCount[0]} words</span>
                  </div>
                  <Slider value={wordCount} onValueChange={setWordCount} min={500} max={3000} step={100} className="[&>.relative>.absolute]:bg-blue-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <Label className="text-sm font-normal">Generate Images</Label>
                  </div>
                  <Switch checked={includeImages} onCheckedChange={setIncludeImages} />
                </div>

                {includeImages && (
                   <div className="space-y-2 pl-6 border-l-2 border-slate-100 ml-1">
                      <Label className="text-xs text-slate-500">Image Style</Label>
                      <Select value={imageStyle} onValueChange={setImageStyle}>
                        <SelectTrigger className="h-8 text-xs bg-white">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photorealistic">Photorealistic</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                          <SelectItem value="abstract">Abstract Tech</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Model</Label>
                <RadioGroup value={aiProvider} onValueChange={(v: any) => setAiProvider(v)} className="gap-3">
                  <div className="flex items-center justify-between space-x-2 bg-white p-2 rounded border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2">
                       <RadioGroupItem value="free" id="free" />
                       <Label htmlFor="free" className="text-sm cursor-pointer">No-Cost AI</Label>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">Free</Badge>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200 opacity-60">
                    <RadioGroupItem value="openai" id="openai" disabled />
                    <Label htmlFor="openai" className="text-sm text-slate-400">GPT-4 (Premium)</Label>
                  </div>
                </RadioGroup>
              </div>

            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 sticky bottom-0">
               <Button
                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md text-lg h-12"
                 onClick={handleGenerate}
                 disabled={isGenerating}
               >
                 {isGenerating ? (
                   <>
                     <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                     Generating...
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-5 h-5 mr-2" />
                     Generate Content
                   </>
                 )}
               </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </SidebarLayout>
  );
}