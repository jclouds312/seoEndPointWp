import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, RefreshCw, Server, FileSpreadsheet, Cloud, Code, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DataSources() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Sources</h1>
          <p className="text-slate-500 mt-1">Manage external data connections</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Connect New Data Source</DialogTitle>
              <DialogDescription>
                Select a data source type to connect to your SEO Hub.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { icon: Database, title: "PostgreSQL / MySQL", desc: "Connect directly to a database" },
                { icon: Cloud, title: "REST API", desc: "Connect to any JSON API" },
                { icon: FileSpreadsheet, title: "Google Sheets", desc: "Read/Write from spreadsheets" },
                { icon: Code, title: "Custom Script", desc: "Execute Node.js or Python scripts" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <item.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
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

        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-slate-100 shadow-sm border-dashed bg-slate-50/50 flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900">Connect New Source</h3>
                <p className="text-sm text-slate-500">Database, API, or File</p>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Connect New Data Source</DialogTitle>
              <DialogDescription>
                Select a data source type to connect to your SEO Hub.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { icon: Database, title: "PostgreSQL / MySQL", desc: "Connect directly to a database" },
                { icon: Cloud, title: "REST API", desc: "Connect to any JSON API" },
                { icon: FileSpreadsheet, title: "Google Sheets", desc: "Read/Write from spreadsheets" },
                { icon: Code, title: "Custom Script", desc: "Execute Node.js or Python scripts" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <item.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}
