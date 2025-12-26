import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, LogOut, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { TriggerChip } from '@/components/shared/TriggerChip';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { RATING_LABELS, MealEntry } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getPendingEntry, getRecentEntries, getTotalCount, getCompletedCount, updateRating, skipRating } = useMeals();
  const { toast } = useToast();

  const pendingEntry = getPendingEntry();
  const recentEntries = getRecentEntries(3);
  const totalCount = getTotalCount();
  const completedCount = getCompletedCount();

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
  const firstName = displayName.split(' ')[0];

  const handleRate = async (rating: number) => {
    if (!pendingEntry) return;
    await updateRating(pendingEntry.id, rating);
    toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
  };

  const handleSkip = async () => {
    if (!pendingEntry) return;
    await skipRating(pendingEntry.id);
    toast({ title: 'Rating skipped' });
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        {/* Hero gradient background with blobs */}
        <div className="absolute inset-0 bg-gradient-hero overflow-hidden">
          <div className="blob absolute w-64 h-64 bg-mint/40 -top-20 -right-20" />
          <div className="blob-2 absolute w-80 h-80 bg-lavender/30 top-40 -left-32" />
          <div className="blob-3 absolute w-48 h-48 bg-peach/30 top-80 right-10" />
        </div>

        <div className="relative z-10 p-5 pt-12">
          {/* Header */}
          <header className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-peach flex items-center justify-center text-lg">
                👤
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Welcome back</p>
                <h1 className="text-xl font-medium text-foreground">{firstName}</h1>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-full bg-card/60 backdrop-blur">
              <LogOut className="w-4 h-4" />
            </Button>
          </header>

          {/* Main Content */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-1">Track your gut health</p>
            <h2 className="text-3xl font-light text-foreground">Your Bloating</h2>
            <h2 className="text-3xl font-medium text-foreground">Journey</h2>
            
            <Button
              variant="secondary"
              className="mt-4 rounded-full px-6 bg-card/80 backdrop-blur shadow-soft"
              onClick={() => navigate('/insights')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Insights
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card variant="elevated" className="bg-gradient-mint p-4 border-0">
              <p className="text-sm font-medium text-foreground/70">Total Meals</p>
              <p className="text-3xl font-light text-foreground">{totalCount}</p>
              <p className="text-xs text-muted-foreground">logged</p>
            </Card>
            <Card variant="elevated" className="bg-gradient-lavender p-4 border-0">
              <p className="text-sm font-medium text-foreground/70">Rated</p>
              <p className="text-3xl font-light text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground">meals</p>
            </Card>
          </div>

          {/* Pending Rating */}
          {pendingEntry && (
            <Card variant="pending" className="mb-6 animate-scale-in">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">Rate your last meal</p>
                <p className="text-xs text-muted-foreground">{pendingEntry.meal_description}</p>
                <RatingScale value={null} onChange={handleRate} size="sm" />
                <button onClick={handleSkip} className="text-xs text-muted-foreground">Skip</button>
              </CardContent>
            </Card>
          )}

          {/* Primary Action */}
          <Button
            variant="default"
            size="lg"
            className="w-full rounded-2xl h-14 shadow-medium"
            onClick={() => navigate('/add-entry')}
          >
            <Plus className="w-5 h-5 mr-2" /> Log New Meal
          </Button>

          {/* Empty state */}
          {totalCount === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-5xl mb-3">🥗</p>
              <p className="text-muted-foreground">Start tracking to discover your triggers</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
