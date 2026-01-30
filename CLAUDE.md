# CLAUDE.md - BloatAI Project Instructions

## Project Overview

BloatAI is a health tracking web application that helps users identify food-related bloating triggers through AI-powered meal logging and analysis. Target users are people with IBS, FODMAP sensitivities, or chronic bloating.

## Tech Stack

- **Frontend**: React 18.3 + TypeScript 5.8 + Vite 5.4
- **Styling**: Tailwind CSS 3.4 + shadcn/ui (Radix primitives)
- **Animations**: Framer Motion 12
- **State**: React Context + TanStack Query 5
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI**: Claude via Supabase Edge Functions
- **Payments**: Stripe

## Development Commands

```bash
npm run dev          # Start dev server at localhost:8080
npm run build        # Production build
npm run test         # Run tests with Vitest
npm run test:ui      # Interactive test UI
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/      # React components
│   ├── ui/          # shadcn/ui components (do not edit directly)
│   ├── layout/      # AppLayout, BottomNav, PageTransition
│   ├── meals/       # Meal logging components
│   ├── triggers/    # Trigger selection, FODMAP guide
│   ├── insights/    # Charts, recommendations
│   ├── onboarding/  # 5-step onboarding flow
│   └── milestones/  # Gamification UI
├── pages/           # Route pages (lazy-loaded)
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
└── integrations/    # Supabase client & types

supabase/
├── functions/       # Edge Functions (AI analysis, Stripe, admin)
└── migrations/      # Database migrations
```

## Key Contexts

- `AuthContext` - User authentication state (Supabase Auth)
- `MealContext` - Meal CRUD operations and statistics
- `MilestonesContext` - User progression and achievements
- `SubscriptionContext` - Subscription status and feature flags
- `RecoveryModeContext` - Reduced motion accessibility setting

## Important Patterns

### Imports
Use the `@/` path alias for imports:
```typescript
import { Button } from "@/components/ui/button";
import { useMeals } from "@/contexts/MealContext";
```

### Component Organization
- UI primitives go in `components/ui/` (shadcn components)
- Feature components go in feature folders (meals/, insights/, etc.)
- Pages are lazy-loaded in `App.tsx`

### Data Fetching
Use TanStack Query for server state:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['meals', userId],
  queryFn: () => fetchMeals(userId),
});
```

### Form Handling
Use React Hook Form with Zod:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

## Testing

Tests use Vitest + React Testing Library. Test files are colocated with source files or in `__tests__` directories.

```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage report
```

## Styling Guidelines

- Use Tailwind utility classes
- Custom colors: sage, mint, lavender, peach, coral, sky (defined in tailwind.config.ts)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Mobile-first responsive design

## Performance Considerations

- Pages are lazy-loaded via React.lazy()
- Vendor libraries are code-split (see vite.config.ts)
- Asset budget limits: 3MB videos, 1.5MB images, 300KB SVGs
- Subscription checks are session-based, not per-request

## Supabase Edge Functions

Located in `supabase/functions/`:
- `analyze-food` - Claude AI image analysis for meals
- `analyze-meal-text` - Text-based meal analysis
- `create-checkout` - Stripe checkout session
- `check-subscription` - Validate subscription status
- `customer-portal` - Stripe customer portal redirect

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
```

## Common Tasks

### Adding a new page
1. Create component in `src/pages/`
2. Add lazy import in `App.tsx`
3. Add route in the Router

### Adding a new UI component
Use shadcn CLI: Components are pre-installed in `src/components/ui/`

### Modifying database schema
1. Create migration in `supabase/migrations/`
2. Update types in `src/integrations/supabase/types.ts`

## Protected Routes

- Public: `/`, `/signin`, `/signup`, `/pricing`
- Protected: `/dashboard`, `/add-entry`, `/history`, `/insights`, `/profile`
- Admin: `/admin`, `/admin/users`, `/admin/errors`

## Documentation

- `BLOAT_AI_PROJECT_DOCUMENTATION.md` - Comprehensive technical docs
- `ADMIN_SETUP.md` - Admin access configuration
- `PERFORMANCE_IMPROVEMENTS_SUMMARY.md` - Performance optimization details
