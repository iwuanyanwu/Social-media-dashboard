import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  PenSquare, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/posts", label: "Posts", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full hidden md:flex shrink-0">
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <div className="font-bold text-xl tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          Postwave
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            SM
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Social Manager</span>
            <span className="text-xs text-muted-foreground mt-1">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
