import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Globe, Key, Lock, Search, RefreshCw, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Integrations() {
  const [yoastKey, setYoastKey] = useState("sk_live_eJs3M*LnfSSo68P!RtXC9lZ"); // Updated with provided credential part
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate API verification
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast({
        title: "Connection Successful",
        description: "API key verified.",
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setYoastKey("");
    toast({
      title: "Disconnected",
      description: "Integration has been removed.",
      variant: "destructive",
    });
  };

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
                <Input value="https://www.californiapersonalinjurylawyersblog.com/" disabled className="bg-white font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label>Admin Username</Label>
                <Input value="walchlaw4" disabled className="bg-white font-mono text-xs" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>API Endpoint</Label>
                <Input value="https://www.californiapersonalinjurylawyersblog.com/wp-json/wp/v2/" disabled className="bg-white font-mono text-xs" />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-100 rounded-lg text-sm text-blue-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Connection Healthy</strong>
                <p className="mt-1 text-blue-700/80">Authenticated as walchlaw4. REST API is accessible.</p>
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
              <div className="flex items-center gap-2">
                 {isConnected ? (
                   <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
                 ) : (
                   <Badge variant="outline" className="text-slate-500">Not Connected</Badge>
                 )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                   <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                   <Input 
                      type="password" 
                      value={yoastKey} 
                      onChange={(e) => setYoastKey(e.target.value)}
                      placeholder="Enter API Key"
                      className="pl-9 bg-white font-mono text-xs" 
                      disabled={isConnected}
                   />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Plugin Version</Label>
                <Input value="25.7" disabled className="bg-slate-50" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {isConnected ? (
                <>
                  <Button variant="outline" className="text-slate-600" onClick={() => toast({ title: "Test Successful", description: "API is responding correctly." })}>
                    Test Connection
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={handleConnect} disabled={!yoastKey || isConnecting} className="min-w-[120px]">
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Connect API"
                  )}
                </Button>
              )}
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
