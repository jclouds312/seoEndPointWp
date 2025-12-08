import { Link, useLocation } from "wouter";
import { LayoutDashboard, Workflow, Zap, Settings, LogOut, Globe, Database, MapPin, Code, Book, ShoppingBag, Megaphone, SearchCheck, FileText, Send, Sparkles, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: SearchCheck, label: "SEO Analyzer", href: "/seo-analyzer" },
    { icon: Workflow, label: "Workflows", href: "/workflows" },
    { icon: Zap, label: "Integrations", href: "/integrations" },
    { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
    { icon: Database, label: "Data Sources", href: "/data-sources" },
    { icon: MapPin, label: "Local SEO & Publish", href: "/local-seo" },
    { icon: Code, label: "Deployment", href: "/deployment" },
    { icon: Book, label: "Documentation", href: "/documentation" },
    { icon: Zap, label: "Jetpack Features", href: "/jetpack" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Megaphone, label: "Campañas", href: "/campaigns" },
    { icon: FileText, label: "Crear Contenido", href: "/content-creator" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">SEO Hub</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "hover:bg-slate-800 hover:text-white"
                  }`}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
            {/* Placeholder for SidebarMenuButton, assuming it's defined elsewhere and handles styling */}
            <Link href="/content-creator">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer ${
                location === "/content-creator"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}>
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Crear Contenido</span>
              </div>
            </Link>
            <Link href="/bulk-generator">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer ${
                location === "/bulk-generator"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}>
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Generador Masivo (8/mes)</span>
              </div>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-400">n8n System Status</span>
            </div>
            <div className="text-sm font-semibold text-white">Operational</div>
          </div>

          <Separator className="bg-slate-800 mb-4" />

          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 border border-slate-700">
              <AvatarFallback className="bg-slate-800 text-xs">WL</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">walchlaw4</div>
              <div className="text-xs text-slate-500 truncate">Admin</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800 text-slate-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}