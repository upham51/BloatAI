import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MealProvider } from "@/contexts/MealContext";
import { MilestonesProvider } from "@/contexts/MilestonesContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useAdmin } from "@/hooks/useAdmin";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { DeferredMeshGradientBackground } from "@/components/ui/DeferredMeshGradientBackground";
import { lazy, Suspense, useContext, useState } from "react";
import { RecoveryModeContext } from "@/contexts/RecoveryModeContext";
import { initRecoveryMode } from "@/lib/recoveryMode";

// Eager load authentication pages (small, needed immediately)
import WelcomePage from "./pages/WelcomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

// Lazy load main app pages (loaded on demand for better initial performance)
const dashboardImport = () => import("./pages/DashboardPage");
const addEntryImport = () => import("./pages/AddEntryPage");
const historyImport = () => import("./pages/HistoryPage");
const insightsImport = () => import("./pages/InsightsPage");
const profileImport = () => import("./pages/ProfilePage");
const pricingImport = () => import("./pages/PricingPage");
const barcodeScannerImport = () => import("./components/meals/BarcodeScanner").then(m => ({ default: m.BarcodeScanner }));

const DashboardPage = lazy(dashboardImport);
const AddEntryPage = lazy(addEntryImport);
const HistoryPage = lazy(historyImport);
const InsightsPage = lazy(insightsImport);
const ProfilePage = lazy(profileImport);
const PricingPage = lazy(pricingImport);
const BarcodeScanner = lazy(barcodeScannerImport);

// Prefetch all main routes after initial load so tab switching is instant
function prefetchRoutes() {
  dashboardImport();
  addEntryImport();
  historyImport();
  insightsImport();
  profileImport();
}

if (typeof window !== 'undefined') {
  const ric = (window as unknown as Record<string, unknown>).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined;
  if (ric) {
    ric(prefetchRoutes, { timeout: 2000 });
  } else {
    setTimeout(prefetchRoutes, 1000);
  }
}

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
  if (isLoading) return <div className="min-h-screen" />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  if (isLoading || isAdminLoading) return <div className="min-h-screen" />;
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Lightweight skeleton fallback — matches general page shape so the transition
// from loading to content feels seamless. Rarely visible due to prefetching.
function LoadingFallback() {
  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="h-8 w-40 rounded-xl bg-muted animate-pulse" />
      <div className="h-48 rounded-[2rem] bg-muted/60 animate-pulse" />
      <div className="h-32 rounded-[2rem] bg-muted/40 animate-pulse" />
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
        {/* Back-compat / typo route: prevent 404 + potential heavy background animations on unknown routes */}
        <Route path="/add" element={<Navigate to="/add-entry" replace />} />
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
  const recoveryMode = useContext(RecoveryModeContext);

  if (recoveryMode) return null;

  // The welcome/auth screens already render their own background. Keeping the global
  // animated mesh background off these routes avoids cold-start jank that can cause
  // the preview iframe to disconnect (“connection was reset”).
  const disableOn = new Set<string>(["/", "/signin", "/signup"]);
  if (disableOn.has(pathname)) return null;

  // Only enable the animated background on known routes. Unknown routes (e.g. typos like
  // "/add") should stay as lightweight as possible to avoid preview resets.
  const enableOn = new Set<string>([
    "/pricing",
    "/dashboard",
    "/add-entry",
    "/barcode-scanner",
    "/history",
    "/insights",
    "/profile",
    "/admin",
    "/admin/users",
    "/admin/errors",
    "/admin/emoji-test",
  ]);
  if (!enableOn.has(pathname)) return null;

  return <DeferredMeshGradientBackground variant="balanced" delayMs={100} />;
}

function RouteProviders({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  // These routes should boot as fast as possible. Avoid mounting providers that do
  // background work (subscription checks, DB queries, localStorage parsing, etc.).
  const minimalRoutes = new Set<string>(["/", "/signin", "/signup"]);
  if (minimalRoutes.has(pathname)) return <>{children}</>;

  return (
    <SubscriptionProvider>
      <MealProvider>
        <MilestonesProvider>{children}</MilestonesProvider>
      </MealProvider>
    </SubscriptionProvider>
  );
}

const App = () => (
  <AppWithRecovery />
);

function AppWithRecovery() {
  const [recoveryMode] = useState(() => initRecoveryMode());

  return (
    <RecoveryModeContext.Provider value={recoveryMode}>
      <MotionConfig reducedMotion={recoveryMode ? "always" : "user"}>
        <Suspense fallback={<LoadingFallback />}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <GlobalBackground />
                <ScrollToTop />
                <AuthProvider>
                  <RouteProviders>
                    <AppRoutes />
                  </RouteProviders>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </Suspense>
      </MotionConfig>
    </RecoveryModeContext.Provider>
  );
}

export default App;
