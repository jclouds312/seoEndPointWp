
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
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
import Marketplace from "@/pages/marketplace";
import Campaigns from "@/pages/campaigns";
import SeoAnalyzer from "@/pages/seo-analyzer";
import ContentCreator from "./pages/content-creator";
import ContentPublisher from "./pages/content-publisher";
import BulkContentGenerator from "./pages/bulk-content-generator";
import JetpackIntegration from "@/pages/jetpack-integration";
import BulkMassive from "@/pages/bulk-massive";
import ContentManager from "@/pages/content-manager";
import Sites from "@/pages/sites";
import CampaignDetailsPage from "@/pages/campaign-details"; // <-- Importar la nueva página

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/jetpack" component={JetpackIntegration} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/data-sources" component={DataSources} />
      <Route path="/local-seo" component={LocalSEO} />
      <Route path="/deployment" component={Deployment} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/settings" component={Settings} />
      
      {/* Rutas de Campañas y Contenido */}
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaign/:id" component={CampaignDetailsPage} /> {/* <-- Nueva ruta */}
      
      <Route path="/content-creator" component={ContentCreator} />
      <Route path="/content-publisher" component={ContentPublisher} />
      <Route path="/content-manager" component={ContentManager} />
      <Route path="/sites" component={Sites} />
      
      {/* Generadores de Contenido */}
      <Route path="/bulk-content-generator" component={BulkContentGenerator} />
      <Route path="/bulk-massive" component={BulkMassive} />
      
      <Route path="/seo-analyzer" component={SeoAnalyzer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router hook={useHashLocation}>
          <Toaster />
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
