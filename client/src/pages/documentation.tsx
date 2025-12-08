import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Code, Download, Settings, Puzzle, CheckCircle2 } from "lucide-react";

export default function Documentation() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-slate-600">v2.1.0</Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Enterprise</Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Documentation</h1>
          <p className="text-slate-500 mt-1">Installation guides, widget setup, and API references</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-1">
          <nav className="space-y-1 sticky top-8">
            <h3 className="font-semibold text-slate-900 px-3 py-2">Getting Started</h3>
            <a href="#installation" className="block px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md font-medium">Installation</a>
            <a href="#configuration" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Configuration</a>
            
            <h3 className="font-semibold text-slate-900 px-3 py-2 mt-4">Components</h3>
            <a href="#widgets" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Widgets & Maps</a>
            <a href="#plugins" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">WordPress Plugins</a>
            
            <h3 className="font-semibold text-slate-900 px-3 py-2 mt-4">API</h3>
            <a href="#endpoints" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Endpoints</a>
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <section id="installation">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <CardTitle>Installation Guide</CardTitle>
                </div>
                <CardDescription>How to set up the SEO Automation Hub on your WordPress site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-medium text-slate-900 mb-2">Prerequisites</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> WordPress 6.0 or higher</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> PHP 7.4 or higher</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Yoast SEO Premium (v25.7+)</li>
                  </ul>
                </div>
                <div className="space-y-2 text-slate-700">
                  <p>1. Navigate to the <strong>Deployment</strong> page in this dashboard.</p>
                  <p>2. Copy the generated PHP snippet code.</p>
                  <p>3. Create a new file <code>seo-hub-embed.php</code> in your <code>wp-content/plugins/</code> directory.</p>
                  <p>4. Paste the code and activate the plugin via WordPress Admin.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="configuration">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <CardTitle>Configuration & Credentialing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  The system requires authentication to communicate with your WordPress instance and external SEO tools.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-1">WordPress REST API</div>
                    <code className="text-xs bg-slate-100 p-1 rounded">/wp-json/wp/v2/</code>
                    <p className="text-xs text-slate-500 mt-2">Used to fetch posts and update metadata.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-1">Yoast SEO Premium</div>
                    <code className="text-xs bg-slate-100 p-1 rounded">Key: sk_live_...</code>
                    <p className="text-xs text-slate-500 mt-2">Required for keyword analysis features.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="widgets">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Puzzle className="w-5 h-5 text-blue-600" />
                  <CardTitle>Widgets & Visualizations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Geo-Targeting Map</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    The interactive map widget in the <strong>Local SEO</strong> section uses SVG mapping to visualize content coverage.
                  </p>
                  <div className="p-3 bg-slate-900 text-slate-50 rounded-md font-mono text-xs overflow-x-auto">
                    {`<MapWidget 
  zones={['Los Angeles', 'San Diego']} 
  data={performanceData} 
  interactive={true} 
/>`}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">n8n Workflow Graph</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    The workflow editor uses a custom node-link diagram component to visualize automation steps.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="endpoints">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  <CardTitle>API Endpoints</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: "GET", path: "/api/seo/audit", desc: "Triggers a new SEO audit for the connected site." },
                    { method: "POST", path: "/api/publish/batch", desc: "Initiates a bulk publishing campaign." },
                    { method: "GET", path: "/api/keywords/analyze", desc: "Returns keyword density metrics." }
                  ].map((api, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border-b last:border-0">
                      <Badge variant="secondary" className="font-mono">{api.method}</Badge>
                      <div>
                        <div className="font-mono text-sm text-slate-900">{api.path}</div>
                        <div className="text-xs text-slate-500">{api.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}
