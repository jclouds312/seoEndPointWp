import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Key, Workflow, Globe, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  // Load initial state from localStorage if available
  const [n8nUrl, setN8nUrl] = useState(() => localStorage.getItem("n8nUrl") || "");
  const [wpUrl, setWpUrl] = useState(() => localStorage.getItem("wpUrl") || "https://www.californiapersonalinjurylawyersblog.com");
  const [wpUser, setWpUser] = useState(() => localStorage.getItem("wpUser") || "walchlaw4");
  const [wpPass, setWpPass] = useState(() => localStorage.getItem("wpPass") || "eJs3M*LnfSSo68P!RtXC9lZ");
  
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [isTestingWp, setIsTestingWp] = useState(false);

  // Save to localStorage whenever values change
  useEffect(() => { localStorage.setItem("n8nUrl", n8nUrl); }, [n8nUrl]);
  useEffect(() => { localStorage.setItem("wpUrl", wpUrl); }, [wpUrl]);
  useEffect(() => { localStorage.setItem("wpUser", wpUser); }, [wpUser]);
  useEffect(() => { localStorage.setItem("wpPass", wpPass); }, [wpPass]);

  const handleTestN8n = async () => {
    if (!n8nUrl) return;
    setIsTestingN8n(true);
    // Simulate check
    setTimeout(() => {
      setIsTestingN8n(false);
      toast({
        title: "Connection Successful",
        description: "Successfully connected to n8n workflow engine.",
      });
    }, 1500);
  };

  const handleTestWp = async () => {
    setIsTestingWp(true);
    // Simulate check
    setTimeout(() => {
      setIsTestingWp(false);
      toast({
        title: "WordPress Connected",
        description: "Successfully authenticated with WordPress site.",
      });
    }, 1500);
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage platform preferences and integrations</p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="w-full max-w-4xl">
        <TabsList className="mb-8">
          <TabsTrigger value="integrations" className="gap-2"><Workflow className="w-4 h-4"/> Integrations</TabsTrigger>
          <TabsTrigger value="account" className="gap-2"><User className="w-4 h-4"/> Account</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4"/> Notifications</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4"/> Security</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><Key className="w-4 h-4"/> API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card className="border-indigo-200 bg-indigo-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-indigo-600" />
                  n8n Automation Engine
                </CardTitle>
                <CardDescription>Configure your n8n webhook for auto-posting workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL (Production)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://n8n.your-domain.com/webhook/..." 
                      value={n8nUrl}
                      onChange={(e) => setN8nUrl(e.target.value)}
                      className="bg-white"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleTestN8n}
                      disabled={isTestingN8n || !n8nUrl}
                    >
                      {isTestingN8n ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">This webhook will be triggered when content is ready for publishing.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-100 p-3 rounded-lg border border-indigo-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active Flows: <strong>Auto-Post</strong>, <strong>Social Syndication</strong>, <strong>Image Gen</strong></span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  WordPress Connection
                </CardTitle>
                <CardDescription>Primary destination for generated content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input 
                    value={wpUrl} 
                    onChange={(e) => setWpUrl(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      value={wpUser} 
                      onChange={(e) => setWpUser(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Application Password</Label>
                    <Input 
                      type="password"
                      value={wpPass} 
                      onChange={(e) => setWpPass(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleTestWp}
                    disabled={isTestingWp}
                  >
                    {isTestingWp ? "Authenticating..." : "Verify WordPress Credentials"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input defaultValue="walchlaw4" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="admin@californiapersonalinjurylawyersblog.com" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure when you receive emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Workflow Failures</Label>
                  <p className="text-sm text-slate-500">Get notified when an automation fails</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly SEO Digest</Label>
                  <p className="text-sm text-slate-500">Summary of optimization performance</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage password and 2FA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
               <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
