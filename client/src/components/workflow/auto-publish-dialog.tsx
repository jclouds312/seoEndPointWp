import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Globe, Database, FileText, Image as ImageIcon, Calendar, CheckCircle2, ArrowRight, Zap, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AutoPublishWorkflowDialog({ 
  open, 
  onOpenChange,
  onCreate
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onCreate?: (config: any) => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    n8nWebhook: "",
    wpUrl: "",
    wpUsername: "",
    wpPassword: "",
    postType: "post",
    titleSource: "ai_generated",
    contentStructure: "standard",
    includeImages: true,
    imageSource: "stock_ai",
    postsPerMonth: "8",
    status: "draft"
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleCreate();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    toast({
      title: "Workflow Created",
      description: "Auto-publishing workflow has been successfully configured.",
    });
    if (onCreate) onCreate(config);
    onOpenChange(false);
    setStep(1); // Reset for next time
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Create Auto-Publishing Workflow</DialogTitle>
          </div>
          <DialogDescription>
            Configure an automated flow to connect n8n with WordPress for scheduled content publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Steps Indicator */}
          <div className="flex items-center justify-between mb-8 px-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
            
            <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= 1 ? 'bg-white border-blue-600' : 'bg-slate-50 border-slate-200'}`}>1</div>
              <span className="text-xs font-medium">Connect</span>
            </div>
            
            <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= 2 ? 'bg-white border-blue-600' : 'bg-slate-50 border-slate-200'}`}>2</div>
              <span className="text-xs font-medium">Content</span>
            </div>
            
            <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= 3 ? 'bg-white border-blue-600' : 'bg-slate-50 border-slate-200'}`}>3</div>
              <span className="text-xs font-medium">Schedule</span>
            </div>
          </div>

          {/* Step 1: Connections */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b pb-2">
                  <Globe className="w-4 h-4" />
                  <h3>WordPress Configuration</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>WordPress Site URL</Label>
                    <Input 
                      placeholder="https://your-site.com" 
                      value={config.wpUrl}
                      onChange={(e) => setConfig({...config, wpUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      placeholder="admin" 
                      value={config.wpUsername}
                      onChange={(e) => setConfig({...config, wpUsername: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Application Password</Label>
                    <Input 
                      type="password" 
                      placeholder="xxxx xxxx xxxx xxxx" 
                      value={config.wpPassword}
                      onChange={(e) => setConfig({...config, wpPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b pb-2">
                  <Settings className="w-4 h-4" />
                  <h3>n8n Configuration</h3>
                </div>
                <div className="space-y-2">
                  <Label>n8n Webhook URL</Label>
                  <Input 
                    placeholder="https://n8n.your-domain.com/webhook/..." 
                    value={config.n8nWebhook}
                    onChange={(e) => setConfig({...config, n8nWebhook: e.target.value})}
                  />
                  <p className="text-xs text-slate-500">The webhook that triggers the generation process.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content Settings */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b pb-2">
                  <FileText className="w-4 h-4" />
                  <h3>Content Structure</h3>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Title Generation</Label>
                    <Select 
                      value={config.titleSource} 
                      onValueChange={(val) => setConfig({...config, titleSource: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_generated">AI Generated (SEO Optimized)</SelectItem>
                        <SelectItem value="keyword_based">Direct Keyword Match</SelectItem>
                        <SelectItem value="csv_import">Import from CSV/List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Content Template</Label>
                    <Select 
                      value={config.contentStructure} 
                      onValueChange={(val) => setConfig({...config, contentStructure: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Blog Post (Intro, Body, Conclusion)</SelectItem>
                        <SelectItem value="howto">How-To Guide</SelectItem>
                        <SelectItem value="review">Product Review</SelectItem>
                        <SelectItem value="listicle">Listicle / Top 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-slate-900 font-semibold border-b pb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <h3>Media Settings</h3>
                  </div>
                  <Switch 
                    checked={config.includeImages} 
                    onCheckedChange={(checked) => setConfig({...config, includeImages: checked})}
                  />
                </div>
                
                {config.includeImages && (
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Image Source</Label>
                          <Select 
                            value={config.imageSource} 
                            onValueChange={(val) => setConfig({...config, imageSource: val})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stock_ai">AI Generated (DALL-E 3 / Midjourney)</SelectItem>
                              <SelectItem value="stock_free">Free Stock Photos (Unsplash/Pexels)</SelectItem>
                              <SelectItem value="media_library">WordPress Media Library</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Images will be automatically inserted between H2 headers</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Scheduling */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b pb-2">
                  <Calendar className="w-4 h-4" />
                  <h3>Publishing Schedule</h3>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl font-bold text-blue-600">
                    {config.postsPerMonth}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Posts per Month</h4>
                    <p className="text-sm text-slate-500">How many articles to generate and publish monthly</p>
                  </div>
                  <div className="w-full max-w-[200px]">
                    <Select 
                      value={config.postsPerMonth} 
                      onValueChange={(val) => setConfig({...config, postsPerMonth: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 Posts (1 per week)</SelectItem>
                        <SelectItem value="8">8 Posts (2 per week)</SelectItem>
                        <SelectItem value="12">12 Posts (3 per week)</SelectItem>
                        <SelectItem value="30">30 Posts (Daily)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Label>Initial Post Status</Label>
                  <Select 
                    value={config.status} 
                    onValueChange={(val) => setConfig({...config, status: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">Publish Immediately</SelectItem>
                      <SelectItem value="draft">Save as Draft</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1}
          >
            Back
          </Button>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              {step === 3 ? (
                <>Create Workflow <Zap className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
