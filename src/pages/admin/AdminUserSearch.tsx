import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  User,
  Mail,
  Calendar,
  UtensilsCrossed,
  Activity,
  ArrowLeft,
  BarChart3,
  FileWarning,
  Trash2,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserResult {
  id: string;
  email: string;
  display_name: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_ends_at: string | null;
  admin_granted_by?: string | null;
  admin_granted_at?: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  meal_count: number;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface UserDetails {
  profile: UserResult;
  roles: UserRole[];
  entries: Array<{
    id: string;
    meal_description: string;
    bloating_rating: number | null;
    detected_triggers: any;
    created_at: string;
  }>;
  topTriggers: Array<{ name: string; count: number }>;
}

export default function AdminUserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserResult | null>(null);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Filters state
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<string>('all');
  const [subscriptionPlanFilter, setSubscriptionPlanFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'created_at' | 'email' | 'subscription_status' | 'meal_count'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const pageSize = 50;

  const handleSearch = async () => {
    setIsSearching(true);
    setSelectedUser(null);
    setCurrentPage(1);

    try {
      // Start with base query
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply search filter if provided
      if (searchQuery.trim()) {
        const sanitized = searchQuery.trim().replace(/[^a-zA-Z0-9@._\-\s]/g, '').slice(0, 100);
        if (sanitized) {
          query = query.or(`email.ilike.${sanitized}%,display_name.ilike.${sanitized}%`);
        }
      }

      // Apply subscription status filter
      if (subscriptionStatusFilter !== 'all') {
        query = query.eq('subscription_status', subscriptionStatusFilter);
      }

      // Apply subscription plan filter
      if (subscriptionPlanFilter !== 'all') {
        if (subscriptionPlanFilter === 'none') {
          query = query.is('subscription_plan', null);
        } else {
          query = query.eq('subscription_plan', subscriptionPlanFilter);
        }
      }

      // Sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: users, error: usersError, count } = await query;

      if (usersError) throw usersError;

      // Get meal counts and last entry for each user
      const usersWithData = await Promise.all(
        (users || []).map(async (user) => {
          const { count: mealCount } = await supabase
            .from('meal_entries')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            ...user,
            meal_count: mealCount || 0,
          };
        })
      );

      // Apply role filter (client-side for now)
      let filteredUsers = usersWithData;
      if (roleFilter !== 'all') {
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        const adminUserIds = new Set((adminRoles || []).map(r => r.user_id));

        if (roleFilter === 'admin') {
          filteredUsers = usersWithData.filter(u => adminUserIds.has(u.id));
        } else if (roleFilter === 'user') {
          filteredUsers = usersWithData.filter(u => !adminUserIds.has(u.id));
        }
      }

      // Apply activity filter (client-side)
      if (activityFilter === 'active') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // For now, we'll need to fetch last entry dates to filter properly
        // This is a simplified version
      } else if (activityFilter === 'inactive') {
        // Similar logic for inactive users
      }

      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Could not load users',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const loadUserDetails = async (user: UserResult) => {
    setIsLoadingDetails(true);

    try {
      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      const { data: entries, error: entriesError } = await supabase
        .from('meal_entries')
        .select('id, meal_description, bloating_rating, detected_triggers, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (entriesError) throw entriesError;

      // Calculate top triggers
      const triggerCounts: Record<string, number> = {};
      (entries || []).forEach((entry) => {
        const triggers = entry.detected_triggers as any[];
        if (Array.isArray(triggers)) {
          triggers.forEach((t) => {
            const name = t.category || t.name || 'Unknown';
            triggerCounts[name] = (triggerCounts[name] || 0) + 1;
          });
        }
      });

      const topTriggers = Object.entries(triggerCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setSelectedUser({
        profile: user,
        roles: roles || [],
        entries: entries || [],
        topTriggers,
      });
    } catch (error) {
      console.error('Error loading user details:', error);
      toast({
        title: 'Error',
        description: 'Could not load user details',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userToDelete) return;

    try {
      // Delete from profiles (cascades to other tables)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      toast({
        title: 'Account deleted',
        description: `${userToDelete.email} has been deleted`,
      });

      // Remove from results
      setSearchResults((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSelectedUser(null);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete user account',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubscription = async (action: 'grant' | 'revoke', plan?: 'annual' | 'monthly') => {
    if (!selectedUser || !session) return;

    setIsUpdatingSubscription(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-update-subscription', {
        body: {
          targetUserId: selectedUser.profile.id,
          action,
          plan,
        },
      });

      if (error) throw error;

      toast({
        title: 'Subscription updated',
        description: action === 'grant'
          ? `Granted ${plan} subscription to ${selectedUser.profile.email}`
          : `Revoked subscription from ${selectedUser.profile.email}`,
      });

      // Reload user details
      await loadUserDetails(selectedUser.profile);
    } catch (error) {
      console.error('Subscription update error:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Could not update subscription',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const handleUpdateRole = async (action: 'grant' | 'revoke', role: 'admin') => {
    if (!selectedUser || !session) return;

    setIsUpdatingRole(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-roles', {
        body: {
          targetUserId: selectedUser.profile.id,
          action,
          role,
        },
      });

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: action === 'grant'
          ? `Granted ${role} role to ${selectedUser.profile.email}`
          : `Revoked ${role} role from ${selectedUser.profile.email}`,
      });

      // Reload user details
      await loadUserDetails(selectedUser.profile);
    } catch (error) {
      console.error('Role update error:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Could not update role',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Load users on mount and when filters/sort change
  useEffect(() => {
    handleSearch();
  }, [subscriptionStatusFilter, subscriptionPlanFilter, roleFilter, activityFilter, sortColumn, sortDirection, currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              User Search
            </h1>
            <p className="text-sm text-slate-400">Find and manage user accounts</p>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
              Exit Admin
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
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
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Subscription Status</label>
              <select
                value={subscriptionStatusFilter}
                onChange={(e) => setSubscriptionStatusFilter(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Subscription Plan</label>
              <select
                value={subscriptionPlanFilter}
                onChange={(e) => setSubscriptionPlanFilter(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="annual">Annual</option>
                <option value="monthly">Monthly</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="user">Regular Users</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Search</label>
              <Input
                placeholder="Email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Users ({searchResults.length})</h2>
              {isSearching && (
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-700/70"
                        onClick={() => handleSort('email')}
                      >
                        Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-700/70"
                        onClick={() => handleSort('subscription_status')}
                      >
                        Status {sortColumn === 'subscription_status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-700/70"
                        onClick={() => handleSort('meal_count')}
                      >
                        Entries {sortColumn === 'meal_count' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-700/70"
                        onClick={() => handleSort('created_at')}
                      >
                        Joined {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          {isSearching ? 'Loading...' : 'No users found'}
                        </td>
                      </tr>
                    ) : (
                      searchResults.map((user) => (
                        <tr
                          key={user.id}
                          className={`border-t border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                            selectedUser?.profile.id === user.id ? 'bg-slate-700/50' : ''
                          }`}
                          onClick={() => loadUserDetails(user)}
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm text-white truncate max-w-[200px]">{user.email}</div>
                            <div className="text-xs text-slate-400">{user.display_name || 'No name'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              user.subscription_status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : user.subscription_status === 'trial'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-600/50 text-slate-400'
                            }`}>
                              {user.subscription_status || 'inactive'}
                            </span>
                            {user.subscription_plan && (
                              <div className="text-xs text-slate-500 mt-1">{user.subscription_plan}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">{user.meal_count}</td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-slate-600 hover:bg-slate-700"
              >
                Previous
              </Button>
              <span className="text-sm text-slate-400">Page {currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={searchResults.length < pageSize}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-slate-600 hover:bg-slate-700"
              >
                Next
              </Button>
            </div>
          </section>

          {/* User Details */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">User Details</h2>
            {isLoadingDetails ? (
              <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </Card>
            ) : selectedUser ? (
              <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-6">
                {/* Account Info */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">📋 Account Info</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white">{selectedUser.profile.display_name || 'Not set'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white">{selectedUser.profile.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Joined:</span>
                      <span className="text-white">{new Date(selectedUser.profile.created_at).toLocaleDateString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Subscription:</span>
                      <span className={`${
                        selectedUser.profile.subscription_status === 'active' 
                          ? 'text-green-400' 
                          : 'text-slate-400'
                      }`}>
                        {selectedUser.profile.subscription_status || 'inactive'} 
                        {selectedUser.profile.subscription_plan && ` (${selectedUser.profile.subscription_plan})`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Activity */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">📊 Activity</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Total entries:</span>
                      <span className="text-white">{selectedUser.entries.length}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Last entry:</span>
                      <span className="text-white">
                        {selectedUser.entries[0]
                          ? new Date(selectedUser.entries[0].created_at).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Subscription Management */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Subscription Management
                  </h3>
                  <div className="space-y-3">
                    {/* Current subscription status */}
                    <div className="p-3 bg-slate-700/30 rounded-lg text-sm space-y-1">
                      <p className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className={`font-medium ${
                          selectedUser.profile.subscription_status === 'active'
                            ? 'text-green-400'
                            : 'text-slate-400'
                        }`}>
                          {selectedUser.profile.subscription_status || 'inactive'}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Plan:</span>
                        <span className="text-white">
                          {selectedUser.profile.subscription_plan || 'None'}
                        </span>
                      </p>
                      {selectedUser.profile.subscription_ends_at && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Ends at:</span>
                          <span className="text-white">
                            {new Date(selectedUser.profile.subscription_ends_at).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                      {selectedUser.profile.admin_granted_by && (
                        <p className="text-xs text-amber-400 mt-2">
                          ✨ Manually granted by admin
                        </p>
                      )}
                      {selectedUser.profile.stripe_customer_id && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Stripe ID:</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {selectedUser.profile.stripe_customer_id.slice(0, 20)}...
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isUpdatingSubscription}
                        onClick={() => handleUpdateSubscription('grant', 'annual')}
                        className="flex-1"
                      >
                        Grant Annual
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isUpdatingSubscription}
                        onClick={() => handleUpdateSubscription('grant', 'monthly')}
                        className="flex-1"
                      >
                        Grant Monthly
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdatingSubscription}
                      onClick={() => handleUpdateSubscription('revoke')}
                      className="w-full border-slate-600 hover:bg-slate-700"
                    >
                      Revoke Subscription
                    </Button>
                  </div>
                </div>

                {/* Role Management */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Roles & Permissions
                  </h3>
                  <div className="space-y-3">
                    {/* Current roles */}
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.roles.length === 0 ? (
                        <span className="text-sm text-slate-500">No special roles</span>
                      ) : (
                        selectedUser.roles.map((role) => (
                          <span
                            key={role.id}
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-purple-500/20 text-purple-300"
                          >
                            <Crown className="w-3 h-3" />
                            {role.role}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {selectedUser.roles.some(r => r.role === 'admin') ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdatingRole || selectedUser.profile.id === session?.user?.id}
                          onClick={() => handleUpdateRole('revoke', 'admin')}
                          className="flex-1 border-slate-600 hover:bg-slate-700"
                        >
                          {selectedUser.profile.id === session?.user?.id
                            ? "Can't revoke own admin"
                            : "Revoke Admin"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isUpdatingRole}
                          onClick={() => handleUpdateRole('grant', 'admin')}
                          className="flex-1"
                        >
                          Grant Admin Role
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Triggers */}
                {selectedUser.topTriggers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3">🎯 Top Triggers</h3>
                    <div className="space-y-1">
                      {selectedUser.topTriggers.map((trigger, i) => (
                        <div key={trigger.name} className="flex justify-between text-sm">
                          <span className="text-white">{i + 1}. {trigger.name}</span>
                          <span className="text-slate-400">{trigger.count} occurrences</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Entries */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">📸 Recent Entries</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUser.entries.slice(0, 5).map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-2 bg-slate-700/30 rounded-lg text-sm"
                      >
                        <p className="text-white truncate">{entry.meal_description}</p>
                        <p className="text-xs text-slate-500 flex justify-between mt-1">
                          <span>Bloating: {entry.bloating_rating || 'N/A'}/5</span>
                          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-medium text-red-400 mb-3">⚠️ Danger Zone</h3>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setUserToDelete(selectedUser.profile);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">Select a user to view details</p>
              </Card>
            )}
          </section>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete <strong className="text-white">{userToDelete?.email}</strong> and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
