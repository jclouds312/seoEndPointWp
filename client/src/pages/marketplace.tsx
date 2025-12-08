import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Star, Check, Search, Zap, Image, Link as LinkIcon, FileText, Share2, Shield, LayoutTemplate, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const tools = [
  {
    id: "schema-gen",
    name: "Schema Markup Generator",
    description: "Auto-generate JSON-LD schema for legal articles.",
    category: "Technical SEO",
    rating: 4.9,
    installs: "2.4k",
    icon: LayoutTemplate, // Assuming CodeIcon was a placeholder and LayoutTemplate is intended
    installed: true,
  },
  {
    id: "img-opt",
    name: "Legal Image Optimizer",
    description: "Compress and tag images with case-relevant alt text.",
    category: "Media",
    rating: 4.7,
    installs: "1.8k",
    icon: Image,
    installed: false,
  },
  {
    id: "link-mon",
    name: "Citation & Link Monitor",
    description: "Track backlinks from legal directories and news sites.",
    category: "Off-Page",
    rating: 4.8,
    installs: "3.1k",
    icon: LinkIcon,
    installed: true,
  },
  {
    id: "content-ai",
    name: "Legal Content AI",
    description: "AI writing assistant trained on California Personal Injury law.",
    category: "Content",
    rating: 4.9,
    installs: "5k+",
    icon: FileText,
    installed: false,
  },
  {
    id: "social-auto",
    name: "Social Signal Booster",
    description: "Auto-share successful case studies to LinkedIn & Twitter.",
    category: "Social",
    rating: 4.5,
    installs: "900+",
    icon: Share2,
    installed: false,
  },
  {
    id: "local-pack",
    name: "Local Pack Tracker",
    description: "Monitor GMB rankings for 'Personal Injury Lawyer' keywords.",
    category: "Local SEO",
    rating: 4.8,
    installs: "4.2k",
    icon: MapPinIcon,
    installed: true,
  }
];

function MapPinIcon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

export default function Marketplace() {
  const [installedTools, setInstalledTools] = useState<Set<string>>(new Set(tools.filter(t => t.installed).map(t => t.id)));
  const [installing, setInstalling] = useState<string | null>(null);

  // Placeholder for install/uninstall mutations as they were not provided
  const installMutation = { isPending: false };
  const uninstallMutation = { isPending: false };

  const handleInstall = (tool: any) => {
    setInstalling(tool.id);
    // In a real app, this would be an API call
    setTimeout(() => {
      setInstalledTools(prev => new Set(prev).add(tool.id));
      setInstalling(null);
      toast({
        title: "Module Installed",
        description: `${tool.name} has been added to your SEO toolkit.`,
      });
    }, 1500);
  };

  // Placeholder for handleUninstall as it was not provided in the original or changes
  const handleUninstall = (id: string) => {
    setInstalling(id); // Re-using 'installing' state for uninstalling feedback
    setTimeout(() => {
      setInstalledTools(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setInstalling(null);
      toast({
        title: "Module Uninstalled",
        description: `Module with ID ${id} has been removed.`,
      });
    }, 1500);
  };


  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SEO Add-ons Marketplace</h1>
          <p className="text-slate-500 mt-1">Install specialized modules for your legal blog</p>
        </div>
        <div className="relative w-64">
           <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
           <input 
             className="w-full h-10 pl-9 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             placeholder="Search add-ons..."
           />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["All", "Technical SEO", "Content", "Local SEO", "Off-Page", "Media"].map((cat, i) => (
          <Badge key={i} variant="secondary" className="px-4 py-1.5 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap">
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    installedTools.has(tool.id) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  {tool.rating}
                </div>
              </div>
              <CardTitle className="mt-4 text-lg">{tool.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" /> {tool.installs} installs
                </span>
                <span>{tool.category}</span>
              </div>

              {installedTools.has(tool.id) ? (
                 <Button variant="outline" className="w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 gap-2 cursor-default">
                   <Check className="w-4 h-4" /> Installed
                 </Button>
              ) : (
                <Button 
                  className="w-full bg-slate-900 hover:bg-blue-700 text-white gap-2"
                  onClick={() => handleInstall(tool)}
                  disabled={installing === tool.id}
                >
                  {installing === tool.id ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" /> Installing...
                    </>
                  ) : (
                    <>
                       Install Add-on
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </SidebarLayout>
  );
}