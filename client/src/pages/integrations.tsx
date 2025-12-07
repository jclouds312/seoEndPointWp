import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Globe, Key, Lock, Search } from "lucide-react";

export default function Integrations() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
          <p className="text-slate-500 mt-1">Manage connections to external services</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-blue-200 shadow-sm bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                  <Globe className="w-7 h-7 text-[#2271B1]" /> 
                </div>
                <div>
                  <CardTitle className="text-xl">WordPress Site</CardTitle>
                  <CardDescription>californiapersonalinjurylawyersblog.com</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input value="https://www.californiapersonalinjurylawyersblog.com/" disabled className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label>Admin Username</Label>
                <Input value="walchlaw4" disabled className="bg-white" />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-100 rounded-lg text-sm text-blue-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Connection Healthy</strong>
                <p className="mt-1 text-blue-700/80">Last successful ping: 2 minutes ago. REST API is accessible.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#A4286A] rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                  <span className="font-bold text-white text-xl">Y</span>
                </div>
                <div>
                  <CardTitle className="text-xl">Yoast SEO Premium</CardTitle>
                  <CardDescription>SEO Metadata & Analysis</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
             <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                   <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                   <Input type="password" value="sk_live_xxxxxxxxxxxxx" disabled className="pl-9 bg-slate-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Plugin Version</Label>
                <Input value="25.7" disabled className="bg-slate-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm opacity-70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EA4335] rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Google Search Console</CardTitle>
                  <CardDescription>Performance & Indexing Data</CardDescription>
                </div>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </SidebarLayout>
  );
}
