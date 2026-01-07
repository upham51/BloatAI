import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  CreditCard,
  UtensilsCrossed,
  Camera,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  BarChart3,
  Search,
  FileWarning,
  Smile
} from 'lucide-react';

interface Metrics {
  totalUsers: number;
  payingUsers: number;
  totalEntries: number;
  photosToday: number;
  recentErrors: Array<{
    id: string;
    error_type: string;
    error_message: string;
    created_at: string;
  }>;
}

interface MonthlyCosts {
  ai_api_cost: number;
  supabase_cost: number;
  stripe_fees: number;
  other_costs: number;
  total_cost: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    payingUsers: 0,
    totalEntries: 0,
    photosToday: 0,
    recentErrors: [],
  });
  const [costs, setCosts] = useState<MonthlyCosts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      // Fetch all metrics in parallel
      const [
        usersResult,
        payingResult,
        entriesResult,
        photosTodayResult,
        errorsResult,
        costsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
        supabase.from('meal_entries').select('id', { count: 'exact', head: true }),
        supabase.from('meal_entries').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('error_logs').select('id, error_type, error_message, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('monthly_costs').select('*').eq('month', currentMonth).maybeSingle(),
      ]);

      setMetrics({
        totalUsers: usersResult.count || 0,
        payingUsers: payingResult.count || 0,
        totalEntries: entriesResult.count || 0,
        photosToday: photosTodayResult.count || 0,
        recentErrors: errorsResult.data || [],
      });

      if (costsResult.data) {
        setCosts({
          ai_api_cost: Number(costsResult.data.ai_api_cost) || 0,
          supabase_cost: Number(costsResult.data.supabase_cost) || 0,
          stripe_fees: Number(costsResult.data.stripe_fees) || 0,
          other_costs: Number(costsResult.data.other_costs) || 0,
          total_cost: Number(costsResult.data.total_cost) || 0,
        });
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Bloat AI Admin
            </h1>
            <p className="text-sm text-slate-400">Last updated: {formatTime(lastUpdated)}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMetrics}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                Exit Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Link to="/admin">
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
              <Search className="w-4 h-4 mr-2" />
              User Search
            </Button>
          </Link>
          <Link to="/admin/errors">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
              <FileWarning className="w-4 h-4 mr-2" />
              Error Logs
            </Button>
          </Link>
          <Link to="/admin/emoji-test">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
              <Smile className="w-4 h-4 mr-2" />
              Emoji Test
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            📊 Key Metrics <span className="text-sm font-normal text-slate-400">(Last 7 Days)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <CreditCard className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Paying Users</p>
                  <p className="text-2xl font-bold text-white">{metrics.payingUsers.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <UtensilsCrossed className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Entries</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalEntries.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Camera className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Photos Today</p>
                  <p className="text-2xl font-bold text-white">{metrics.photosToday.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Costs Section */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            💰 Costs <span className="text-sm font-normal text-slate-400">(This Month)</span>
          </h2>
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            {costs ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-slate-400">AI API</p>
                  <p className="text-xl font-semibold text-white">${costs.ai_api_cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Supabase</p>
                  <p className="text-xl font-semibold text-white">${costs.supabase_cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Stripe Fees</p>
                  <p className="text-xl font-semibold text-white">${costs.stripe_fees.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Other</p>
                  <p className="text-xl font-semibold text-white">${costs.other_costs.toFixed(2)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-2xl font-bold text-primary">${costs.total_cost.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No cost data for this month</p>
                <p className="text-sm">Add costs manually in the database</p>
              </div>
            )}
          </Card>
        </section>

        {/* Recent Errors */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🚨 Recent Errors <span className="text-sm font-normal text-slate-400">(Last 24h)</span>
          </h2>
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            {metrics.recentErrors.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentErrors.map((error) => (
                  <div 
                    key={error.id} 
                    className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-red-400">{error.error_type}</p>
                      <p className="text-sm text-slate-400 truncate">{error.error_message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(error.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/admin/errors">
                  <Button variant="outline" size="sm" className="w-full mt-2 border-slate-600 text-slate-300">
                    View All Error Logs →
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No errors in the last 24 hours</p>
                <p className="text-sm text-green-400">Everything is running smoothly! ✨</p>
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
