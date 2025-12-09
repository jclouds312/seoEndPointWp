
import SidebarLayout from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Play, MoreVertical, GitBranch, Settings2, FileJson, Zap, RefreshCw, Trash2, Pause, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AutoPublishWorkflowDialog } from "@/components/workflow/auto-publish-dialog";

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  updatedAt?: string;
  createdAt?: string;
}

function WorkflowCard({ workflow, onActivate, onDeactivate, onExecute, onDelete }: {
  workflow: N8nWorkflow;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onExecute: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            workflow.active ? 'bg-green-100 text-green-600 group-hover:bg-green-200' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
          }`}>
            <GitBranch className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{workflow.name}</h3>
              <Badge variant={workflow.active ? 'default' : 'secondary'} className={`
                ${workflow.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700'}
              `}>
                {workflow.active ? 'Active' : 'Paused'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Settings2 className="w-3 h-3" />
                {workflow.nodes?.length || 0} Nodes
              </span>
              {workflow.updatedAt && (
                <span className="flex items-center gap-1">
                  <FileJson className="w-3 h-3" />
                  Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 text-slate-600 border-slate-200"
            onClick={() => onExecute(workflow.id)}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Now
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {workflow.active ? (
                <DropdownMenuItem onClick={() => onDeactivate(workflow.id)}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Workflow
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onActivate(workflow.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Activate Workflow
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(workflow.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Workflows() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAutoPublishDialog, setShowAutoPublishDialog] = useState(false);
  const [n8nUrl, setN8nUrl] = useState('');

  // Fetch workflows
  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ['/api/n8n/workflows'],
    refetchInterval: 10000, // Refresh every 10 seconds
  }) as any;

  // Fetch n8n health
  const { data: healthData } = useQuery({
    queryKey: ['/api/n8n/health'],
  }) as any;

  useEffect(() => {
    if (healthData?.baseUrl) {
      setN8nUrl(healthData.baseUrl);
    }
  }, [healthData]);

  // Mutations
  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/n8n/workflows/${id}/activate`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to activate workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/n8n/workflows'] });
      toast({ title: 'Workflow activated successfully' });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/n8n/workflows/${id}/deactivate`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to deactivate workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/n8n/workflows'] });
      toast({ title: 'Workflow paused successfully' });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/n8n/workflows/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: {} }),
      });
      if (!response.ok) throw new Error('Failed to execute workflow');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Workflow executed successfully' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/n8n/workflows/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/n8n/workflows'] });
      toast({ title: 'Workflow deleted successfully', variant: 'destructive' });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: string) => {
      const response = await fetch(`/api/n8n/workflows/templates/${template}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/n8n/workflows'] });
      setShowTemplateDialog(false);
      toast({ title: 'Template workflow created successfully' });
    },
  });

  const workflows = workflowsData?.workflows || [];

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflows</h1>
          <p className="text-slate-500 mt-1">Manage your n8n automation pipelines</p>
        </div>
        <div className="flex items-center gap-3">
          {healthData?.healthy ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              n8n Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              n8n Disconnected
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => window.open(n8nUrl, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open n8n Editor
          </Button>
          <Button 
            className="gap-2 bg-primary hover:bg-blue-700"
            onClick={() => setShowAutoPublishDialog(true)}
          >
            <Zap className="w-4 h-4" />
            Auto-Publish Flow
          </Button>
          <Button 
            className="gap-2"
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
          >
            <Plus className="w-4 h-4" />
            More Templates
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GitBranch className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No workflows yet</h3>
                <p className="text-sm text-slate-500 mb-4">Create your first workflow from a template</p>
                <Button onClick={() => setShowTemplateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            workflows.map((workflow: N8nWorkflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onActivate={(id) => activateMutation.mutate(id)}
                onDeactivate={(id) => deactivateMutation.mutate(id)}
                onExecute={(id) => executeMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))
          )}
        </div>
      )}

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Workflow from Template</DialogTitle>
            <DialogDescription>
              Choose a pre-built workflow template for common SEO automation tasks
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setShowTemplateDialog(false);
              setShowAutoPublishDialog(true);
            }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  Auto-Publishing Machine
                </CardTitle>
                <CardDescription>
                  Full automation: 8 posts/month with AI content & images to WordPress
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => createTemplateMutation.mutate('yoast-sync')}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Yoast Metadata Sync
                </CardTitle>
                <CardDescription>
                  Automatically sync SEO metadata from WordPress to your database every 6 hours
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => createTemplateMutation.mutate('content-generation')}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  AI Content Generation
                </CardTitle>
                <CardDescription>
                  Generate blog posts with OpenAI GPT-4 and save as WordPress drafts
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => createTemplateMutation.mutate('keyword-analysis')}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  Keyword Density Analyzer
                </CardTitle>
                <CardDescription>
                  Analyze keyword density via webhook and send email reports
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AutoPublishWorkflowDialog 
        open={showAutoPublishDialog} 
        onOpenChange={setShowAutoPublishDialog}
        onCreate={(config) => {
          // Here we would typically make an API call to create the workflow in n8n
          console.log("Creating workflow with config:", config);
        }}
      />
    </SidebarLayout>
  );
}
