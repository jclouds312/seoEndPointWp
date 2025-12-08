import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Layers,
  Settings,
  FileText,
  Zap,
  BarChart3,
  Globe,
  Database
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Layers, label: "Bulk Massive", href: "/bulk" },
    { icon: FileText, label: "Content Manager", href: "/content" },
    { icon: BarChart3, label: "SEO Analytics", href: "/analytics" },
    { icon: Globe, label: "Sites & APIs", href: "/sites" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Zap className="h-6 w-6 fill-primary text-primary-foreground" />
            <span>SEO Endpoint</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Super Version v2.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">API Usage</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%]" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>750/1000 reqs</span>
              <span>75%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur sticky top-0 z-10">
          <h1 className="text-lg font-semibold">
            {navItems.find((n) => n.href === location)?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold text-xs">
              AD
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
