import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  ArrowUpRight, 
  FileText, 
  Zap, 
  Globe, 
  TrendingUp,
  Activity
} from "lucide-react";

const data = [
  { name: "Mon", posts: 4, traffic: 240 },
  { name: "Tue", posts: 3, traffic: 139 },
  { name: "Wed", posts: 8, traffic: 980 },
  { name: "Thu", posts: 6, traffic: 390 },
  { name: "Fri", posts: 8, traffic: 480 },
  { name: "Sat", posts: 5, traffic: 380 },
  { name: "Sun", posts: 7, traffic: 430 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Generated", value: "1,284", icon: FileText, trend: "+12%", color: "text-blue-500" },
          { title: "API Efficiency", value: "98.2%", icon: Zap, trend: "+2.1%", color: "text-yellow-500" },
          { title: "Active Sites", value: "12", icon: Globe, trend: "Stable", color: "text-green-500" },
          { title: "Avg SEO Score", value: "92/100", icon: Activity, trend: "+5pts", color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-500 font-medium flex items-center">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.trend}
                </span>
                vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle>Content Generation Velocity</CardTitle>
            <CardDescription>Daily posts generated across all connected sites</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="posts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Bulk Generate", target: "Crypto Trends", time: "2m ago", status: "Processing" },
                { action: "API Sync", target: "WordPress Main", time: "15m ago", status: "Success" },
                { action: "SEO Audit", target: "Post #2931", time: "1h ago", status: "Completed" },
                { action: "Keyword Fetch", target: "Top 50", time: "2h ago", status: "Success" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-3 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.target}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.status === "Processing" ? "secondary" : "outline"} className="text-xs">
                      {item.status}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline" size="sm">View All Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
