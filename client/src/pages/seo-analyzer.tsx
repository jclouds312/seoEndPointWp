
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Smartphone, Monitor, Globe, Wand2, Share2, Twitter, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface SEOResult {
  text: string;
  score: number;
  type: string;
}

export default function SeoAnalyzer() {
  const [content, setContent] = useState("This is a sample text. It is not very long. You should write more content to get a better score. SEO is important for your website visibility.");
  const [keyword, setKeyword] = useState("SEO");
  const [title, setTitle] = useState("Ultimate Guide to SEO Optimization - 2025 Edition");
  const [slug, setSlug] = useState("ultimate-guide-seo-optimization");
  const [metaDesc, setMetaDesc] = useState("Learn how to optimize your website for search engines with our comprehensive guide. Improve rankings and drive traffic today.");
  const [results, setResults] = useState<SEOResult[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isFixing, setIsFixing] = useState(false);

  const runAnalysis = () => {
    if (!content) return;

    const analysisResults: SEOResult[] = [];
    let passed = 0;
    let total = 0;

    // Word count analysis
    const wordCount = content.trim().split(/\s+/).length;
    const wordCountScore = wordCount > 300 ? 9 : wordCount > 150 ? 6 : 3;
    analysisResults.push({
      text: `Text length: The text contains <strong>${wordCount} words</strong>. ${wordCount > 300 ? 'Good job!' : wordCount > 150 ? 'Consider adding more content.' : 'This is below the recommended minimum.'}`,
      score: wordCountScore,
      type: "length"
    });
    if (wordCountScore >= 7) passed++;
    total++;

    // Keyword in title
    const keywordInTitle = title.toLowerCase().includes(keyword.toLowerCase());
    const titleKeywordScore = keywordInTitle ? 9 : 2;
    analysisResults.push({
      text: keywordInTitle 
        ? `Keyphrase in title: The focus keyphrase appears in the SEO title.` 
        : `Keyphrase in title: The focus keyphrase does not appear in the SEO title.`,
      score: titleKeywordScore,
      type: "titleKeyword"
    });
    if (titleKeywordScore >= 7) passed++;
    total++;

    // Keyphrase length
    const keyphraseWords = keyword.split(' ').length;
    const keyphraseLengthScore = keyphraseWords <= 4 ? 9 : 4;
    analysisResults.push({
      text: `Keyphrase length: ${keyphraseWords <= 4 ? 'Good job!' : 'Your keyphrase is rather long. Consider using a shorter keyphrase.'}`,
      score: keyphraseLengthScore,
      type: "keywordLength"
    });
    if (keyphraseLengthScore >= 7) passed++;
    total++;

    // Keyphrase density
    const keywordRegex = new RegExp(keyword, "gi");
    const keywordMatches = (content.match(keywordRegex) || []).length;
    const density = (keywordMatches / wordCount) * 100;
    const densityScore = density >= 0.5 && density <= 2.5 ? 9 : density > 0 ? 6 : 2;
    analysisResults.push({
      text: `Keyphrase density: The focus keyphrase was found <strong>${keywordMatches} times</strong>. That's a ${density.toFixed(2)}% density. ${densityScore >= 7 ? 'Good job!' : 'Consider using the keyphrase more often.'}`,
      score: densityScore,
      type: "density"
    });
    if (densityScore >= 7) passed++;
    total++;

    // Meta description length
    const metaLength = metaDesc.length;
    const metaLengthScore = metaLength >= 120 && metaLength <= 160 ? 9 : metaLength > 0 ? 5 : 2;
    analysisResults.push({
      text: `Meta description length: ${metaLengthScore >= 7 ? 'Well done!' : metaLength < 120 ? 'The meta description is too short.' : 'The meta description is too long.'}`,
      score: metaLengthScore,
      type: "meta"
    });
    if (metaLengthScore >= 7) passed++;
    total++;

    // Keyphrase in meta description
    const keywordInMeta = metaDesc.toLowerCase().includes(keyword.toLowerCase());
    const metaKeywordScore = keywordInMeta ? 9 : 3;
    analysisResults.push({
      text: keywordInMeta 
        ? `Keyphrase in meta description: The focus keyphrase appears in the meta description.` 
        : `Keyphrase in meta description: The meta description doesn't contain the focus keyphrase.`,
      score: metaKeywordScore,
      type: "metaKeyword"
    });
    if (metaKeywordScore >= 7) passed++;
    total++;

    // Keyphrase in introduction
    const intro = content.slice(0, Math.min(content.length, 200));
    const keywordInIntro = intro.toLowerCase().includes(keyword.toLowerCase());
    const introScore = keywordInIntro ? 9 : 3;
    analysisResults.push({
      text: keywordInIntro 
        ? `Keyphrase in introduction: The focus keyphrase appears in the first paragraph.` 
        : `Keyphrase in introduction: The focus keyphrase doesn't appear in the first paragraph.`,
      score: introScore,
      type: "intro"
    });
    if (introScore >= 7) passed++;
    total++;

    // Title length
    const titleLength = title.length;
    const titleLengthScore = titleLength >= 30 && titleLength <= 60 ? 9 : titleLength > 0 ? 5 : 2;
    analysisResults.push({
      text: `SEO title length: ${titleLengthScore >= 7 ? 'Good job!' : titleLength < 30 ? 'The SEO title is too short.' : 'The SEO title is too long.'}`,
      score: titleLengthScore,
      type: "titleLength"
    });
    if (titleLengthScore >= 7) passed++;
    total++;

    // Subheadings
    const hasSubheadings = content.includes('\n\n') || content.split(/[.!?]/).length > 5;
    const subheadingScore = hasSubheadings ? 7 : 4;
    analysisResults.push({
      text: hasSubheadings 
        ? `Subheading distribution: Great! Your text structure looks good.` 
        : `Subheading distribution: Consider adding subheadings to improve readability.`,
      score: subheadingScore,
      type: "subheadings"
    });
    if (subheadingScore >= 7) passed++;
    total++;

    setResults(analysisResults);
    const calculatedScore = Math.round((passed / total) * 100);
    setScore(calculatedScore);
  };

  useEffect(() => {
    runAnalysis();
  }, [content, keyword, title, metaDesc]);

  const handleFixWithAI = () => {
    setIsFixing(true);
    setTimeout(() => {
      setContent(prev => prev + "\n\nAlso, keep in mind that " + keyword + " is crucial for modern digital strategies. This additional paragraph helps improve the word count and keyword density naturally.");
      setMetaDesc(prev => prev.includes(keyword) ? prev : prev + " Learn more about " + keyword + " here.");
      setIsFixing(false);
      toast({
        title: "Optimized!",
        description: "AI has improved your content density and meta description."
      });
    }, 1500);
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Real-time SEO Analyzer</h1>
          <p className="text-slate-500 mt-1">Professional SEO analysis engine with Google Preview</p>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                onClick={handleFixWithAI} 
                disabled={isFixing || score > 90}
                className="gap-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
            >
                {isFixing ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Fixing...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-4 h-4" />
                        Fix with AI
                    </>
                )}
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Analysis Active
            </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Content Editor</CardTitle>
              <CardDescription>Optimize your content for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Focus Keyphrase</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="keyword" 
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-9"
                    placeholder="Enter main keyword..." 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Article Content</Label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                  placeholder="Start writing or paste your content here..." 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Search & Social Previews</CardTitle>
              <CardDescription>See how your page looks on different platforms</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="mobile" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="mobile" className="gap-2">
                            <Smartphone className="w-4 h-4" /> Mobile
                        </TabsTrigger>
                        <TabsTrigger value="desktop" className="gap-2">
                            <Monitor className="w-4 h-4" /> Desktop
                        </TabsTrigger>
                        <TabsTrigger value="social" className="gap-2">
                            <Share2 className="w-4 h-4" /> Social
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="mobile" className="bg-white p-4 rounded-lg border border-slate-100 max-w-sm mx-auto sm:mx-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-500">
                                <Globe className="w-3 h-3" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-800">example.com</span>
                                <span className="text-[10px] text-slate-500">https://example.com › {slug}</span>
                            </div>
                        </div>
                        <h3 className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer mb-1">
                            {title || "Page Title"}
                        </h3>
                        <p className="text-sm text-slate-600 leading-snug">
                            {metaDesc || "Please provide a meta description to see how it looks in search results."}
                        </p>
                    </TabsContent>

                    <TabsContent value="desktop" className="bg-white p-6 rounded-lg border border-slate-100">
                        <div className="flex flex-col mb-1">
                            <div className="flex items-center gap-1 text-sm text-slate-800">
                                <span>example.com</span>
                                <span className="text-slate-400">›</span>
                                <span>{slug}</span>
                            </div>
                            <div className="text-xs text-slate-500 mb-1">https://example.com/{slug}</div>
                        </div>
                        <h3 className="text-[#1a0dab] text-xl hover:underline cursor-pointer mb-1">
                            {title || "Page Title"}
                        </h3>
                        <p className="text-sm text-slate-600 max-w-2xl">
                            {metaDesc || "Please provide a meta description to see how it looks in search results."}
                        </p>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-6">
                        <div className="border rounded-lg overflow-hidden bg-white max-w-md">
                            <div className="bg-slate-100 h-48 w-full flex items-center justify-center text-slate-400">
                                <FileText className="w-12 h-12" />
                            </div>
                            <div className="p-4 bg-slate-50 border-t">
                                <div className="uppercase text-xs text-slate-500 font-semibold mb-1">EXAMPLE.COM</div>
                                <div className="font-bold text-slate-900 mb-1 leading-tight">{title}</div>
                                <div className="text-sm text-slate-600 line-clamp-2">{metaDesc}</div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="grid gap-4 mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="space-y-2">
                        <Label htmlFor="seo-title">SEO Title</Label>
                        <Input 
                            id="seo-title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${title.length > 60 ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${Math.min(100, (title.length / 60) * 100)}%` }} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input 
                            id="slug" 
                            value={slug} 
                            onChange={(e) => setSlug(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meta-desc">Meta Description</Label>
                        <Textarea 
                            id="meta-desc" 
                            value={metaDesc} 
                            onChange={(e) => setMetaDesc(e.target.value)}
                            rows={3}
                        />
                         <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${metaDesc.length > 160 ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${Math.min(100, (metaDesc.length / 160) * 100)}%` }} 
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm sticky top-6">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-6">
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-8 ${
                    score >= 80 ? 'border-green-500 text-green-600' : 
                    score >= 50 ? 'border-amber-500 text-amber-600' : 
                    'border-red-500 text-red-600'
                }`}>
                  <div className="text-center">
                    <span className="text-3xl font-bold">{score}</span>
                    <span className="block text-xs uppercase font-bold text-slate-400 mt-1">Score</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-slate-900 border-b pb-2">SEO Analysis</h4>
                {results && results.map((result: SEOResult, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div className="mt-0.5 shrink-0">
                            {result.score >= 7 ? (
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            ) : result.score >= 4 ? (
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                            ) : (
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                            )}
                        </div>
                        <p className="text-sm text-slate-600 leading-snug" dangerouslySetInnerHTML={{ __html: result.text }} />
                    </div>
                ))}
                
                {(!results || results.length === 0) && (
                    <div className="text-sm text-slate-400 italic text-center py-4">
                        Add content to generate analysis...
                    </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
                <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900 text-sm">Readability Check</h4>
                        <p className="text-xs text-blue-700 mt-1">
                            Content is {content.split(' ').length > 100 ? 'well-structured' : 'brief'} with {content.split('.').length} sentences
                        </p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}