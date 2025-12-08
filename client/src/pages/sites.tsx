import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, RefreshCw, MoreHorizontal, Globe } from "lucide-react";
import SidebarLayout from "@/components/sidebar";

export default function Sites() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Connected Sites</h2>
          <p className="text-muted-foreground mt-1">Manage your WordPress endpoints.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Site
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border hover:border-primary/50 transition-colors group">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">TechBlog Main</CardTitle>
                  <CardDescription className="text-xs">https://techblog.com</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Active
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Sync</p>
                  <p className="text-sm font-medium">2 mins ago</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Posts</p>
                  <p className="text-sm font-medium">1,248</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-medium">12</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4 flex gap-2">
              <Button variant="outline" className="flex-1 gap-2 text-xs">
                <RefreshCw className="h-3 w-3" />
                Sync
              </Button>
              <Button className="flex-1 gap-2 text-xs">
                <ExternalLink className="h-3 w-3" />
                Visit
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {/* Add New Card */}
        <Card className="border-dashed border-border flex flex-col items-center justify-center p-6 h-full min-h-[250px] cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium">Connect New Site</h3>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Add a new WordPress endpoint to your network
          </p>
        </Card>
      </div>
    </div>
    </SidebarLayout>
  );
}
