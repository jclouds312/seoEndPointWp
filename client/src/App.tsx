import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import BulkMassive from "@/pages/bulk-massive";
import ContentManager from "@/pages/content-manager";
import Settings from "@/pages/settings";
import Sites from "@/pages/sites";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/bulk" component={BulkMassive} />
        <Route path="/content" component={ContentManager} />
        <Route path="/settings" component={Settings} />
        <Route path="/sites" component={Sites} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
