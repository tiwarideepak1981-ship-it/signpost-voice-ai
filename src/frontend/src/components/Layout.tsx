import LeadEntryForm from "@/components/LeadEntryForm";
import { cn } from "@/lib/utils";
import { leadsStore } from "@/store/leadsStore";
import type { Lead } from "@/types";
import { useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, UserPlus } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/calls": "Call Management",
  "/leads": "Lead CRM",
  "/campaigns": "Campaign Management",
  "/analytics": "Analytics",
  "/billing": "Billing",
  "/settings": "Settings",
  "/communications": "Multi-channel Communications",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const title = PAGE_TITLES[pathname] ?? "Overview";
  const sidebarWidth = collapsed ? 56 : 240;

  // FAB modal state — isolated from rest of layout rendering
  const [fabOpen, setFabOpen] = useState(false);

  function handleFabSave(lead: Lead) {
    leadsStore.addLeads([lead]);
  }

  return (
    <div
      className="min-h-screen bg-background flex dark"
      data-ocid="app-layout"
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Main content */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-smooth"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header bar */}
        <header
          className="h-14 flex items-center px-4 gap-3 bg-card border-b border-border shrink-0 sticky top-0 z-20"
          data-ocid="header"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 flex-1">
            <span className="text-muted-foreground/60">Signpost India</span>
            <ChevronRight
              size={12}
              className="shrink-0 text-muted-foreground/40"
            />
            <span className="font-semibold text-foreground truncate">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Notification bell */}
            <button
              type="button"
              data-ocid="header-notifications"
              className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>

            {/* User avatar */}
            <button
              type="button"
              data-ocid="header-user"
              className="flex items-center gap-2 h-8 px-2 rounded hover:bg-muted transition-smooth"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-primary text-[9px] font-bold font-display">
                  MK
                </span>
              </div>
              <div className={cn("text-left hidden sm:block")}>
                <p className="text-xs font-semibold text-foreground leading-none">
                  Manish Kumar
                </p>
                <p className="text-[10px] text-muted-foreground">Admin</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-auto bg-background"
          data-ocid="main-content"
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="h-9 flex items-center justify-center bg-card border-t border-border px-4 shrink-0">
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {/* Floating Add Lead button */}
      <button
        type="button"
        onClick={() => setFabOpen(true)}
        data-ocid="fab.add_lead_button"
        aria-label="Quick Add Lead"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
      >
        <UserPlus size={16} />
        <span className="hidden sm:inline">Add Lead</span>
      </button>

      {/* FAB lead entry modal */}
      <LeadEntryForm
        isOpen={fabOpen}
        onClose={() => setFabOpen(false)}
        onSave={handleFabSave}
        title="Quick Add Lead"
      />
    </div>
  );
}
