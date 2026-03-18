import { 
  Terminal, 
  Layers, 
  Settings,
  Moon,
  Sun,
  Laptop,
  DatabaseZap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useTheme } from "./theme-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const navItems = [
  { title: "Commands", href: "/", icon: Terminal },
  { title: "Command Chains", href: "/chains", icon: Layers },
  { title: "Registry Manager", href: "/registry", icon: DatabaseZap },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { setTheme, theme } = useTheme();

  return (
    <Sidebar className="border-r border-border/50 glass">
      <SidebarContent>
        <div className="p-6 flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Terminal className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">CMD Manager</span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Library
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        my-1 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                          : 'hover:bg-secondary text-muted-foreground hover:text-foreground hover-elevate'
                        }
                      `}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
             <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === '/settings'}
                  className={`
                    my-1 px-4 py-3 rounded-xl transition-all duration-200
                    ${location === '/settings' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground hover-elevate'
                    }
                  `}
                >
                  <Link href="/settings" className="flex items-center gap-3 w-full">
                    <Settings className={`w-5 h-5 ${location === '/settings' ? 'text-primary' : ''}`} />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-border/50">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors outline-none focus:ring-2 focus:ring-primary/20">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                  <span className="capitalize">{theme} Theme</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass rounded-xl border-border/50">
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer rounded-lg m-1">
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer rounded-lg m-1">
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer rounded-lg m-1">
                <Laptop className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
