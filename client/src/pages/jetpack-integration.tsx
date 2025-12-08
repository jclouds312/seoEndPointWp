import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  Share2, 
  Shield, 
  Activity, 
  Image as ImageIcon, 
  Search, 
  Layout,
  CheckCircle2,
  ExternalLink,
  AlertCircle
} from "lucide-react";

export default function JetpackIntegration() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jetpack Integration</h1>
          <p className="text-slate-500 mt-1">Manage your WordPress site's performance, security, and growth tools</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open WordPress Admin
          </Button>
          <Button className="gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4" />
            Connection Active
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Settings Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Performance & Speed</CardTitle>
                  <CardDescription>Optimize site loading times and user experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Image CDN</Label>
                  <p className="text-sm text-slate-500">Serve images from Jetpack's global CDN</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Lazy Loading</Label>
                  <p className="text-sm text-slate-500">Delay loading of images until they scroll into view</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Video Hosting</Label>
                  <p className="text-sm text-slate-500">High-speed, ad-free video hosting</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Security Scanning</CardTitle>
                  <CardDescription>Protect your site from threats and downtime</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Downtime Monitoring</Label>
                  <p className="text-sm text-slate-500">Get alerted immediately if your site goes down</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Brute Force Protection</Label>
                  <p className="text-sm text-slate-500">Block malicious login attempts</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Recent Activity Log</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Plugin "Yoast SEO" updated</span>
                    <span className="text-slate-400">2 hours ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">User "walchlaw4" logged in</span>
                    <span className="text-slate-400">5 hours ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sharing Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Social Sharing</CardTitle>
                  <CardDescription>Automatically share content to social networks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">fb</div>
                    <span className="font-medium">Facebook</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xs">tw</div>
                    <span className="font-medium">Twitter / X</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs">in</div>
                    <span className="font-medium">LinkedIn</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">ig</div>
                    <span className="font-medium">Instagram</span>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Stats Area */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-0">
            <CardHeader>
              <CardTitle className="text-lg">Site Stats</CardTitle>
              <CardDescription className="text-slate-400">Last 30 days overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <div className="text-3xl font-bold">45.2k</div>
                <div className="text-sm text-slate-400">Total Views</div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Search Engines</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[65%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Social Media</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[25%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Direct Traffic</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[10%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900">
                <strong>Enable 2FA:</strong> Secure your account by enabling Two-Factor Authentication in Jetpack settings.
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900">
                <strong>Update Plugin:</strong> A new version of "Contact Form 7" is available.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
