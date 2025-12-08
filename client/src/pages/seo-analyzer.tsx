import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Smartphone, Monitor, Globe, Wand2, Share2, Twitter, Facebook, BarChart } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface SEOResult {
  text: string;
  score: number;
  type: string;
}

export default function SeoAnalyzer() {
  const [content, setContent] = useState("Search Engine Optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic (known as 'natural' or 'organic' results) rather than direct traffic or paid traffic.");
  const [keyword, setKeyword] = useState("SEO");
  const [title, setTitle] = useState("Ultimate Guide to SEO Optimization - 2025 Edition");
  const [slug, setSlug] = useState("ultimate-guide-seo-optimization");
  const [metaDesc, setMetaDesc] = useState("Learn how to optimize your website for search engines with our comprehensive guide. Improve rankings and drive traffic today.");
  const [results, setResults] = useState<SEOResult[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isFixing, setIsFixing] = useState(false);

  // Re-run analysis when content changes
  useEffect(() => {
    runAnalysis();
  }, [content, keyword, title, metaDesc]);

  const runAnalysis = () => {
    if (!content) return;

    const analysisResults: SEOResult[] = [];
    let passed = 0;
    let total = 0;

    // 1. Word Count
    const wordCount = content.trim().split(/\s+/).length;
    const wordCountScore = wordCount > 300 ? 9 : wordCount > 150 ? 6 : 3;
    analysisResults.push({
      text: `Text length: <strong>${wordCount} words</strong>. ${wordCount > 300 ? 'Great depth!' : 'Consider adding more content.'}`,
      score: wordCountScore,
      type: "length"
    });
    if (wordCountScore >= 7) passed++;
    total++;

    // 2. Keyword in Title
    const keywordInTitle = title.toLowerCase().includes(keyword.toLowerCase());
    const titleScore = keywordInTitle ? 9 : 2;
    analysisResults.push({
      text: keywordInTitle ? "Keyphrase appears in SEO title." : "Keyphrase missing from SEO title.",
      score: titleScore,
      type: "title"
    });
    if (titleScore >= 7) passed++;
    total++;

    // 3. Keyword Density
    const matches = (content.match(new RegExp(keyword, "gi")) || []).length;
    const density = (matches / wordCount) * 100;
    const densityScore = density >= 0.5 && density <= 2.5 ? 9 : 5;
    analysisResults.push({
      text: `Keyphrase density: <strong>${density.toFixed(1)}%</strong> (${matches} times).`,
      score: densityScore,
      type: "density"
    });
    if (densityScore >= 7) passed++;
    total++;

    setResults(analysisResults);
    setScore(Math.round((passed / total) * 100));
  };

  const handleFixWithAI = () => {
    setIsFixing(true);
    setTimeout(() => {
      setContent(prev => prev + `\n\nAdditionally, maximizing your ${keyword} strategy involves understanding user intent. By aligning your content with what users are actually searching for, you can significantly improve your search rankings and visibility.`);
      setIsFixing(false);
      toast({ title: "Optimized!", description: "AI has expanded your content depth." });
    }, 1500);
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Real-Time SEO Analyzer</h1>
          <p className="text-slate-500 mt-1">Optimize your content for maximum search visibility</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => setContent("")}>
            <RefreshCw className="w-4 h-4" /> Clear
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" onClick={handleFixWithAI} disabled={isFixing}>
            {isFixing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Auto-Optimize
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* LEFT COLUMN - Editor */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="flex-1 border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-4">
                 <div className="flex-1">
                   <Label htmlFor="keyword" className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Focus Keyphrase</Label>
                   <div className="relative mt-1">
                     <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                     <Input 
                        id="keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-9 bg-white border-slate-200 focus-visible:ring-indigo-500"
                        placeholder="e.g. digital marketing"
                     />
                   </div>
                 </div>
                 <div className="flex-1">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">SEO Title</Label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 bg-white border-slate-200"
                    />
                 </div>
               </div>
            </CardHeader>
            <div className="flex-1 p-0">
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full resize-none border-0 focus-visible:ring-0 p-6 text-base font-serif leading-relaxed text-slate-800"
                placeholder="Paste your article content here to begin analysis..."
              />
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN - Analysis & Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Score Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path 
                      className={`${score > 80 ? 'text-green-500' : score > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                      strokeDasharray={`${score}, 100`} 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-slate-900">{score}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-900">Analysis Summary</h3>
                  <div className="space-y-1">
                    {results.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${r.score >= 7 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-slate-600 truncate" dangerouslySetInnerHTML={{__html: r.text}} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Preview */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                SERP Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-white rounded p-1">
                <div className="flex items-center gap-2 text-sm text-slate-800 mb-1">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px]">W</div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs">www.example.com</span>
                    <span className="text-[10px] text-slate-500">https://www.example.com › {slug}</span>
                  </div>
                </div>
                <h3 className="text-[#1a0dab] text-xl hover:underline cursor-pointer mb-1 leading-snug">
                  {title || "Page Title"}
                </h3>
                <p className="text-sm text-slate-600 leading-snug">
                  {metaDesc || "Please provide a meta description to see how it looks in search results..."}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                 <Label className="text-xs text-slate-500">Meta Description Editor</Label>
                 <Textarea 
                   value={metaDesc}
                   onChange={(e) => setMetaDesc(e.target.value)}
                   className="h-20 text-sm"
                 />
                 <div className="flex justify-between text-xs text-slate-400">
                   <span>{metaDesc.length} / 160 characters</span>
                   <span className={metaDesc.length > 160 ? "text-red-500" : "text-green-500"}>
                     {metaDesc.length > 160 ? "Too Long" : "Optimal"}
                   </span>
                 </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </SidebarLayout>
  );
}