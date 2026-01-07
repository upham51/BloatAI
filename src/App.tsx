import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MealProvider } from "@/contexts/MealContext";
import { useAdmin } from "@/hooks/useAdmin";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AddEntryPage from "./pages/AddEntryPage";
import HistoryPage from "./pages/HistoryPage";
import InsightsPage from "./pages/InsightsPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserSearch from "./pages/admin/AdminUserSearch";
import AdminErrorLogs from "./pages/admin/AdminErrorLogs";
import EmojiTest from "./pages/admin/EmojiTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  
  if (isLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGate><DashboardPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/add-entry" element={<ProtectedRoute><SubscriptionGate><AddEntryPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><SubscriptionGate><HistoryPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><SubscriptionGate><InsightsPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUserSearch /></AdminRoute>} />
      <Route path="/admin/errors" element={<AdminRoute><AdminErrorLogs /></AdminRoute>} />
      <Route path="/admin/emoji-test" element={<AdminRoute><EmojiTest /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MealProvider>
            <AppRoutes />
          </MealProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
