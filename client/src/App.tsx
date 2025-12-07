import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflow-editor";
import Integrations from "@/pages/integrations";
import DataSources from "@/pages/data-sources";
import Settings from "@/pages/settings";
import LocalSEO from "@/pages/local-seo";
import Deployment from "@/pages/deployment";
import Documentation from "@/pages/documentation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/data-sources" component={DataSources} />
      <Route path="/local-seo" component={LocalSEO} />
      <Route path="/deployment" component={Deployment} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
