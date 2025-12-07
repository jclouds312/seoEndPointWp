import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, CheckCircle2, RefreshCw, Link as LinkIcon, BarChart3, FileText, Search } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 90 },
  { name: 'Sun', score: 94 },
];

export default function Dashboard() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500 mt-1">Monitor your SEO automation pipelines</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync Now
          </Button>
          <Button className="gap-2 bg-primary hover:bg-blue-700">
            <ArrowUpRight className="w-4 h-4" />
            View Live Site
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Connection Status</CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">Active</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">n8n Connected</Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Yoast API</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Optimization Score</CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">94/100</div>
            <p className="text-xs text-slate-500 mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Processed Posts</CardTitle>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">1,284</div>
            <p className="text-xs text-slate-500 mt-1">Auto-optimized by n8n</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>SEO Performance</CardTitle>
            <CardDescription>Average optimization score trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest automated actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { title: "Updated Meta Tags", desc: "Personal Injury California", time: "2m ago", icon: RefreshCw },
                { title: "Keyword Injection", desc: "Car Accident Lawyer Post", time: "15m ago", icon: Search },
                { title: "Internal Linking", desc: "Blog: Safety Tips", time: "1h ago", icon: LinkIcon },
                { title: "Schema Markup", desc: "About Us Page", time: "3h ago", icon: FileText },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <div className="ml-auto text-xs text-slate-400 font-medium">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
