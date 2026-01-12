import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Projects from "./pages/Projects";
import ProjectEnvironments from "./pages/ProjectEnvironments";
import Inspections from "./pages/Inspections";
import InspectionDetail from "./pages/InspectionDetail";
import Users from "./pages/Users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <DashboardLayout>
          <Projects />
        </DashboardLayout>
      )} />
      <Route path="/projects" component={() => (
        <DashboardLayout>
          <Projects />
        </DashboardLayout>
      )} />
      <Route path="/project/:id/environments" component={() => (
        <DashboardLayout>
          <ProjectEnvironments />
        </DashboardLayout>
      )} />
      <Route path="/inspections" component={() => (
        <DashboardLayout>
          <Inspections />
        </DashboardLayout>
      )} />
      <Route path="/inspection/:id" component={() => (
        <DashboardLayout>
          <InspectionDetail />
        </DashboardLayout>
      )} />
      <Route path="/users" component={Users} />
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
