import { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  created_at: string;
  updated_at: string;
  meal_count: number;
}

interface UserDetails {
  profile: UserResult;
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedUser(null);
    
    try {
      // Sanitize input: only allow alphanumeric, @, ., _, -, and spaces
      const sanitized = searchQuery.trim().replace(/[^a-zA-Z0-9@._\-\s]/g, '').slice(0, 100);
      
      if (!sanitized) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // Use separate queries to avoid SQL injection in .or() clause
      const { data: emailMatches, error: emailError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', `%${sanitized}%`)
        .limit(10);

      const { data: nameMatches, error: nameError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${sanitized}%`)
        .limit(10);

      if (emailError) throw emailError;
      if (nameError) throw nameError;

      // Merge and deduplicate results
      const allUsers = [...new Map(
        [...(emailMatches || []), ...(nameMatches || [])]
          .map(u => [u.id, u])
      ).values()].slice(0, 10);

      // Get meal counts for each user
      const usersWithCounts = await Promise.all(
        allUsers.map(async (user) => {
          const { count } = await supabase
            .from('meal_entries')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          return {
            ...user,
            meal_count: count || 0,
          };
        })
      );

      setSearchResults(usersWithCounts);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Could not search users',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const loadUserDetails = async (user: UserResult) => {
    setIsLoadingDetails(true);
    
    try {
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

        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Search Results */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Results</h2>
            <div className="space-y-3">
              {searchResults.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
                  <User className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">Search for users by email or name</p>
                </Card>
              ) : (
                searchResults.map((user) => (
                  <Card 
                    key={user.id}
                    className={`bg-slate-800/50 border-slate-700/50 p-4 cursor-pointer transition-all hover:bg-slate-700/50 ${
                      selectedUser?.profile.id === user.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => loadUserDetails(user)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {user.email}
                        </p>
                        <p className="text-sm text-slate-400">{user.display_name || 'No name'}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className={`px-2 py-0.5 rounded-full ${
                            user.subscription_status === 'active' 
                              ? 'bg-green-500/20 text-green-400'
                              : user.subscription_status === 'trial'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-600/50 text-slate-400'
                          }`}>
                            {user.subscription_status || 'inactive'}
                          </span>
                          <span>{user.meal_count} entries</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
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
