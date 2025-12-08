import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Workflow, 
  Zap, 
  Settings, 
  LogOut, 
  Globe, 
  Database, 
  MapPin, 
  Code, 
  Book, 
  ShoppingBag, 
  Megaphone, 
  SearchCheck, 
  FileText, 
  Send, 
  Sparkles, 
  Calendar,
  Search,
  Bell,
  Command,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    { icon: Globe, label: "Connected Sites", href: "/sites" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-slate-300 flex flex-col fixed h-full z-20 shadow-2xl border-r border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block">SEO Hub</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Enterprise</span>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-12 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search modules..." 
              className="bg-slate-900 border-slate-800 text-slate-300 pl-9 h-10 text-sm focus:border-blue-600 focus:ring-blue-600/20 rounded-lg"
            />
            <div className="absolute right-3 top-1/2 -translate-y-12 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
              ⌘K
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-3">Main Platform</div>
            {navItems.slice(0, 3).map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "hover:bg-slate-900 hover:text-white text-slate-400"
                  }`}>
                    <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.label === "Workflows" && <Badge className="ml-auto bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-0 text-[10px] px-1.5 h-5">NEW</Badge>}
                  </div>
                </Link>
              );
            })}

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-3">Content Engine</div>
            <Link href="/content-creator">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                location === "/content-creator"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-900 hover:text-white text-slate-400"
              }`}>
                <Sparkles className={`w-4 h-4 transition-colors ${location === "/content-creator" ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                <span className="text-sm font-medium">Content Creator</span>
              </div>
            </Link>
            <Link href="/bulk-generator">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                location === "/bulk-generator"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-900 hover:text-white text-slate-400"
              }`}>
                <Calendar className={`w-4 h-4 transition-colors ${location === "/bulk-generator" ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                <span className="text-sm font-medium">Bulk Generator</span>
              </div>
            </Link>
            <Link href="/bulk-massive">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                location === "/bulk-massive"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-900 hover:text-white text-slate-400"
              }`}>
                <Sparkles className={`w-4 h-4 transition-colors ${location === "/bulk-massive" ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                <span className="text-sm font-medium">Bulk Massive (8x)</span>
                <span className="ml-auto text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">PRO</span>
              </div>
            </Link>
            <Link href="/content-manager">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                location === "/content-manager"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-900 hover:text-white text-slate-400"
              }`}>
                <FileText className={`w-4 h-4 transition-colors ${location === "/content-manager" ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                <span className="text-sm font-medium">Content Manager</span>
              </div>
            </Link>
            <Link href="/content-publisher">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                location === "/content-publisher"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-900 hover:text-white text-slate-400"
              }`}>
                <Send className={`w-4 h-4 transition-colors ${location === "/content-publisher" ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                <span className="text-sm font-medium">Publisher</span>
              </div>
            </Link>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-3">Configuration</div>
            {navItems.slice(3).map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "hover:bg-slate-900 hover:text-white text-slate-400"
                  }`}>
                    <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-medium text-slate-400">Systems Operational</span>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
            <Avatar className="w-9 h-9 border-2 border-slate-700 group-hover:border-blue-500 transition-colors">
              <AvatarFallback className="bg-slate-800 text-xs font-bold text-white">WL</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">walchlaw4</div>
              <div className="text-xs text-slate-500 truncate">Administrator</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}