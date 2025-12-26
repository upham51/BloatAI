import { useState } from 'react';
import { User, Mail, Bell, LogOut, Trash2, ChevronRight, Shield } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      variant: 'destructive',
      title: 'Not available',
      description: 'Account deletion coming soon. Contact support for now.',
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-lavender/10 to-mint/10">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-5 w-32 h-32 bg-lavender/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-5 pb-32 max-w-lg mx-auto space-y-6">
          {/* Header */}
          <header className="pt-2 mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your account</p>
          </header>

          {/* Profile Card */}
          <div className="glass-card p-6 flex items-center gap-5 animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">
                {user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || 'No email'}
              </p>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="glass-card overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="px-5 py-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-peach/30 to-coral/20">
                  <Bell className="w-5 h-5 text-coral" />
                </div>
                <h3 className="font-bold text-foreground">Notifications</h3>
              </div>
            </div>
            
            <div className="divide-y divide-border/30">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
                </div>
                <Switch 
                  checked={pushEnabled} 
                  onCheckedChange={setPushEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-foreground">90-min Rating Reminders</p>
                  <p className="text-xs text-muted-foreground">Get reminded to rate meals</p>
                </div>
                <Switch 
                  checked={reminderEnabled} 
                  onCheckedChange={setReminderEnabled}
                />
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="glass-card overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="px-5 py-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-sky/30 to-sky-light/30">
                  <Shield className="w-5 h-5 text-sky" />
                </div>
                <h3 className="font-bold text-foreground">Account</h3>
              </div>
            </div>
            
            <div className="divide-y divide-border/30">
              <button 
                onClick={handleSignOut}
                className="flex items-center justify-between w-full px-5 py-4 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Sign Out</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <button 
                onClick={handleDeleteAccount}
                className="flex items-center justify-between w-full px-5 py-4 hover:bg-destructive/5 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive/70" />
                  <span className="font-medium text-destructive/70 group-hover:text-destructive">Delete Account</span>
                </div>
                <ChevronRight className="w-5 h-5 text-destructive/50" />
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="text-center pt-6 animate-slide-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <p className="text-xs text-muted-foreground">BloatAI v1.0.0</p>
            <p className="text-xs text-muted-foreground mt-1">Made with 💚 for your gut health</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
