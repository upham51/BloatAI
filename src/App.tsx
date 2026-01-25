import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MealProvider } from "@/contexts/MealContext";
import { MilestonesProvider } from "@/contexts/MilestonesContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useAdmin } from "@/hooks/useAdmin";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { DeferredMeshGradientBackground } from "@/components/ui/DeferredMeshGradientBackground";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

// Eager load authentication pages (small, needed immediately)
import WelcomePage from "./pages/WelcomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

// Lazy load main app pages (loaded on demand for better initial performance)
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AddEntryPage = lazy(() => import("./pages/AddEntryPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const BarcodeScanner = lazy(() => import("./components/meals/BarcodeScanner").then(m => ({ default: m.BarcodeScanner })));

// Lazy load admin pages (rarely used, can load on demand)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUserSearch = lazy(() => import("./pages/admin/AdminUserSearch"));
const AdminErrorLogs = lazy(() => import("./pages/admin/AdminErrorLogs"));
const EmojiTest = lazy(() => import("./pages/admin/EmojiTest"));

// Lazy load error page
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure React Query for optimal caching and performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Don't refetch on window focus (prevents unnecessary requests)
      refetchOnWindowFocus: false,
      // Retry failed queries 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
        </motion.div>
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
        </motion.div>
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
        </motion.div>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Loading fallback for lazy-loaded components
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
      </motion.div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<PublicRoute><WelcomePage /></PublicRoute>} />
        <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGate><DashboardPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/add-entry" element={<ProtectedRoute><SubscriptionGate><AddEntryPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/barcode-scanner" element={<ProtectedRoute><SubscriptionGate><BarcodeScanner /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><SubscriptionGate><HistoryPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><SubscriptionGate><InsightsPage /></SubscriptionGate></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUserSearch /></AdminRoute>} />
      <Route path="/admin/errors" element={<AdminRoute><AdminErrorLogs /></AdminRoute>} />
      <Route path="/admin/emoji-test" element={<AdminRoute><EmojiTest /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

function GlobalBackground() {
  const { pathname } = useLocation();

  // The welcome/auth screens already render their own background. Keeping the global
  // animated mesh background off these routes avoids cold-start jank that can cause
  // the preview iframe to disconnect (“connection was reset”).
  const disableOn = new Set<string>(["/", "/signin", "/signup"]);
  if (disableOn.has(pathname)) return null;

  return <DeferredMeshGradientBackground variant="balanced" delayMs={2500} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalBackground />
        <ScrollToTop />
        <AuthProvider>
          <SubscriptionProvider>
            <MealProvider>
              <MilestonesProvider>
                <AppRoutes />
              </MilestonesProvider>
            </MealProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
