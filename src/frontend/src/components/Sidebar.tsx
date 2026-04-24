import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Phone,
  Search,
  Settings,
  Users,
  Zap,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
    ocid: "nav-overview",
  },
  { label: "Calls", href: "/calls", icon: Phone, ocid: "nav-calls" },
  { label: "Leads", href: "/leads", icon: Users, ocid: "nav-leads" },
  {
    label: "Prospect Finder",
    href: "/prospects",
    icon: Search,
    ocid: "nav-prospects",
  },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: Megaphone,
    ocid: "nav-campaigns",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    ocid: "nav-analytics",
  },
  { label: "Billing", href: "/billing", icon: CreditCard, ocid: "nav-billing" },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    ocid: "nav-settings",
  },
  {
    label: "Communications",
    href: "/communications",
    icon: MessageSquare,
    ocid: "nav-communications",
  },
  {
    label: "AI Dialer",
    href: "/ai-dialer",
    icon: BotMessageSquare,
    ocid: "nav-ai-dialer",
  },
  {
    label: "Phone Dialer",
    href: "/human-dialer",
    icon: Phone,
    ocid: "nav-human-dialer",
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-30 transition-smooth",
        "bg-[oklch(var(--sidebar))] border-r border-border",
        collapsed ? "w-14" : "w-60",
      )}
      data-ocid="sidebar"
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-2.5 h-14 px-3 border-b border-border shrink-0",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary shrink-0">
          <Zap
            size={16}
            className="text-primary-foreground"
            strokeWidth={2.5}
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold font-display text-foreground leading-none truncate">
              Signpost India
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
              GenAI Voice Automation
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 py-2 overflow-y-auto overflow-x-hidden"
        data-ocid="sidebar-nav"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === "/" && item.href === "/overview");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              data-ocid={item.ocid}
              className={cn(
                "flex items-center gap-2.5 h-9 mx-1.5 px-2.5 rounded text-xs font-medium transition-smooth relative group",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary pl-[calc(0.625rem-2px)]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent pl-[calc(0.625rem-2px)]",
                collapsed &&
                  "justify-center px-0 pl-0 border-l-0 mx-0 rounded-none w-full",
              )}
            >
              <Icon
                size={15}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="shrink-0"
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border text-foreground text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-smooth whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle + User */}
      <div className="border-t border-border shrink-0">
        <button
          type="button"
          onClick={onToggle}
          data-ocid="sidebar-toggle"
          className={cn(
            "flex items-center w-full h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth text-xs gap-2",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </>
          )}
        </button>
        {!collapsed && (
          <div
            className="flex items-center gap-2 px-3 py-2 border-t border-border"
            data-ocid="sidebar-user"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <span className="text-primary text-[10px] font-bold font-display">
                MK
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-none truncate">
                Manish Kumar
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">
                Admin
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
