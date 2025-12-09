import { useState, useEffect } from "react";
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
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import SidebarLayout from "@/components/sidebar";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface GeneratedContent {
  id: number;
  title: string;
  content: string;
  keywords: string;
  metaDescription: string;
  seoScore: number;
  status: string;
  createdAt: string;
}

export default function ContentManager() {
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generated-content');
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setContents(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el contenido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast({
        title: "Eliminado",
        description: "Contenido eliminado exitosamente"
      });
      fetchContents();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const response = await fetch(`/api/content/${id}/publish`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to publish');
      toast({
        title: "Publicado",
        description: "Contenido marcado como publicado"
      });
      fetchContents();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar el contenido",
        variant: "destructive"
      });
    }
  };

  const filteredContents = contents.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <SidebarLayout>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Manager</h2>
          <p className="text-muted-foreground mt-1">Gestiona y monitorea todo el contenido generado a través de tus sitios.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchContents} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => window.location.href = '/bulk-massive'}>Generar Nuevo</Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Todo el Contenido ({filteredContents.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar contenido..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Cargando contenido...</span>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No se encontraron resultados' : 'No hay contenido generado aún'}
              </p>
              <Button onClick={() => window.location.href = '/bulk-massive'}>
                Generar Contenido
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContents.map((item) => (
                  <TableRow key={item.id} data-testid={`row-content-${item.id}`}>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate" title={item.title}>{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate mt-1" title={item.metaDescription}>
                        {item.metaDescription}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          item.status === "published" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }
                        data-testid={`badge-status-${item.id}`}
                      >
                        {item.status === "published" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {item.status === "published" ? "Publicado" : "Borrador"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.seoScore > 90 ? 'bg-emerald-500' : item.seoScore > 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${item.seoScore}%` }} 
                          />
                        </div>
                        <span className="text-sm font-medium" data-testid={`text-score-${item.id}`}>{item.seoScore}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs text-muted-foreground truncate" title={item.keywords}>
                        {item.keywords || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {item.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                            onClick={() => handlePublish(item.id)}
                            data-testid={`button-publish-${item.id}`}
                            title="Publicar"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(item.id)}
                          data-testid={`button-delete-${item.id}`}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </SidebarLayout>
  );
}
