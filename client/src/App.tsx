import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { PartnerAuthProvider } from "./hooks/use-partner-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { PartnerProtectedRoute } from "./lib/partner-protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Partners from "@/pages/partners";
import Commissions from "@/pages/commissions";
import Coupons from "@/pages/coupons";
import Payouts from "@/pages/payouts";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import ApiKeys from "@/pages/api-keys";
import PartnerAuth from "@/pages/partner-auth";
import PartnerDashboard from "@/pages/partner-dashboard";
import PartnerPerformance from "@/pages/partner-performance";
import PartnerCommissions from "@/pages/partner-commissions";
import PartnerPayouts from "@/pages/partner-payouts";
import PartnerReports from "@/pages/partner-reports";

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/partners" component={Partners} />
      <ProtectedRoute path="/commissions" component={Commissions} />
      <ProtectedRoute path="/coupons" component={Coupons} />
      <ProtectedRoute path="/payouts" component={Payouts} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/users" component={Users} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/api-keys" component={ApiKeys} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Partner Routes */}
      <Route path="/partner/auth" component={PartnerAuth} />
      <PartnerProtectedRoute path="/partner/dashboard" component={PartnerDashboard} />
      <PartnerProtectedRoute path="/partner/performance" component={PartnerPerformance} />
      <PartnerProtectedRoute path="/partner/commissions" component={PartnerCommissions} />
      <PartnerProtectedRoute path="/partner/payouts" component={PartnerPayouts} />
      <PartnerProtectedRoute path="/partner/reports" component={PartnerReports} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PartnerAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </PartnerAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
