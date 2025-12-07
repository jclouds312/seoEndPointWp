import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Globe, Search, Briefcase, Send, Users, BarChart, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

const zones = [
  { name: "Los Angeles County", status: "optimized", score: 92, posts: 145 },
  { name: "San Diego County", status: "optimized", score: 88, posts: 89 },
  { name: "Orange County", status: "warning", score: 64, posts: 42 },
  { name: "San Francisco Bay Area", status: "optimized", score: 95, posts: 112 },
  { name: "Riverside County", status: "pending", score: 0, posts: 0 },
  { name: "Sacramento County", status: "pending", score: 0, posts: 0 },
];

export default function LocalSEO() {
  const [isPublishing, setIsPublishing] = useState(false);

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
              <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High Authority</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex justify-between"><span>Domain Rating:</span> <span className="font-medium text-slate-900">78</span></div>
                    <div className="flex justify-between"><span>Traffic:</span> <span className="font-medium text-slate-900">12.5k/mo</span></div>
                    <div className="flex justify-between"><span>Backlinks:</span> <span className="font-medium text-slate-900">3.2k</span></div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full hover:bg-slate-50">Analyze Competitor</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="geo">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle>California Zones Map</CardTitle>
                <CardDescription>Visual distribution of content coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/California_blank_map.svg/612px-California_blank_map.svg.png')] bg-contain bg-center bg-no-repeat opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
                   <div className="text-center relative z-10">
                     <MapPin className="w-12 h-12 mx-auto mb-2 text-blue-500 animate-bounce" />
                     <p className="font-medium text-slate-600">Interactive Map View</p>
                     <p className="text-xs mt-1 text-slate-500">Hover to see zone details</p>
                   </div>
                   
                   {/* Mock Map Pins */}
                   <div className="absolute top-[60%] left-[60%] w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                   <div className="absolute top-[65%] left-[65%] w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse delay-75"></div>
                   <div className="absolute top-[30%] left-[30%] w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse delay-150"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm h-fit">
              <CardHeader>
                <CardTitle>Zone Performance</CardTitle>
                <CardDescription>Coverage status by county</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {zones.map((zone, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{zone.name}</span>
                        {zone.status === 'optimized' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {zone.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                        {zone.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Score: {zone.score}/100</span>
                        <span>{zone.posts} posts</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={`h-full rounded-full ${zone.status === 'optimized' ? 'bg-green-500' : zone.status === 'warning' ? 'bg-amber-500' : 'bg-slate-300'}`} 
                           style={{ width: `${zone.score}%` }}
                         />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="publish">
          <Card className="border-slate-100 shadow-sm max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Major Publish Campaign</CardTitle>
              <CardDescription>Bulk publish SEO optimized content to multiple zones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider">1. Content Selection</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Source Post / Template</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source post..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">10 Steps to Take After a Car Accident</SelectItem>
                          <SelectItem value="2">How to Calculate Pain and Suffering</SelectItem>
                          <SelectItem value="3">California Statute of Limitations Guide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                       <Checkbox id="spin" />
                       <Label htmlFor="spin" className="font-normal text-slate-600 cursor-pointer">Enable content spinning (AI Rewrite) for each zone to avoid duplicate content penalties</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider">2. Target Zones</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {zones.map((zone) => (
                      <div key={zone.name} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <Checkbox id={`zone-${zone.name}`} />
                        <label
                          htmlFor={`zone-${zone.name}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {zone.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider">3. Scheduling</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Publish Rate</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Publish All Immediately</SelectItem>
                            <SelectItem value="daily">1 Post Per Day</SelectItem>
                            <SelectItem value="weekly">3 Posts Per Week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button 
                    className="w-full h-12 text-lg gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                    onClick={() => setIsPublishing(true)}
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Initializing Campaign...
                      </>
                    ) : (
                      <>
                        <Globe className="w-5 h-5" />
                        Start Bulk Publishing
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    This action will consume approximately 450 AI credits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
}
