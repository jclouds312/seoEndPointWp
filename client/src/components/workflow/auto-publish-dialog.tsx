import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Globe, FileText, Image as ImageIcon, Calendar, CheckCircle2, ArrowRight, Zap, Settings, Info, AlertTriangle, Key, Loader2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [config, setConfig] = useState({
    n8nWebhook: "",
    wpUrl: "https://www.californiapersonalinjurylawyersblog.com",
    wpUsername: "walchlaw4",
    wpPassword: "eJs3M*LnfSSo68P!RtXC9lZ",
    postType: "post",
    titleSource: "ai_generated",
    contentStructure: "standard",
    includeImages: true,
    imageSource: "stock_ai",
    postsPerMonth: "9",
    status: "publish"
  });

  const testConnection = async () => {
    if (!config.wpUrl || !config.wpUsername || !config.wpPassword) {
      toast({
        title: "Missing credentials",
        description: "Please fill in all WordPress connection fields.",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setConnectionStatus('idle');
    
    try {
      const response = await fetch('/api/wordpress/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: config.wpUrl,
          username: config.wpUsername,
          applicationPassword: config.wpPassword.replace(/\s+/g, ' ').trim()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        setConnectionMessage(result.message);
        toast({
          title: "Connection successful!",
          description: result.message,
        });
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.message);
        toast({
          title: "Connection failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionMessage(error.message || 'Connection failed');
      toast({
        title: "Error",
        description: error.message || 'Failed to test connection',
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

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
      description: `Auto-publishing workflow configured for ${config.postsPerMonth} posts per month.`,
    });
    if (onCreate) onCreate(config);
    onOpenChange(false);
    setStep(1);
    setConnectionStatus('idle');
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
            No paid plugins required - uses native WordPress REST API.
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Métodos de Conexión Disponibles</p>
                      <p className="leading-relaxed mb-2">
                        <strong>REST API (Recomendado):</strong> Usa Application Password, sin plugins.
                      </p>
                      <p className="leading-relaxed">
                        <strong>Auto-Login:</strong> Usa credenciales de wp-login.php para publicar directamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>WordPress Site URL</Label>
                    <Input 
                      placeholder="https://your-site.com" 
                      value={config.wpUrl}
                      onChange={(e) => setConfig({...config, wpUrl: e.target.value})}
                    />
                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Permalinks must be set to "Post Name" (Settings {'>'} Permalinks)</span>
                    </div>
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
                    <div className="flex items-center justify-between">
                      <Label>Password</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-xs text-blue-600">
                              Application Password o Login?
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] p-4">
                            <p className="text-xs mb-2"><strong>Application Password (REST API):</strong></p>
                            <ol className="list-decimal ml-4 space-y-1 text-xs mb-3">
                              <li>WP Admin {'>'} Users {'>'} Profile</li>
                              <li>Scroll to "Application Passwords"</li>
                              <li>Add New and copy the code</li>
                            </ol>
                            <p className="text-xs"><strong>Login Password:</strong> Tu contraseña normal de wp-login.php (e.g., eJs3M*LnfSSo68P!RtXC9lZ)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input 
                        type="password" 
                        placeholder="Application Password o Login Password" 
                        className="pl-9 font-mono"
                        value={config.wpPassword}
                        onChange={(e) => setConfig({...config, wpPassword: e.target.value})}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Soporta Application Password (xxxx xxxx xxxx xxxx) o contraseña normal
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={testing}
                    className="w-full"
                    data-testid="button-test-connection"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : connectionStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                        Connected: {connectionMessage}
                      </>
                    ) : connectionStatus === 'error' ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        Failed - Click to retry
                      </>
                    ) : (
                      <>Test WordPress Connection</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold border-b pb-2">
                  <Settings className="w-4 h-4" />
                  <h3>n8n Configuration (Optional)</h3>
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
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                  <h4 className="text-sm font-medium text-slate-900 mb-2">AI Content Generation</h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc ml-4">
                    <li>Generates structured content (JSON) separating <strong>Title</strong> and <strong>Body</strong></li>
                    <li>Automatically handles HTML formatting for WordPress</li>
                    <li>Optimized for SEO with keyword integration</li>
                  </ul>
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
                        
                        <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-600">
                          <p className="font-medium mb-1 text-slate-900">Workflow Process (Automated):</p>
                          <ol className="list-decimal ml-4 space-y-1">
                            <li>Workflow uploads image to WordPress Media Library</li>
                            <li>Gets the new Media ID</li>
                            <li>Attaches Media ID as "Featured Image" to the post</li>
                          </ol>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
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
                      <SelectTrigger data-testid="select-posts-per-month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 Posts (1 per week)</SelectItem>
                        <SelectItem value="8">8 Posts (2 per week)</SelectItem>
                        <SelectItem value="9">9 Posts (Recommended)</SelectItem>
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
