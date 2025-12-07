import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Globe, Search, Briefcase, Send, Users, BarChart } from "lucide-react";

export default function LocalSEO() {
  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Local SEO & Publishing</h1>
          <p className="text-slate-500 mt-1">Geo-targeted publishing and lawyer directory search</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-blue-700">
          <Send className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="search" className="gap-2"><Search className="w-4 h-4"/> Lawyer Search</TabsTrigger>
          <TabsTrigger value="geo" className="gap-2"><MapPin className="w-4 h-4"/> Geo-Targeting</TabsTrigger>
          <TabsTrigger value="publish" className="gap-2"><Globe className="w-4 h-4"/> Major Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-3 border-slate-100 shadow-sm bg-blue-50/30">
              <CardContent className="p-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Practice Area</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input placeholder="e.g. Personal Injury, Car Accident" className="pl-9 bg-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Location / Zone</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input placeholder="e.g. Los Angeles, CA" className="pl-9 bg-white" />
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Search Directory</Button>
                </div>
              </CardContent>
            </Card>

            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Smith & Associates</h3>
                        <p className="text-xs text-slate-500">Personal Injury • Los Angeles</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">High Authority</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex justify-between"><span>Domain Rating:</span> <span className="font-medium text-slate-900">78</span></div>
                    <div className="flex justify-between"><span>Traffic:</span> <span className="font-medium text-slate-900">12.5k/mo</span></div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Analyze Competitor</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="geo">
          <Card className="border-slate-100 shadow-sm">
             <CardHeader>
               <CardTitle>Geo-Targeted Zones</CardTitle>
               <CardDescription>Manage content distribution across California regions</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="h-[400px] bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Interactive Map Visualization</p>
                    <p className="text-xs mt-1">(Configured for California Counties)</p>
                  </div>
               </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Major Publish</CardTitle>
              <CardDescription>Bulk publish SEO optimized content to multiple zones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <h4 className="font-medium mb-2">Campaign Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-500">Source Content</Label>
                      <div className="font-medium">"10 Steps to Take After a Car Accident"</div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Target Zones</Label>
                      <div className="font-medium">Los Angeles, San Diego, SF Bay Area</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[0%] bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-slate-500">Ready to start</span>
                </div>

                <Button className="w-full h-12 text-lg gap-2" disabled>
                   <Globe className="w-5 h-5" />
                   Start Bulk Publishing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
