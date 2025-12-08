import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  FileEdit, 
  Eye, 
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const contents = [
  { id: 1, title: "10 AI Trends in 2025", category: "Technology", status: "Published", score: 98, date: "2 mins ago" },
  { id: 2, title: "Best Crypto Wallets", category: "Finance", status: "Scheduled", score: 92, date: "1 hour ago" },
  { id: 3, title: "Healthy Meal Prep", category: "Lifestyle", status: "Draft", score: 85, date: "3 hours ago" },
  { id: 4, title: "Python for Beginners", category: "Coding", status: "Published", score: 95, date: "Yesterday" },
  { id: 5, title: "SaaS Marketing Guide", category: "Business", status: "Published", score: 88, date: "Yesterday" },
  { id: 6, title: "Remote Work Tips", category: "Business", status: "Review", score: 76, date: "2 days ago" },
  { id: 7, title: "Yoga for Back Pain", category: "Health", status: "Draft", score: 65, date: "3 days ago" },
];

export default function ContentManager() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Manager</h2>
          <p className="text-muted-foreground mt-1">Manage and monitor all generated content across your sites.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button>Create New</Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Content</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search content..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        item.status === "Published" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        item.status === "Scheduled" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        item.status === "Draft" ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }
                    >
                      {item.status === "Published" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {item.status === "Scheduled" && <Clock className="mr-1 h-3 w-3" />}
                      {item.status === "Review" && <AlertCircle className="mr-1 h-3 w-3" />}
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.score > 90 ? 'bg-emerald-500' : item.score > 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${item.score}%` }} 
                        />
                      </div>
                      <span className="text-sm font-medium">{item.score}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
