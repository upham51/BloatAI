import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: string; // Emoji
  IconComponent?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal';
}

export function EmptyState({
  icon = '📝',
  IconComponent,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'minimal') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
          {IconComponent ? (
            <IconComponent className="w-8 h-8 text-muted-foreground" />
          ) : (
            <span className="text-3xl">{icon}</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            className="mt-4"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="premium-card text-center py-16 space-y-4 animate-slide-up">
      {/* Icon */}
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-lavender/20 flex items-center justify-center relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent blur-xl" />

        {IconComponent ? (
          <IconComponent className="w-12 h-12 text-primary relative z-10" />
        ) : (
          <span className="text-5xl relative z-10">{icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action button */}
      {actionLabel && onAction && (
        <div className="pt-4">
          <Button
            onClick={onAction}
            className="bg-primary text-primary-foreground rounded-full px-8 py-6 font-semibold shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
            style={{
              boxShadow: '0 8px 24px hsl(var(--primary) / 0.35)',
            }}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
