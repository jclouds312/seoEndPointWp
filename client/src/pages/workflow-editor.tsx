import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, MoreVertical, GitBranch, Settings2, FileJson, Zap, ArrowRight, Database, Mail } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const workflows = [
  {
    id: 1,
    name: "Yoast Metadata Sync",
    description: "Syncs metadata from California Personal Injury Blog to external SEO tools.",
    status: "active",
    lastRun: "5 mins ago",
    nodes: 12
  },
  {
    id: 2,
    name: "Keyword Density Analyzer",
    description: "Analyzes new posts for keyword density and suggests improvements via email.",
    status: "active",
    lastRun: "1 hour ago",
    nodes: 8
  },
  {
    id: 3,
    name: "Internal Link Builder",
    description: "Automatically suggests internal links based on content analysis.",
    status: "paused",
    lastRun: "2 days ago",
    nodes: 15
  },
  {
    id: 4,
    name: "Competitor Analysis Cron",
    description: "Daily check of competitor rankings for primary keywords.",
    status: "active",
    lastRun: "12 hours ago",
    nodes: 6
  }
];

function Node({ icon: Icon, label, type, x, y }: { icon: any, label: string, type: 'trigger' | 'action' | 'logic', x: number, y: number }) {
  const colors = {
    trigger: 'bg-emerald-500 border-emerald-600',
    action: 'bg-blue-500 border-blue-600',
    logic: 'bg-slate-500 border-slate-600'
  };

  return (
    <div 
      className={`absolute flex items-center gap-3 p-3 rounded-lg shadow-lg border-b-4 text-white w-48 transition-transform hover:scale-105 cursor-pointer ${colors[type]}`}
      style={{ left: x, top: y }}
    >
      <div className="p-1.5 bg-white/20 rounded-md">
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-medium text-sm">{label}</span>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full" />
      {type !== 'trigger' && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full" />
      )}
    </div>
  );
}

function Connection({ x1, y1, x2, y2 }: { x1: number, y1: number, x2: number, y2: number }) {
  // Simple SVG curve
  const controlPointX = x1 + (x2 - x1) / 2;
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: -1 }}>
      <path 
        d={`M ${x1} ${y1} C ${controlPointX} ${y1}, ${controlPointX} ${y2}, ${x2} ${y2}`} 
        fill="none" 
        stroke="#cbd5e1" 
        strokeWidth="2" 
        strokeDasharray="4 4"
        className="animate-[dash_20s_linear_infinite]"
      />
    </svg>
  );
}

export default function Workflows() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflows</h1>
          <p className="text-slate-500 mt-1">Manage your n8n automation pipelines</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      {/* Active Workflow Canvas Preview */}
      <Card className="mb-8 border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Yoast Metadata Sync (Preview)</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>
          </div>
        </CardHeader>
        <div className="relative h-[300px] bg-slate-50/50 w-full overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }} />
          
          <div className="relative w-full h-full p-8">
             {/* Connections */}
             <Connection x1={180} y1={50} x2={280} y2={50} />
             <Connection x1={470} y1={50} x2={570} y2={50} />
             <Connection x1={760} y1={50} x2={860} y2={120} />

             {/* Nodes */}
             <Node x={20} y={25} label="WordPress Trigger" type="trigger" icon={Zap} />
             <Node x={300} y={25} label="Yoast API Fetch" type="action" icon={Search} />
             <Node x={580} y={25} label="Analyze Keywords" type="action" icon={FileJson} />
             
             <Node x={880} y={95} label="Update Meta" type="action" icon={Database} />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  workflow.status === 'active' ? 'bg-green-100 text-green-600 group-hover:bg-green-200' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                }`}>
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{workflow.name}</h3>
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'} className={`
                      ${workflow.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700'}
                    `}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 mt-1 text-sm max-w-xl">{workflow.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Settings2 className="w-3 h-3" />
                      {workflow.nodes} Nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <FileJson className="w-3 h-3" />
                      Last run: {workflow.lastRun}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 text-slate-600 border-slate-200">
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Workflow</DropdownMenuItem>
                    <DropdownMenuItem>View Logs</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SidebarLayout>
  );
}
