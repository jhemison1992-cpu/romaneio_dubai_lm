import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Projects from "./pages/Projects";
import ProjectEnvironments from "./pages/ProjectEnvironments";
import ObraDetail from "./pages/ObraDetail";
import Inspections from "./pages/Inspections";
import InspectionDetail from "./pages/InspectionDetail";
import Users from "./pages/Users";
import Pricing from "./pages/Pricing";
import BillingSuccess from "./pages/BillingSuccess";
import Billing from "./pages/Billing";
import CompanySignup from "./pages/CompanySignup";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyUsers from "./pages/CompanyUsers";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import Landing from "./pages/Landing";
import AppLayout from "./components/AppLayout";
import DeliveryReceipt from "./pages/DeliveryReceipt";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={() => (
        <AppLayout currentPage="obras">
          <Projects />
        </AppLayout>
      )} />
      <Route path="/projects" component={() => (
        <AppLayout currentPage="obras">
          <Projects />
        </AppLayout>
      )} />
      <Route path="/project/:id/environments" component={() => (
        <AppLayout currentPage="obras">
          <ProjectEnvironments />
        </AppLayout>
      )} />
      <Route path="/obra/:id" component={() => (
        <AppLayout currentPage="obras">
          <ObraDetail />
        </AppLayout>
      )} />
      <Route path="/inspections" component={() => (
        <AppLayout currentPage="vistorias">
          <Inspections />
        </AppLayout>
      )} />
      <Route path="/inspection/:id" component={() => (
        <AppLayout currentPage="vistorias">
          <InspectionDetail />
        </AppLayout>
      )} />
      <Route path="/delivery-receipt/:projectId" component={() => (
        <AppLayout currentPage="obras">
          <DeliveryReceipt />
        </AppLayout>
      )} />
      <Route path="/users" component={() => (
        <AppLayout currentPage="usuarios">
          <Users />
        </AppLayout>
      )} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/billing/success" component={BillingSuccess} />
      <Route path="/billing" component={() => (
        <AppLayout>
          <Billing />
        </AppLayout>
      )} />
      <Route path="/signup" component={CompanySignup} />
      <Route path="/select-company" component={CompanyLogin} />
      <Route path="/company/users" component={() => (
        <AppLayout currentPage="usuarios">
          <CompanyUsers />
        </AppLayout>
      )} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/dashboard" component={() => (
        <AppLayout currentPage="dashboard">
          <Dashboard />
        </AppLayout>
      )} />
      <Route path="/obras" component={() => (
        <AppLayout currentPage="obras">
          <Projects />
        </AppLayout>
      )} />
      <Route path="/vistorias" component={() => (
        <AppLayout currentPage="vistorias">
          <Inspections />
        </AppLayout>
      )} />
      <Route path="/usuarios" component={() => (
        <AppLayout currentPage="usuarios">
          <Users />
        </AppLayout>
      )} />
      <Route path="/subscription" component={() => (
        <AppLayout>
          <SubscriptionManagement />
        </AppLayout>
      )} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
