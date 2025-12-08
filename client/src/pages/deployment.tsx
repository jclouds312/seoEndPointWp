import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code } from "lucide-react";
import { useState } from "react";

export default function Deployment() {
  const [copied, setCopied] = useState(false);

  const embedCode = `<?php
/**
 * Plugin Name: SEO Automation Hub Embed
 * Description: Embeds the Replit SEO Dashboard into WordPress Admin
 * Version: 1.0.0
 * Author: Replit Agent
 */

add_action('admin_menu', 'register_seo_hub_page');

function register_seo_hub_page() {
    add_menu_page(
        'SEO Automation',
        'SEO Hub',
        'manage_options',
        'seo-automation-hub',
        'render_seo_hub_page',
        'dashicons-chart-area',
        6
    );
}

function render_seo_hub_page() {
    ?>
    <div class="wrap" style="background: #fff; margin: 0; padding: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
        <iframe 
            src="https://[YOUR-REPLIT-URL].replit.app/" 
            style="width: 100%; height: 100vh; border: none;"
            title="SEO Automation Hub"
        ></iframe>
    </div>
    <script>
        // Adjust WordPress admin UI layout for full-screen feel
        document.addEventListener('DOMContentLoaded', function() {
            const wrap = document.querySelector('.wrap');
            if(wrap) {
                wrap.closest('#wpbody-content').style.padding = '0';
            }
        });
    </script>
    <?php
}
?>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Deployment & Integration</h1>
          <p className="text-slate-500 mt-1">Embed this dashboard into your WordPress Admin Panel</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                WordPress Plugin Code
              </CardTitle>
              <CardDescription>
                Copy this code into a new PHP file (e.g., <code>seo-hub-embed.php</code>) in your <code>wp-content/plugins</code> folder, or paste it into your theme's <code>functions.php</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-4 right-4">
                  <Button size="sm" variant="secondary" onClick={handleCopy} className="h-8 gap-2">
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>
                <pre className="bg-slate-900 text-slate-50 p-6 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                  {embedCode}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Installation Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-4 text-slate-600">
                <li className="pl-2">
                  <span className="font-medium text-slate-900">Create the Plugin File:</span> Create a new file named <code>seo-hub.php</code> on your computer.
                </li>
                <li className="pl-2">
                  <span className="font-medium text-slate-900">Paste the Code:</span> Copy the code above and paste it into the file. Replace <code>[YOUR-REPLIT-URL]</code> with your actual Replit App URL.
                </li>
                <li className="pl-2">
                  <span className="font-medium text-slate-900">Upload to WordPress:</span> Upload this file to your WordPress site's <code>/wp-content/plugins/</code> directory via FTP or your hosting file manager.
                </li>
                <li className="pl-2">
                  <span className="font-medium text-slate-900">Activate:</span> Go to the WordPress Admin Plugins page and activate "SEO Automation Hub Embed".
                </li>
                <li className="pl-2">
                  <span className="font-medium text-slate-900">Done:</span> You will see a new "SEO Hub" menu item in your WordPress sidebar.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Deployment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Environment</span>
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">Production</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Access</span>
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">Public</Badge>
                </div>
                <div className="pt-4 border-t border-blue-200">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Deploy Updates</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
