import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  RefreshCw,
  BarChart3,
  Search,
  FileWarning,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  User
} from 'lucide-react';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  metadata: any;
  created_at: string;
  user_id: string | null;
  profiles?: {
    email: string;
    display_name: string | null;
  } | null;
}

const ERROR_ICONS: Record<string, typeof AlertTriangle> = {
  photo_upload: XCircle,
  api_timeout: Clock,
  payment: AlertCircle,
  auth: User,
  default: AlertTriangle,
};

const ERROR_COLORS: Record<string, string> = {
  photo_upload: 'text-red-400 bg-red-500/20',
  api_timeout: 'text-amber-400 bg-amber-500/20',
  payment: 'text-orange-400 bg-orange-500/20',
  auth: 'text-blue-400 bg-blue-500/20',
  default: 'text-slate-400 bg-slate-500/20',
};

export default function AdminErrorLogs() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const cutoffs: Record<string, Date> = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

      const { data, error } = await supabase
        .from('error_logs')
        .select(`
          *,
          profiles (email, display_name)
        `)
        .gte('created_at', cutoffs[timeFilter].toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [timeFilter]);

  const getErrorIcon = (type: string) => {
    const Icon = ERROR_ICONS[type] || ERROR_ICONS.default;
    return Icon;
  };

  const getErrorColors = (type: string) => {
    return ERROR_COLORS[type] || ERROR_COLORS.default;
  };

  const formatTimeAgo = (date: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Group errors by type for summary
  const errorSummary = errors.reduce((acc, error) => {
    acc[error.error_type] = (acc[error.error_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileWarning className="w-6 h-6 text-red-400" />
              Error Logs
            </h1>
            <p className="text-sm text-slate-400">{errors.length} errors in selected period</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchErrors}
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
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
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
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
              <FileWarning className="w-4 h-4 mr-2" />
              Error Logs
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Time Range:</span>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errorSummary).length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(errorSummary).map(([type, count]) => (
              <div 
                key={type}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${getErrorColors(type)}`}
              >
                {type}: {count}
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Error List */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Error Logs</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {isLoading ? (
                <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                </Card>
              ) : errors.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">No errors in this period</p>
                  <p className="text-sm text-green-400 mt-2">Everything is running smoothly! ✨</p>
                </Card>
              ) : (
                errors.map((error) => {
                  const Icon = getErrorIcon(error.error_type);
                  const colors = getErrorColors(error.error_type);
                  
                  return (
                    <Card 
                      key={error.id}
                      className={`bg-slate-800/50 border-slate-700/50 p-4 cursor-pointer transition-all hover:bg-slate-700/50 ${
                        selectedError?.id === error.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedError(error)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colors}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-white">{error.error_type}</p>
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              {formatTimeAgo(error.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 truncate mt-1">
                            {error.error_message}
                          </p>
                          {error.profiles?.email && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {error.profiles.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>

          {/* Error Details */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
            {selectedError ? (
              <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getErrorIcon(selectedError.error_type);
                    return (
                      <div className={`p-3 rounded-lg ${getErrorColors(selectedError.error_type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="font-medium text-white text-lg">{selectedError.error_type}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(selectedError.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Error Message</h3>
                  <p className="text-white bg-slate-700/50 p-3 rounded-lg text-sm">
                    {selectedError.error_message}
                  </p>
                </div>

                {selectedError.profiles && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">User</h3>
                    <p className="text-white text-sm">
                      {selectedError.profiles.email}
                      {selectedError.profiles.display_name && ` (${selectedError.profiles.display_name})`}
                    </p>
                  </div>
                )}

                {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Metadata</h3>
                    <pre className="text-xs text-slate-300 bg-slate-700/50 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedError.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
                <Info className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">Select an error to view details</p>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
