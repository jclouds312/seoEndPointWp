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
  Zap,
  Activity,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Plus
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
  Legend,
  ComposedChart,
  Line
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import generatedImage from '@assets/generated_images/abstract_tech_background_for_dashboard.png';

const performanceData = [
  { name: 'Mon', score: 65, traffic: 1200, keywords: 45 },
  { name: 'Tue', score: 72, traffic: 1350, keywords: 52 },
  { name: 'Wed', score: 68, traffic: 1250, keywords: 48 },
  { name: 'Thu', score: 85, traffic: 1600, keywords: 61 },
  { name: 'Fri', score: 82, traffic: 1500, keywords: 58 },
  { name: 'Sat', score: 90, traffic: 1900, keywords: 75 },
  { name: 'Sun', score: 94, traffic: 2100, keywords: 82 },
];

const campaignPerformance = [
  { name: 'Legal Blog', posts: 12, views: 4500, engagement: 2.4 },
  { name: 'Tech Guide', posts: 8, views: 3200, engagement: 3.1 },
  { name: 'Health Tips', posts: 15, views: 5100, engagement: 1.8 },
  { name: 'Local SEO', posts: 24, views: 6200, engagement: 4.2 },
];

export default function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "System Sync Complete",
        description: "All campaigns, metrics, and integrations updated successfully."
      });
    }, 2000);
  };

  return (
    <SidebarLayout>
      {/* Hero Section with Background */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-40">
           <img 
            src={generatedImage} 
            alt="Dashboard Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
        
        <div className="relative z-20 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Badge className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-blue-500/50 backdrop-blur-md">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                 System Online
               </Badge>
               <span className="text-slate-400 text-sm">v2.4.0-stable</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Welcome back, Admin</h1>
            <p className="text-slate-300 max-w-xl text-lg">
              Your automated SEO pipeline is running at <span className="text-green-400 font-semibold">98% efficiency</span>. 
              3 campaigns are currently active with 12 posts scheduled for today.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              size="lg"
              variant="secondary" 
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 border-0">
              <Plus className="w-5 h-5" />
              New Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Avg. SEO Score", value: "94/100", change: "+12.5%", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Posts Generated", value: "24", sub: "8 remaining this month", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Total Views", value: "12.5k", change: "+5.2%", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Active Campaigns", value: "5", sub: "2 pending approval", icon: Globe, color: "text-green-600", bg: "bg-green-50" }
        ].map((stat, i) => (
          <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-semibold">
                    {stat.change}
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                {stat.sub && <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Traffic & SEO Score Chart */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>SEO Score vs. Traffic Volume Correlation</CardDescription>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button className="px-3 py-1 text-xs font-medium bg-white rounded-md shadow-sm text-slate-700">Week</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">Month</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">Year</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    name="SEO Score" 
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="traffic" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTraffic)" 
                    name="Traffic" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Live System Activity</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 animate-pulse">Live</Badge>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto pr-2">
            <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
              {[
                { title: "Article Published", desc: "California Personal Injury - New post live on WordPress", time: "2m ago", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
                { title: "Keyword Analysis", desc: "Found 12 high-value keywords for 'Tech Guide'", time: "15m ago", icon: Search, color: "text-blue-600", bg: "bg-blue-100" },
                { title: "Image Generated", desc: "Hero image created via DALL-E 3", time: "42m ago", icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
                { title: "Workflow Triggered", desc: "Auto-posting schedule activated", time: "1h ago", icon: Zap, color: "text-orange-600", bg: "bg-orange-100" },
                { title: "System Update", desc: "Core algorithms updated to v2.4.1", time: "3h ago", icon: RefreshCw, color: "text-slate-600", bg: "bg-slate-100" },
              ].map((item, i) => (
                <div key={i} className="ml-6 relative">
                  <span className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border-4 border-white ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-3 h-3 ${item.color}`} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                    <span className="text-xs text-slate-500 mb-1">{item.desc}</span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
             <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-blue-600 text-xs font-medium h-8">
               View All Activity Log <ArrowUpRight className="w-3 h-3 ml-1" />
             </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Campaign Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-2 border-slate-100 shadow-sm">
           <CardHeader>
             <CardTitle>Campaign Efficiency Breakdown</CardTitle>
             <CardDescription>Engagement metrics across active channels</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformance} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} width={100} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} name="Views" stackId="a" />
                    <Bar dataKey="posts" fill="#93c5fd" radius={[0, 4, 4, 0]} barSize={24} name="Posts" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 p-24 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2 relative z-10">
              <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              Pro Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <p className="text-sm text-blue-100 mb-4">
              Your "Tech Guide" campaign is trending. Boost it now to maximize reach.
            </p>
            
            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold border-none shadow-md">
              <TrendingUp className="w-4 h-4 mr-2" /> Boost "Tech Guide"
            </Button>
            
            <Button variant="outline" className="w-full bg-blue-800/50 border-blue-400/30 text-white hover:bg-blue-800/70">
              <Search className="w-4 h-4 mr-2" /> Find New Keywords
            </Button>
            
            <Button variant="outline" className="w-full bg-blue-800/50 border-blue-400/30 text-white hover:bg-blue-800/70">
              <Send className="w-4 h-4 mr-2" /> Distribute to Socials
            </Button>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}