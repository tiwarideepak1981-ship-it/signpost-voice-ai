import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AIDialerPage from "./pages/AIDialerPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BillingPage from "./pages/BillingPage";
import CallsPage from "./pages/CallsPage";
import CampaignsPage from "./pages/CampaignsPage";
import CommunicationsPage from "./pages/CommunicationsPage";
import HumanDialerPage from "./pages/HumanDialerPage";
import LeadsPage from "./pages/LeadsPage";
import OverviewPage from "./pages/OverviewPage";
import ProspectFinderPage from "./pages/ProspectFinderPage";
import SettingsPage from "./pages/SettingsPage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/overview" });
  },
});

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/overview",
  component: OverviewPage,
});
const callsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calls",
  component: CallsPage,
});
const leadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leads",
  component: LeadsPage,
});
const campaignsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns",
  component: CampaignsPage,
});
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});
const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing",
  component: BillingPage,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
const communicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communications",
  component: CommunicationsPage,
});
const aiDialerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-dialer",
  component: AIDialerPage,
});
const prospectFinderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prospects",
  component: ProspectFinderPage,
});
const humanDialerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/human-dialer",
  component: HumanDialerPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  overviewRoute,
  callsRoute,
  leadsRoute,
  campaignsRoute,
  analyticsRoute,
  billingRoute,
  settingsRoute,
  communicationsRoute,
  aiDialerRoute,
  prospectFinderRoute,
  humanDialerRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
