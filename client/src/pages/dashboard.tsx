
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpRight, 
  CheckCircle2, 
  RefreshCw, 
  Link as LinkIcon, 
  BarChart3, 
  FileText, 
  Search, 
  Send,
  TrendingUp,
  Users,
  Globe,
  Zap
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis,
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const performanceData = [
  { name: 'Mon', score: 65, traffic: 1200 },
  { name: 'Tue', score: 72, traffic: 1350 },
  { name: 'Wed', score: 68, traffic: 1250 },
  { name: 'Thu', score: 85, traffic: 1600 },
  { name: 'Fri', score: 82, traffic: 1500 },
  { name: 'Sat', score: 90, traffic: 1900 },
  { name: 'Sun', score: 94, traffic: 2100 },
];

const campaignPerformance = [
  { name: 'Legal Blog', posts: 12, views: 4500 },
  { name: 'Tech Guide', posts: 8, views: 3200 },
  { name: 'Health Tips', posts: 15, views: 5100 },
];

export default function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Sync Complete",
        description: "All campaigns and metrics updated successfully."
      });
    }, 2000);
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time insights and automated pipeline status</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-slate-200 hover:bg-slate-50"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            <Zap className="w-4 h-4" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                +12.5%
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900">94/100</h3>
              <p className="text-sm text-slate-500">Avg. SEO Score</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100">
                8 Left
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900">24</h3>
              <p className="text-sm text-slate-500">Posts Generated</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                +5.2%
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900">12.5k</h3>
              <p className="text-sm text-slate-500">Total Views</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                Active
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900">5</h3>
              <p className="text-sm text-slate-500">Active Campaigns</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SEO Performance & Traffic</CardTitle>
                <CardDescription>Correlation between optimization scores and traffic</CardDescription>
              </div>
              <Tabs defaultValue="week" className="w-[200px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="SEO Score" />
                  <Area yAxisId="right" type="monotone" dataKey="traffic" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" name="Traffic" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Distribution */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Views per campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} width={80} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { title: "Article Published", desc: "California Personal Injury - New post live", time: "2m ago", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
                { title: "SEO Optimization", desc: "Automated keyword injection completed", time: "15m ago", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
                { title: "Image Generated", desc: "New hero image for Tech Guide", time: "1h ago", icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <h4 className="font-medium text-sm mb-1 text-white">Optimize Images</h4>
              <p className="text-xs text-slate-300">Using the new Image API integration can increase engagement by 40%.</p>
            </div>
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <h4 className="font-medium text-sm mb-1 text-white">Keyword Density</h4>
              <p className="text-xs text-slate-300">Keep keyword density between 1.5% and 2.5% for optimal ranking.</p>
            </div>
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 mt-2">
              Start New Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}