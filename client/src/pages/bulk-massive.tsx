import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BulkMassive() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setStep(3); // Success state
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Bulk Massive Module</h2>
        <p className="text-muted-foreground mt-2">
          Generate 8 optimized content pieces simultaneously using the Super Version engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Core Configuration
              </CardTitle>
              <CardDescription>
                Configure the seed parameters for the massive generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Main Keyword / Topic</Label>
                <Input placeholder="e.g. Artificial Intelligence in Healthcare" className="text-lg" />
                <p className="text-xs text-muted-foreground">
                  This will be the root for all 8 generated variations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone of Voice</Label>
                  <Select defaultValue="pro">
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pro">Professional</SelectItem>
                      <SelectItem value="cas">Casual</SelectItem>
                      <SelectItem value="aca">Academic</SelectItem>
                      <SelectItem value="per">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label>Advanced SEO Parameters</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Internal Linking</Label>
                    <p className="text-xs text-muted-foreground">Smartly link to existing content</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Schema Markup</Label>
                    <p className="text-xs text-muted-foreground">Generate JSON-LD for all posts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Image Generation</Label>
                    <p className="text-xs text-muted-foreground">Create AI hero images for each</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  className="w-full h-12 text-lg gap-2" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating 8 Variations...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Execute Bulk Massive (8x)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview / Status Panel */}
        <div className="space-y-6">
          <Card className="border-border bg-muted/30">
            <CardHeader>
              <CardTitle>Generation Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border border-border bg-card transition-all duration-500",
                      isGenerating ? "opacity-100" : "opacity-50 grayscale",
                      isGenerating && i === 2 && "border-primary ring-1 ring-primary/20"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-2 w-24 bg-muted rounded mb-1.5" />
                      <div className="h-1.5 w-16 bg-muted/50 rounded" />
                    </div>
                    {isGenerating && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
