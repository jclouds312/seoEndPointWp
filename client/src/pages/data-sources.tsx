import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, RefreshCw, Server, FileSpreadsheet } from "lucide-react";

export default function DataSources() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Sources</h1>
          <p className="text-slate-500 mt-1">Manage external data connections</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Source
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">WordPress DB</CardTitle>
            <Database className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 mb-4">Read-only connection to wp_posts table</div>
            <div className="flex items-center gap-2 mb-4">
               <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>
               <span className="text-xs text-slate-400">Synced 10m ago</span>
            </div>
            <Button variant="outline" className="w-full">Configure</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Google Sheets</CardTitle>
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 mb-4">Keyword research repository</div>
            <div className="flex items-center gap-2 mb-4">
               <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>
               <span className="text-xs text-slate-400">Synced 1h ago</span>
            </div>
            <Button variant="outline" className="w-full">Configure</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm border-dashed bg-slate-50/50 flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900">Connect New Source</h3>
            <p className="text-sm text-slate-500">Database, API, or File</p>
        </Card>
      </div>
    </SidebarLayout>
  );
}
