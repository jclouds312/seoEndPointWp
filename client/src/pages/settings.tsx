import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Key, Globe, Shield, Database, Save } from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your API connections and system preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your AI provider credentials.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input type="password" value="sk-........................" readOnly className="font-mono" />
                <Button variant="outline">Change</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Anthropic API Key</Label>
              <div className="flex gap-2">
                <Input type="password" value="sk-ant-...................." readOnly className="font-mono" />
                <Button variant="outline">Change</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>WordPress Defaults</CardTitle>
                <CardDescription>Set default configurations for new WP connections.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Author ID</Label>
                <Input placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label>Default Category ID</Label>
                <Input placeholder="1" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Auto-Publish</Label>
                <p className="text-xs text-muted-foreground">Automatically publish posts after generation</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>General application settings.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug Mode</Label>
                <p className="text-xs text-muted-foreground">Show detailed logs in dashboard</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
             <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Force dark theme across UI</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
