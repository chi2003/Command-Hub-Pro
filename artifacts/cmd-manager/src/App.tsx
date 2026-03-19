import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Pages
import CommandsPage from "@/pages/commands";
import ChainsPage from "@/pages/chains";
import RegistryPage from "@/pages/registry";
import GroupsPage from "@/pages/groups";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={CommandsPage} />
      <Route path="/chains" component={ChainsPage} />
      <Route path="/registry" component={RegistryPage} />
      <Route path="/groups" component={GroupsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4.5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="cmd-manager-theme">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full bg-background overflow-hidden relative">
              {/* Optional ambient background effects for Windows 11 vibe */}
              <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
              
              <AppSidebar />
              
              <div className="flex flex-col flex-1 relative z-10 w-full overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-md border-b border-border/30 z-20 sticky top-0 md:hidden">
                  <div className="flex items-center gap-3">
                     <SidebarTrigger data-testid="button-sidebar-toggle" className="w-10 h-10 rounded-lg hover:bg-secondary" />
                     <span className="font-bold tracking-tight">CMD Manager</span>
                  </div>
                </header>
                
                <main className="flex-1 overflow-y-auto w-full scroll-smooth">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
