# Bloat AI - Comprehensive Project Documentation

**A sophisticated health tracking application that uses AI to help users identify and manage food-related bloating triggers**

---

## Table of Contents

1. [Project Vision & Purpose](#project-vision--purpose)
2. [Technical Architecture](#technical-architecture)
3. [Design System & Visual Language](#design-system--visual-language)
4. [Core Features & User Experience](#core-features--user-experience)
5. [Database Schema & Data Models](#database-schema--data-models)
6. [Component Architecture](#component-architecture)
7. [User Flows & Interaction Patterns](#user-flows--interaction-patterns)
8. [AI Integration & Analysis](#ai-integration--analysis)
9. [Code Conventions & Patterns](#code-conventions--patterns)
10. [Subscription & Monetization](#subscription--monetization)

---

## Project Vision & Purpose

### What is Bloat AI?

Bloat AI is a mobile-first web application that empowers users to identify and eliminate foods that cause bloating and digestive discomfort. Through a combination of photo-based meal logging, AI-powered food analysis, and intelligent pattern recognition, users gain personalized insights into their digestive health.

### Core Value Proposition

- **Photo-First Entry**: Users snap photos of meals (or type descriptions) for effortless logging
- **AI Food Analysis**: Claude AI automatically identifies ingredients, detects potential FODMAP triggers, and generates creative meal titles
- **Pattern Recognition**: After just 3-5 meals, users receive comprehensive insights about their bloating triggers
- **Actionable Recommendations**: Clear, phased elimination plans with behavioral insights
- **Beautiful UX**: Soft, calming design with smooth animations that make health tracking feel delightful

### Target Audience

- **Primary**: People with IBS, FODMAP sensitivities, or chronic bloating (ages 25-45, predominantly female)
- **Secondary**: Anyone experiencing digestive discomfort who wants to identify trigger foods
- **Psychographic**: Health-conscious, tech-savvy, willing to invest in wellness

---

## Technical Architecture

### Technology Stack

**Frontend Framework**
- React 18.3.1 (latest hooks and concurrent features)
- TypeScript 5.8.3 (strict mode enabled)
- Vite 5.4.19 (lightning-fast dev server and build)
- React Router 6.30.1 (client-side routing with protected routes)

**Styling & UI**
- Tailwind CSS 3.4.17 (utility-first CSS)
- shadcn/ui (Radix UI primitives with custom styling)
- Framer Motion 12.24.10 (spring animations, page transitions)
- Custom design system with HSL color variables

**State Management**
- React Context API (Auth, Meals)
- TanStack Query 5.83.0 (server state, caching, background refetching)
- Local component state with useState/useReducer

**Backend & Database**
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Row-level security (RLS) for data protection
- Private storage bucket for meal photos with signed URLs

**External Services**
- Stripe (subscription payments and customer portal)
- Claude AI API (via Supabase Edge Functions for image analysis)

**Developer Experience**
- Vitest 4.0.16 + React Testing Library (unit/integration tests)
- ESLint 9.32.0 (code quality)
- TypeScript strict mode (type safety)

### Project Structure

```
/src
├── App.tsx                    # Main routing and app setup
├── main.tsx                   # React 18 entry point
├── index.css                  # Global styles and design system
│
├── components/
│   ├── layout/                # AppLayout, BottomNav, PageTransition
│   ├── ui/                    # shadcn/ui components (40+ components)
│   ├── meals/                 # MealPhoto, TextOnlyEntry, EditMealModal
│   ├── triggers/              # TriggerSelector, FODMAPGuide, TriggerChips
│   ├── insights/              # Charts, HealthScoreGauge, RecommendationCards
│   ├── onboarding/            # OnboardingModal (5-step flow)
│   └── shared/                # EmptyState, LoadingSpinner, ErrorBoundary
│
├── contexts/
│   ├── AuthContext.tsx        # Authentication state and methods
│   └── MealContext.tsx        # Meal CRUD operations and statistics
│
├── hooks/
│   ├── useProfile.ts          # React Query hook for profile data
│   ├── useSubscription.ts     # Subscription status checking
│   ├── useAdmin.ts            # Admin role verification
│   └── useSignedUrl.ts        # Generate signed URLs for photos
│
├── pages/
│   ├── DashboardPage.tsx      # Home hub with streak, metrics, pending ratings
│   ├── AddEntryPage.tsx       # Meal logging (photo/text + AI analysis)
│   ├── HistoryPage.tsx        # All meals with filtering and editing
│   ├── InsightsPage.tsx       # AI-generated bloat analysis
│   ├── ProfilePage.tsx        # User settings and subscription
│   ├── AuthPage.tsx           # Login/signup with Google OAuth
│   ├── PricingPage.tsx        # Subscription plans
│   └── admin/                 # Admin dashboard, user search, error logs
│
├── lib/
│   ├── insightsAnalysis.ts    # Core AI insight generation logic
│   ├── triggerUtils.ts        # Trigger taxonomy, icons, safe alternatives
│   ├── bloatingUtils.ts       # Retry logic, threshold constants
│   ├── haptics.ts             # Vibration feedback
│   ├── quotes.ts              # Motivational messages
│   └── utils.ts               # Tailwind class merging
│
├── types/
│   └── index.ts               # All TypeScript interfaces and constants
│
└── integrations/supabase/
    ├── client.ts              # Supabase client initialization
    └── types.ts               # Auto-generated database types
```

### Environment Configuration

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY
```

### Build Configuration

**Vite Config**
- React plugin with SWC for fast refresh
- Path alias: `@` → `./src`
- No sourcemaps in production build
- Dev server on port 8080

**TypeScript Config**
- Strict mode enabled
- Module resolution: ESNext
- Target: ES2020
- JSX: react-jsx (automatic runtime)

---

## Design System & Visual Language

### Brand Identity

**Brand Personality**: Calming, scientific, supportive, modern, friendly
**Visual Style**: Soft pastels, rounded corners, subtle shadows, gentle animations
**Tone of Voice**: Encouraging but not patronizing, informative but not clinical

### Color Palette

**Light Theme (Primary)**
```css
/* Primary Color - Sage (Calming Green) */
--sage: 160 35% 75%           /* Main brand color */
--sage-light: 160 40% 88%     /* Hover states, backgrounds */
--sage-dark: 160 30% 55%      /* Active states, emphasis */

/* Secondary Accents */
--mint: 165 50% 82%           /* Success, positive feedback */
--lavender: 270 40% 85%       /* Neutral accent */
--peach: 25 80% 85%           /* Warnings, moderate bloating */
--coral: 10 70% 75%           /* Destructive, high bloating (4-5) */
--sky: 200 60% 85%            /* Info, links */

/* Base Colors */
--background: 30 20% 98%      /* Warm off-white */
--foreground: 220 15% 20%     /* Dark charcoal for text */
--card: 0 0% 100%             /* Pure white cards */
--border: 220 15% 90%         /* Soft borders */
--muted: 220 10% 94%          /* Disabled states, subtle backgrounds */

/* Semantic Colors */
--primary: 160 35% 55%        /* Interactive elements (buttons, links) */
--destructive: 10 70% 65%     /* Delete, high bloating */
--radius: 1rem                /* Default border radius */
```

**Dark Theme**
```css
--background: 220 20% 8%      /* Deep navy-black */
--foreground: 220 10% 92%     /* Off-white text */
--card: 220 18% 12%           /* Slightly lighter cards */
--primary: 160 40% 50%        /* Slightly more saturated sage */
--border: 220 15% 20%         /* Subtle borders */
--muted: 220 15% 18%          /* Muted backgrounds */
```

### Typography

**Font Family**: SF Pro Display (Apple's system font)
- Fallback stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Reason: Native look, excellent readability, optimized for mobile

**Type Scale**
```
2xs:  0.625rem (10px) - Micro labels
xs:   0.75rem  (12px) - Small labels, timestamps
sm:   0.875rem (14px) - Body text, secondary content
base: 1rem     (16px) - Primary body text
lg:   1.125rem (18px) - Subheadings, emphasized text
xl:   1.25rem  (20px) - Card titles
2xl:  1.5rem   (24px) - Page headings
3xl:  1.875rem (30px) - Hero text
4xl:  2.25rem  (36px) - Large display text
5xl:  3rem     (48px) - Marketing headlines
```

**Font Weights**
- Regular: 400 (body text)
- Semibold: 500 (emphasized text)
- Bold: 700 (headings, buttons)
- Extrabold: 800 (hero text, strong emphasis)

### Spacing & Layout

**Border Radius**
```
sm:  0.375rem (6px)  - Small chips, badges
md:  0.5rem   (8px)  - Inputs, small buttons
lg:  1rem     (16px) - Cards, modals (DEFAULT)
xl:  1.5rem   (24px) - Large cards
2xl: 2rem     (32px) - Hero sections
3xl: 3rem     (48px) - Buttons, pill shapes
```

**Shadows (Custom)**
```css
.shadow-soft {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.shadow-medium {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.shadow-elevated {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

**Safe Areas** (Mobile notch support)
```css
spacing: {
  "safe-bottom": "env(safe-area-inset-bottom, 1rem)",
  "safe-top": "env(safe-area-inset-top, 0)"
}
```

### Component Patterns

**Cards (Premium Style)**
```css
.premium-card {
  @apply bg-card/80           /* 80% opacity for depth */
         border border-border/30
         rounded-2xl           /* 2rem radius */
         shadow-soft
         hover:shadow-medium
         transition-all duration-300;
}
```

**Glass Effect**
```css
.glass-card {
  @apply bg-card/40           /* 40% opacity */
         backdrop-blur-md     /* Background blur */
         border border-white/10
         rounded-2xl;
}
```

**Buttons**
```tsx
// Primary CTA
className="bg-primary hover:bg-primary/90
           text-white font-semibold
           rounded-3xl px-8 py-4
           shadow-soft hover:shadow-medium
           hover:scale-105 hover:-translate-y-1
           transition-all duration-300"

// Outline
className="border-2 border-primary text-primary
           hover:bg-primary/10
           rounded-3xl px-6 py-3
           transition-all duration-300"

// Ghost
className="text-primary hover:bg-primary/10
           rounded-lg px-4 py-2
           transition-all duration-200"
```

**Inputs**
```tsx
className="w-full px-4 py-3
           rounded-xl
           border border-border
           focus:border-primary focus:ring-2 focus:ring-primary/20
           transition-all duration-200"
```

### Animation Guidelines

**Spring Animations (Framer Motion)**
```tsx
// Default spring config
const spring = {
  type: "spring",
  stiffness: 400,
  damping: 25
}

// Usage
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  transition={spring}
>
```

**Page Transitions**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
```

**Stagger Animations** (Lists)
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

**CSS Animations**
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: forwards;
}
```

### Icon System

**Icon Library**: Lucide React 0.462.0
- Consistent 24x24 base size (w-6 h-6)
- 1.5-2px stroke width
- Current color inheritance

**Common Icons**
- Home: `Leaf` icon (represents natural, holistic health)
- History: `Compass` (exploring patterns)
- Add Entry: `Plus` (center FAB)
- Insights: `BarChart3` (data analysis)
- Profile: `User`
- Settings: `Settings`
- Camera: `Camera`
- Gallery: `Image`
- Text Entry: `Type`

**Trigger Category Icons** (Emoji-based)
```typescript
const TRIGGER_ICONS = {
  'fodmaps-fructans': '🧅',
  'fodmaps-gos': '🫘',
  'fodmaps-lactose': '🥛',
  'fodmaps-fructose': '🍎',
  'fodmaps-polyols': '🍄',
  'gluten': '🌾',
  'dairy': '🧀',
  'cruciferous': '🥦',
  'high-fat': '🥑',
  'carbonated': '🥤',
  'refined-sugar': '🍰',
  'alcohol': '🍷'
}
```

---

## Core Features & User Experience

### 1. Authentication & Onboarding

#### Authentication Methods
- **Email/Password**: Traditional signup with email confirmation
- **Google OAuth**: One-click social login
- **Session Persistence**: Auto-login on return visits

#### Onboarding Flow (5 Steps)

**Step 1: Demographics**
```typescript
interface Step1 {
  ageRange: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+'
  biologicalSex: 'female' | 'male' | 'prefer_not_to_say'
}
```
*Why we ask*: Hormonal factors and age affect digestion

**Step 2: Primary Goal**
```typescript
type PrimaryGoal =
  | 'reduce_bloating'       // Most common
  | 'identify_triggers'
  | 'improve_digestion'
  | 'manage_ibs'
  | 'general_wellness'
```

**Step 3: Bloating Frequency (Baseline)**
```typescript
type BloatingFrequency =
  | 'daily'                 // Every day
  | 'most_days'             // 4-6 days/week
  | 'sometimes'             // 2-3 days/week
  | 'rarely'                // 1 day/week or less
```
*Used for*: Progress tracking, "improvement %" calculations

**Step 4: Medications & Supplements**
```typescript
medications: string[]  // Optional array of medication names
// Examples: "Omeprazole", "Probiotics", "Digestive enzymes"
```
*Why we ask*: Some medications affect bloating (PPIs, antibiotics)

**Step 5: Welcome Message**
- Encouraging message about starting their journey
- Explanation of how the app works
- CTA: "Start Logging Meals"

#### Onboarding UI/UX Details
- **Progress indicator**: 5 dots at top, filled as user advances
- **Validation**: Cannot proceed until required fields filled
- **Skip option**: Only on Step 4 (medications optional)
- **Animation**: Slide transitions between steps
- **Auto-save**: Progress saved to database on each step

### 2. Dashboard (Home Hub)

#### Layout Structure
```
┌─────────────────────────────────┐
│ [Settings Icon]                 │  Header
│                                 │
│ Good [morning/afternoon/evening]│  Time-based greeting
│ [Display Name] 👋              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔥 [X] Day Streak           │ │  Streak Card
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ This Week                   │ │  Weekly Metrics
│ │ [X] Meals Logged            │ │  (only after 5+ meals)
│ │ [X.X] Avg Bloating          │ │
│ │ [Progress Bar]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Next to Rate                │ │  Pending Rating Card
│ │ [Meal Title] [Emoji]        │ │  (if any pending)
│ │ [Photo]                     │ │
│ │ "How are you feeling?"      │ │
│ │ [1] [2] [3] [4] [5]         │ │  Quick rating buttons
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   Log New Meal              │ │  Primary CTA
│ │      [Camera Icon]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Abstract Food Background]      │  Decorative
└─────────────────────────────────┘
[Bottom Navigation]               │  Fixed nav bar
```

#### Streak System
- **Definition**: Consecutive days with at least 1 meal logged
- **Reset**: Breaks if 24+ hours pass without an entry
- **Visual**: 🔥 emoji + number + "Day Streak" label
- **Motivation**: Encourages daily logging for better insights

#### Weekly Metrics
- **Visibility**: Only shown after 5+ completed meal ratings
- **Before 5 meals**: Shows "Building insights..." with progress indicator
- **Metrics**:
  - Total meals logged this week (current calendar week)
  - Average bloating score (mean of all ratings this week)
  - Progress bar (visual representation of weekly goal)

#### Pending Rating Card
- **Logic**: Shows next meal due for rating (oldest pending or most overdue)
- **Quick Rating**: Tap 1-5 buttons to rate directly from dashboard
- **Photo Display**: Meal photo as background (if available)
- **Timing**: Appears 90 minutes after meal entry (if not rated immediately)

#### State Management
```typescript
interface DashboardData {
  currentStreak: number
  weeklyMetrics: {
    mealsLogged: number
    avgBloating: number
    progress: number  // 0-100
  }
  pendingMeal: MealEntry | null
  hasEnoughData: boolean  // 5+ completed ratings
}
```

### 3. Meal Entry (Add Entry Page)

#### Entry Methods

**Option 1: Photo Entry (Primary)**
```
┌─────────────────────────────────┐
│ [X]                             │  Close button
│                                 │
│   Take a Photo of Your Meal     │  Title
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │    [Camera Icon]            │ │  Camera button
│ │    Take Photo               │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │    [Gallery Icon]           │ │  Gallery button
│ │    Choose from Gallery      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Switch to Text Entry]          │  Alternative method
└─────────────────────────────────┘
```

**Option 2: Text Entry (Alternative)**
```
┌─────────────────────────────────┐
│ [X]                             │
│                                 │
│   Describe Your Meal            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ What did you eat?           │ │  Textarea
│ │ [User types here...]        │ │  Placeholder:
│ │                             │ │  "e.g., Chicken salad with
│ │                             │ │   tomatoes and olive oil"
│ └─────────────────────────────┘ │
│                                 │
│ [Analyze Meal] [Button]         │  CTA
└─────────────────────────────────┘
```

#### AI Analysis Flow

**Step 1: Upload & Process**
```typescript
1. User selects photo or types description
2. Show scanning animation (3-5 seconds)
3. Upload photo to Supabase storage (private bucket)
4. Call analyze-food Edge Function with photo URL or text
5. Claude AI API processes:
   - Extracts meal description
   - Generates 3+ creative title options
   - Detects trigger categories (from 12 official list)
   - Assigns meal emoji and category
   - Returns confidence scores
```

**Step 2: Display Results**
```
┌─────────────────────────────────┐
│ [Photo] (if photo entry)        │
│                                 │
│ [Meal Emoji] [Meal Title]       │  AI-generated
│ [Edit Title]                    │  Link to change
│                                 │
│ Description:                    │
│ [AI-generated meal description] │  Editable textarea
│                                 │
│ Detected Triggers:              │
│ [🧅 Fructans] [🥛 Lactose]     │  Chips (removable)
│ [+ Add More]                    │  Manual trigger addition
│                                 │
│ Quick Notes (Optional):         │
│ [😰 Stressed] [🌙 Ate late]    │  Pre-filled chips
│ [⚡ Rushed] [🍽️ Very hungry]   │
│                                 │
│ Custom Note:                    │
│ [Textarea for free text]        │
│                                 │
│ How's your bloating right now?  │
│ [1😊] [2🙂] [3😐] [4😣] [5😫]  │  Optional immediate rating
│ [Skip - Rate Later]             │
│                                 │
│ [Save Meal]                     │  Primary CTA
└─────────────────────────────────┘
```

#### Trigger Detection System

**12 Official Trigger Categories**
```typescript
const TRIGGER_CATEGORIES = [
  // FODMAPs (5 subcategories)
  { id: 'fodmaps-fructans', name: 'FODMAPs - Fructans', emoji: '🧅' },
  { id: 'fodmaps-gos', name: 'FODMAPs - GOS', emoji: '🫘' },
  { id: 'fodmaps-lactose', name: 'FODMAPs - Lactose', emoji: '🥛' },
  { id: 'fodmaps-fructose', name: 'FODMAPs - Fructose', emoji: '🍎' },
  { id: 'fodmaps-polyols', name: 'FODMAPs - Polyols', emoji: '🍄' },

  // Other common triggers (7 categories)
  { id: 'gluten', name: 'Gluten', emoji: '🌾' },
  { id: 'dairy', name: 'Dairy', emoji: '🧀' },
  { id: 'cruciferous', name: 'Cruciferous Vegetables', emoji: '🥦' },
  { id: 'high-fat', name: 'High-Fat Foods', emoji: '🥑' },
  { id: 'carbonated', name: 'Carbonated Drinks', emoji: '🥤' },
  { id: 'refined-sugar', name: 'Refined Sugar', emoji: '🍰' },
  { id: 'alcohol', name: 'Alcohol', emoji: '🍷' }
]
```

**Trigger Data Structure**
```typescript
interface DetectedTrigger {
  category: string       // One of 12 official IDs
  food?: string          // Specific food (e.g., "garlic", "milk")
  confidence: number     // 0-100 (AI confidence score)
}
```

**Trigger Management UX**
- **View Details**: Tap trigger chip → Modal with category info, examples, alternatives
- **Remove Trigger**: Tap X on chip → Removes from entry
- **Add Manual Trigger**:
  - Tap "[+ Add More]" → Opens TriggerSelectorModal
  - Select category from dropdown
  - Optionally specify specific food
  - Add to entry

#### Contextual Notes System

**Pre-filled Note Chips** (Quick Select)
```typescript
const QUICK_NOTES = [
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'ate_late', label: 'Ate late', emoji: '🌙' },
  { id: 'rushed', label: 'Rushed eating', emoji: '⚡' },
  { id: 'very_hungry', label: 'Very hungry', emoji: '🍽️' },
  { id: 'overate', label: 'Overate', emoji: '🤰' },
  { id: 'period', label: 'On period', emoji: '🩸' }
]
```

**Usage in Analysis**: These behavioral markers are analyzed in insights to identify patterns beyond food triggers

### 4. Bloating Rating System

#### Rating Scale Definition
```typescript
const RATING_SCALE = {
  1: { label: 'No bloat', emoji: '😊', description: 'No discomfort at all' },
  2: { label: 'Mild', emoji: '🙂', description: 'Slightly noticeable' },
  3: { label: 'Some', emoji: '😐', description: 'Moderate discomfort' },
  4: { label: 'Bad', emoji: '😣', description: 'Significant bloating' },
  5: { label: 'Awful', emoji: '😫', description: 'Severe discomfort' }
}
```

#### Severity Thresholds
```typescript
const HIGH_BLOATING_THRESHOLD = 4    // Ratings 4-5 = high bloating
const MODERATE_BLOATING_THRESHOLD = 3 // Rating 3 = moderate
const LOW_BLOATING_THRESHOLD = 2      // Ratings 1-2 = low/none
```

#### Rating Timing

**Immediate Rating** (Optional)
- Offered during meal entry
- Most users skip (not feeling effects yet)

**Delayed Rating** (Default)
```typescript
// 90 minutes after meal entry
rating_due_at = created_at + 90 minutes

// Reminder notification (if enabled)
// Push notification: "How's your bloating after [Meal Title]?"
```

**Rating Status**
```typescript
type RatingStatus =
  | 'pending'      // Not yet rated, reminder not sent
  | 'completed'    // User provided rating
  | 'skipped'      // User explicitly skipped rating
```

#### Rating Interface

**From Dashboard (Quick Rating)**
```tsx
<PendingMealCard>
  <MealTitle>Chicken & Veggie Stir Fry 🍜</MealTitle>
  <Question>How's your bloating?</Question>
  <RatingButtons>
    {[1,2,3,4,5].map(rating => (
      <RatingButton
        rating={rating}
        onClick={() => handleQuickRate(rating)}
      />
    ))}
  </RatingButtons>
</PendingMealCard>
```

**From History (Full Rating Modal)**
```tsx
<RatingModal>
  <MealInfo>
    <Photo />
    <Title />
    <Description />
  </MealInfo>
  <RatingScale>
    {RATING_SCALE.map(({ label, emoji, description }) => (
      <RatingOption>
        <Emoji>{emoji}</Emoji>
        <Label>{label}</Label>
        <Description>{description}</Description>
      </RatingOption>
    ))}
  </RatingScale>
  <Actions>
    <SkipButton />
    <SaveButton />
  </Actions>
</RatingModal>
```

### 5. History & Meal Management

#### List View
```
┌─────────────────────────────────┐
│ History                         │  Page Title
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [X] meals  [X] High bloating│ │  Stats summary
│ │ [X.X] Avg this week         │ │
│ │ Top trigger: [🧅 Fructans]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Filter: [All▾] [This Week]     │  Filter buttons
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Meal Title] [Emoji]        │ │  Meal card
│ │ [Photo]                     │ │  (if available)
│ │ [Triggers chips]            │ │
│ │ [😐3] Today, 2:30 PM        │ │  Rating + timestamp
│ │ [Edit] [Delete]             │ │  Actions
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Next meal...]              │ │  More meals...
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Filtering Options
```typescript
type HistoryFilter =
  | 'all'           // Show all meals
  | 'high_bloating' // Only ratings 4-5
  | 'this_week'     // Current calendar week

// Additional sort
sortBy: 'created_at' // Newest first (default)
```

#### Statistics Panel
```typescript
interface HistoryStats {
  totalMeals: number               // All time meal count
  highBloatingCount: number        // Ratings 4-5
  weeklyAverage: number            // Last 7 days avg rating
  topTrigger: {
    category: string
    emoji: string
    count: number
  } | null
}
```

#### Meal Actions

**Edit Meal**
```tsx
<EditMealModal>
  <EditTitle>                    // Change AI-generated title
    <TitleOptions>               // Choose from 3+ AI options
      {titleOptions.map(option => (
        <RadioOption>{option}</RadioOption>
      ))}
    </TitleOptions>
    <CustomTitleInput />         // Or write custom title
  </EditTitle>

  <EditDescription>              // Modify meal description
    <Textarea defaultValue={description} />
  </EditDescription>

  <EditTriggers>                 // Add/remove triggers
    <CurrentTriggers>
      {triggers.map(trigger => (
        <TriggerChip removable />
      ))}
    </CurrentTriggers>
    <AddTriggerButton />
  </EditTriggers>

  <EditNotes>                    // Update contextual notes
    <QuickNoteChips />
    <CustomNoteTextarea />
  </EditNotes>
</EditMealModal>
```

**Delete Meal**
```tsx
<DeleteConfirmationDialog>
  <AlertTitle>Delete this meal?</AlertTitle>
  <AlertDescription>
    This action cannot be undone. This will permanently delete your meal entry and remove it from your insights.
  </AlertDescription>
  <AlertActions>
    <CancelButton />
    <DeleteButton variant="destructive" />
  </AlertActions>
</DeleteConfirmationDialog>
```

#### Empty States

**No Meals Yet**
```tsx
<EmptyState
  icon={<Leaf />}
  title="No meals logged yet"
  description="Start by adding your first meal to begin tracking your bloating triggers"
  action={
    <Button to="/add-entry">Log Your First Meal</Button>
  }
/>
```

**No High Bloating Meals** (when filtered)
```tsx
<EmptyState
  icon={<CheckCircle />}
  title="No high bloating meals"
  description="Great news! None of your recent meals caused severe bloating"
/>
```

### 6. Insights & AI Analysis

#### Minimum Data Requirement
- **Threshold**: 3 completed meal ratings (at least 1 must be rated 3+)
- **Before Threshold**: Show empty state with progress indicator
- **After Threshold**: Generate comprehensive insights

#### Insights Page Structure
```
┌─────────────────────────────────┐
│ Your Insights                   │  Page title
│                                 │
│ ┌─────────────────────────────┐ │
│ │  Health Score                │ │  Gauge component
│ │     [75]                     │ │  0-100 score
│ │  ●●●●●○○○○○                 │ │  Visual gauge
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Summary                     │ │  AI-generated summary
│ │ [2-3 sentence overview]     │ │  (e.g., "Your main triggers
│ │                             │ │   appear to be fructans...")
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Top Triggers                │ │  Bar chart
│ │ Fructans    ████████ 8      │ │
│ │ Lactose     ██████ 6        │ │
│ │ High-fat    ████ 4          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Behavioral Patterns         │ │  Patterns chart
│ │ Eating rushed: 60%          │ │  Context analysis
│ │ Stress factor: 40%          │ │
│ │ Late eating: 30%            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Bloating Heatmap            │ │  Visual heatmap
│ │ [Color-coded meal grid]     │ │  Red = high, Green = low
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Weekly Progress             │ │  Line chart
│ │ [Bloating trend over time]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Foods to Eliminate First    │ │  Recommendation cards
│ │ 1. Garlic & Onions          │ │
│ │    Found in 5 meals (3 high)│ │
│ │ 2. Milk Products            │ │
│ │    Found in 4 meals (2 high)│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Safe Foods                  │ │  Green list
│ │ ✓ Chicken (0 bloating)      │ │
│ │ ✓ Rice (avg 1.5)            │ │
│ │ ✓ Carrots (avg 2.0)         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Action Plan                 │ │  2-week plan
│ │ Week 1:                     │ │
│ │ • Eliminate garlic & onions │ │
│ │ • Reduce dairy              │ │
│ │ Week 2:                     │ │
│ │ • Try lactose-free dairy    │ │
│ │ • Monitor cruciferous vegs  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [FODMAP Guide]                  │  Link to education
└─────────────────────────────────┘
```

#### Insight Generation Algorithm

**Step 1: Data Collection**
```typescript
function generateInsights(entries: MealEntry[]) {
  // Filter to completed entries only
  const completedEntries = entries.filter(
    e => e.rating_status === 'completed' && e.bloating_rating !== null
  )

  // Separate by severity
  const highBloatingEntries = completedEntries.filter(
    e => e.bloating_rating! >= HIGH_BLOATING_THRESHOLD
  )
  const lowBloatingEntries = completedEntries.filter(
    e => e.bloating_rating! <= LOW_BLOATING_THRESHOLD
  )
}
```

**Step 2: Trigger Analysis**
```typescript
// Count trigger frequency across high-bloating meals
const triggerFrequency = {}

highBloatingEntries.forEach(entry => {
  entry.detected_triggers?.forEach(trigger => {
    const key = trigger.category
    if (!triggerFrequency[key]) {
      triggerFrequency[key] = {
        count: 0,
        totalSeverity: 0,
        avgSeverity: 0
      }
    }
    triggerFrequency[key].count++
    triggerFrequency[key].totalSeverity += entry.bloating_rating!
  })
})

// Calculate average severity and rank
const triggerRankings = Object.entries(triggerFrequency)
  .map(([category, data]) => ({
    category,
    count: data.count,
    avgSeverity: data.totalSeverity / data.count,
    score: data.count * (data.totalSeverity / data.count) // Frequency × Severity
  }))
  .sort((a, b) => b.score - a.score)
```

**Step 3: Behavioral Pattern Analysis**
```typescript
// Analyze contextual notes
const patterns = {
  stress: countPattern(entries, 'stressed'),
  timing: countPattern(entries, 'ate_late'),
  rush: countPattern(entries, 'rushed'),
  hunger: countPattern(entries, 'very_hungry'),
  overeating: countPattern(entries, 'overate'),
  period: countPattern(entries, 'period')
}

// Calculate correlation with high bloating
const behavioralInsights = Object.entries(patterns).map(([pattern, data]) => ({
  pattern,
  frequency: data.totalCount,
  highBloatingCorrelation: data.highBloatingCount / data.totalCount,
  significance: data.highBloatingCount >= 2 ? 'significant' : 'inconclusive'
}))
```

**Step 4: Progress Metrics**
```typescript
// Compare baseline vs. recent (last 7 days)
const recentEntries = entries.filter(e =>
  isWithinDays(e.created_at, 7)
)

const baseline = {
  avgBloating: calculateAverage(entries.slice(0, 5)), // First 5 meals
  period: 'First week'
}

const recent = {
  avgBloating: calculateAverage(recentEntries),
  period: 'Last 7 days'
}

const improvement = {
  absolute: baseline.avgBloating - recent.avgBloating,
  percentage: ((baseline.avgBloating - recent.avgBloating) / baseline.avgBloating) * 100
}
```

**Step 5: Recommendations Generation**
```typescript
interface Recommendation {
  food: string
  category: string
  reason: string           // Why eliminate
  foundInMeals: number
  highBloatingMeals: number
  avgSeverity: number
  safeAlternatives: string[]
}

// Generate elimination recommendations
const recommendations = triggerRankings.slice(0, 3).map(trigger => ({
  food: getMostCommonFood(trigger.category, highBloatingEntries),
  category: trigger.category,
  reason: `Found in ${trigger.count} high-bloating meals`,
  foundInMeals: trigger.count,
  highBloatingMeals: trigger.count,
  avgSeverity: trigger.avgSeverity,
  safeAlternatives: getSafeAlternatives(trigger.category)
}))
```

**Step 6: Action Plan Creation**
```typescript
interface ActionPlan {
  week1: string[]      // Immediate eliminations
  week2: string[]      // Secondary eliminations
  behavioral: string[] // Lifestyle changes
}

const actionPlan = {
  week1: [
    `Eliminate ${recommendations[0].food}`,
    `Reduce ${recommendations[1].food}`
  ],
  week2: [
    `Try lactose-free alternatives`,
    `Monitor ${recommendations[2].category}`
  ],
  behavioral: [
    behavioralInsights.stress > 0.5 ? 'Practice mindful eating' : null,
    behavioralInsights.rush > 0.5 ? 'Slow down while eating' : null,
    behavioralInsights.timing > 0.5 ? 'Eat dinner earlier' : null
  ].filter(Boolean)
}
```

**Step 7: Confidence Scoring**
```typescript
const confidence = {
  score: calculateConfidenceScore(entries.length),
  note: getConfidenceNote(entries.length),
  nextMilestone: getNextMilestone(entries.length)
}

function calculateConfidenceScore(entryCount: number): number {
  if (entryCount < 5) return 50
  if (entryCount < 10) return 70
  if (entryCount < 20) return 85
  return 95
}

function getNextMilestone(entryCount: number): string {
  if (entryCount < 10) return '10 meals for more accurate insights'
  if (entryCount < 20) return '20 meals to identify subtle patterns'
  return '30 meals for maximum confidence'
}
```

#### FODMAP Education Module

**When to Show**: If 2+ FODMAP triggers detected

**Content Structure**
```markdown
# Understanding FODMAPs

FODMAPs are types of carbohydrates that can cause digestive issues:

- **F**ermentable
- **O**ligosaccharides (Fructans, GOS)
- **D**isaccharides (Lactose)
- **M**onosaccharides (Fructose)
- **A**nd
- **P**olyols (Sugar alcohols)

## Your FODMAP Triggers

### Fructans (Found in 5 meals)
- Common sources: Garlic, onions, wheat
- Safe alternatives: Garlic-infused oil, green onion tops, gluten-free grains

### Lactose (Found in 3 meals)
- Common sources: Milk, soft cheese, yogurt
- Safe alternatives: Lactose-free milk, hard cheeses, lactose-free yogurt

## Next Steps

1. **Elimination Phase** (2-4 weeks): Remove all identified FODMAPs
2. **Reintroduction Phase**: Slowly test one FODMAP at a time
3. **Maintenance**: Build your personalized diet

[Learn more about FODMAPs →]
```

---

## Database Schema & Data Models

### Core Tables

#### `profiles` Table
```sql
CREATE TABLE profiles (
  -- Identity
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  age_range TEXT CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  biological_sex TEXT CHECK (biological_sex IN ('female', 'male', 'prefer_not_to_say')),
  primary_goal TEXT CHECK (primary_goal IN ('reduce_bloating', 'identify_triggers', 'improve_digestion', 'manage_ibs', 'general_wellness')),
  bloating_frequency TEXT CHECK (bloating_frequency IN ('daily', 'most_days', 'sometimes', 'rarely')),
  medications TEXT[],

  -- Subscription
  subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'annual')),
  subscription_ends_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,

  -- Notifications
  push_subscription JSONB
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Row-level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### `meal_entries` Table
```sql
CREATE TABLE meal_entries (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Entry Content
  meal_description TEXT NOT NULL,
  meal_title TEXT,           -- AI-generated default title
  custom_title TEXT,          -- User override
  title_options JSONB,        -- Array of AI-generated options
  meal_emoji TEXT,
  meal_category TEXT,
  notes TEXT,
  photo_url TEXT,             -- Storage path (private bucket)

  -- AI Analysis
  detected_triggers JSONB,    -- Array of {category, food?, confidence}

  -- Bloating Rating
  bloating_rating INTEGER CHECK (bloating_rating BETWEEN 1 AND 5),
  rating_status TEXT DEFAULT 'pending' CHECK (rating_status IN ('pending', 'completed', 'skipped')),
  rating_due_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 minutes'),
  notification_sent BOOLEAN DEFAULT FALSE,

  -- Context
  portion_size TEXT CHECK (portion_size IN ('small', 'normal', 'large')),
  eating_speed TEXT CHECK (eating_speed IN ('slow', 'normal', 'fast')),
  social_setting TEXT CHECK (social_setting IN ('solo', 'with_others')),

  -- Metadata
  entry_method TEXT DEFAULT 'photo' CHECK (entry_method IN ('photo', 'text'))
);

-- Indexes
CREATE INDEX idx_meal_entries_user_id ON meal_entries(user_id);
CREATE INDEX idx_meal_entries_created_at ON meal_entries(created_at DESC);
CREATE INDEX idx_meal_entries_rating_status ON meal_entries(rating_status);
CREATE INDEX idx_meal_entries_bloating_rating ON meal_entries(bloating_rating);
CREATE INDEX idx_meal_entries_rating_due_at ON meal_entries(rating_due_at) WHERE rating_status = 'pending';

-- Row-level security
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON meal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meal_entries FOR DELETE
  USING (auth.uid() = user_id);
```

#### `error_logs` Table
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);

-- No RLS (admin only via service role)
```

#### `monthly_costs` Table
```sql
CREATE TABLE monthly_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT UNIQUE NOT NULL,  -- Format: 'YYYY-MM'
  ai_api_cost NUMERIC(10, 2),
  supabase_cost NUMERIC(10, 2),
  stripe_fees NUMERIC(10, 2),
  other_costs NUMERIC(10, 2),
  total_cost NUMERIC(10, 2) GENERATED ALWAYS AS (
    COALESCE(ai_api_cost, 0) +
    COALESCE(supabase_cost, 0) +
    COALESCE(stripe_fees, 0) +
    COALESCE(other_costs, 0)
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_monthly_costs_month ON monthly_costs(month DESC);

-- No RLS (admin only via service role)
```

### Storage Buckets

#### `meal-photos` (Private)
```typescript
Bucket Configuration:
- Name: meal-photos
- Public: false
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
- Path structure: {user_id}/{meal_id}/{timestamp}.{ext}

Storage Policies:
- Users can upload: auth.uid() = bucket_id
- Users can read own: auth.uid() = bucket_id
- Users can delete own: auth.uid() = bucket_id
```

### TypeScript Types (Auto-Generated)

```typescript
// From Supabase CLI: supabase gen types typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          created_at: string
          updated_at: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          age_range: string | null
          biological_sex: string | null
          primary_goal: string | null
          bloating_frequency: string | null
          medications: string[] | null
          avatar_url: string | null
          subscription_status: string | null
          subscription_plan: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          stripe_customer_id: string | null
          push_subscription: Json | null
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          // ... (same as Row, with optional fields)
        }
        Update: {
          id?: string
          email?: string | null
          // ... (all fields optional)
        }
      }
      meal_entries: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          meal_description: string
          meal_title: string | null
          custom_title: string | null
          title_options: Json | null
          meal_emoji: string | null
          meal_category: string | null
          notes: string | null
          photo_url: string | null
          detected_triggers: Json | null
          bloating_rating: number | null
          rating_status: string
          rating_due_at: string | null
          notification_sent: boolean | null
          portion_size: string | null
          eating_speed: string | null
          social_setting: string | null
          entry_method: string
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      // ... other tables
    }
  }
}

// Convenience type aliases
export type MealEntry = Database['public']['Tables']['meal_entries']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
```

### Application-Level Types

```typescript
// /src/types/index.ts

export interface DetectedTrigger {
  category: string       // One of TRIGGER_CATEGORIES
  food?: string          // Specific food item
  confidence: number     // 0-100
}

export interface InsightsData {
  summary: string
  health_score: number   // 0-100
  trigger_rankings: TriggerRanking[]
  behavioral_insights: Record<string, BehavioralInsight>
  progress_metrics: ProgressMetrics
  recommendations: {
    eliminate_first: Recommendation[]
    action_plan: ActionPlan
  }
  safe_foods: SafeFood[]
  fodmap_education: FODMAPEducation | null
  confidence_note: string
  next_milestone: string
}

export interface TriggerRanking {
  category: string
  emoji: string
  displayName: string
  count: number          // How many times found
  avgSeverity: number    // Average bloating rating
  score: number          // count × avgSeverity
}

export interface BehavioralInsight {
  pattern: string        // 'stress', 'timing', 'rush', etc.
  frequency: number      // Total occurrences
  highBloatingCorrelation: number  // % of times caused high bloating
  significance: 'significant' | 'inconclusive'
  recommendation?: string
}

export interface ProgressMetrics {
  baseline: {
    avgBloating: number
    period: string
  }
  recent: {
    avgBloating: number
    period: string
  }
  improvement: {
    absolute: number
    percentage: number
  }
}

export interface Recommendation {
  food: string
  category: string
  emoji: string
  reason: string
  foundInMeals: number
  highBloatingMeals: number
  avgSeverity: number
  safeAlternatives: string[]
}

export interface ActionPlan {
  week1: string[]
  week2: string[]
  behavioral: string[]
}

export interface SafeFood {
  name: string
  category: string
  avgBloating: number
  timesEaten: number
}

export interface FODMAPEducation {
  detectedCategories: string[]
  explanation: string
  eliminationTips: string[]
  reintroductionProcess: string
}

// Constants
export const TRIGGER_CATEGORIES = [
  { id: 'fodmaps-fructans', displayName: 'FODMAPs - Fructans', emoji: '🧅', color: '#FF6B6B' },
  { id: 'fodmaps-gos', displayName: 'FODMAPs - GOS', emoji: '🫘', color: '#FF8E53' },
  { id: 'fodmaps-lactose', displayName: 'FODMAPs - Lactose', emoji: '🥛', color: '#4ECDC4' },
  { id: 'fodmaps-fructose', displayName: 'FODMAPs - Fructose', emoji: '🍎', color: '#FF6B9D' },
  { id: 'fodmaps-polyols', displayName: 'FODMAPs - Polyols', emoji: '🍄', color: '#C7B299' },
  { id: 'gluten', displayName: 'Gluten', emoji: '🌾', color: '#F4A460' },
  { id: 'dairy', displayName: 'Dairy', emoji: '🧀', color: '#FFE66D' },
  { id: 'cruciferous', displayName: 'Cruciferous Vegetables', emoji: '🥦', color: '#95E1D3' },
  { id: 'high-fat', displayName: 'High-Fat Foods', emoji: '🥑', color: '#6BCB77' },
  { id: 'carbonated', displayName: 'Carbonated Drinks', emoji: '🥤', color: '#4D96FF' },
  { id: 'refined-sugar', displayName: 'Refined Sugar', emoji: '🍰', color: '#FF8DC7' },
  { id: 'alcohol', displayName: 'Alcohol', emoji: '🍷', color: '#9D5C63' }
] as const

export const HIGH_BLOATING_THRESHOLD = 4
export const MODERATE_BLOATING_THRESHOLD = 3
export const LOW_BLOATING_THRESHOLD = 2
export const MIN_MEALS_FOR_INSIGHTS = 3
export const MIN_MEALS_FOR_HIGH_CONFIDENCE = 10

export type TriggerCategoryId = typeof TRIGGER_CATEGORIES[number]['id']
export type RatingStatus = 'pending' | 'completed' | 'skipped'
export type EntryMethod = 'photo' | 'text'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'
```

---

## Component Architecture

### Layout Components

#### `AppLayout` (`/src/components/layout/AppLayout.tsx`)
```tsx
/**
 * Main layout wrapper for all authenticated pages
 *
 * Features:
 * - Max-width container (32rem / lg breakpoint)
 * - Centered horizontally
 * - Bottom padding for BottomNav
 * - Safe area support
 */

interface AppLayoutProps {
  children: React.ReactNode
  showNav?: boolean  // Default: true
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-safe-bottom">
      <main className="max-w-lg mx-auto px-4 pb-24">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
```

#### `BottomNav` (`/src/components/layout/BottomNav.tsx`)
```tsx
/**
 * Fixed bottom navigation bar with spring animations
 *
 * Features:
 * - 5 nav items (4 regular + 1 center FAB)
 * - Active state highlighting
 * - Spring animations on tap
 * - Glass effect background
 * - Safe area bottom padding
 */

const NAV_ITEMS = [
  { to: '/dashboard', icon: Leaf, label: 'Home' },
  { to: '/history', icon: Compass, label: 'History' },
  { to: '/add-entry', icon: Plus, label: 'Log', isFAB: true },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/profile', icon: User, label: 'Profile' }
]

export function BottomNav() {
  const location = useLocation()

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-card/80 backdrop-blur-md
                 border-t border-border/30
                 pb-safe-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around px-4 py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, isFAB }) => {
          const isActive = location.pathname === to

          if (isFAB) {
            return (
              <Link key={to} to={to}>
                <motion.div
                  className="flex flex-col items-center -mt-8"
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="bg-primary text-white rounded-full p-4 shadow-elevated">
                    <Icon className="w-6 h-6" />
                  </div>
                </motion.div>
              </Link>
            )
          }

          return (
            <Link key={to} to={to}>
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-2xs font-medium">{label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
```

#### `PageTransition` (`/src/components/layout/PageTransition.tsx`)
```tsx
/**
 * Animated wrapper for page content
 *
 * Features:
 * - Fade + slide up entrance
 * - Stagger children animation
 * - Exit animation on route change
 */

interface PageTransitionProps {
  children: React.ReactNode
  staggerChildren?: boolean
  delay?: number
}

export function PageTransition({
  children,
  staggerChildren = false,
  delay = 0
}: PageTransitionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerChildren ? 0.1 : 0
      }
    },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

// Child component (use with staggerChildren)
export function StaggerItem({ children }: { children: React.ReactNode }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  )
}
```

### Shared Components

#### `EmptyState` (`/src/components/shared/EmptyState.tsx`)
```tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </motion.div>
  )
}
```

#### `ErrorBoundary` (`/src/components/shared/ErrorBoundary.tsx`)
```tsx
/**
 * React error boundary with fallback UI
 * Automatically logs errors to error_logs table
 */

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Supabase
    logError({
      error_type: 'react_error',
      error_message: error.message,
      metadata: {
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened.
                The error has been logged and we'll look into it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Feature Components

#### Meal Components

**`MealPhoto`** - Displays meal photo with signed URL
```tsx
interface MealPhotoProps {
  photoUrl: string | null
  alt: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MealPhoto({ photoUrl, alt, className, size = 'md' }: MealPhotoProps) {
  const { signedUrl, isLoading } = useSignedUrl(photoUrl)

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-full w-full'
  }

  if (isLoading) {
    return <Skeleton className={cn(sizeClasses[size], className)} />
  }

  if (!signedUrl) {
    return (
      <div className={cn(
        'bg-muted flex items-center justify-center rounded-lg',
        sizeClasses[size],
        className
      )}>
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={cn(
        'object-cover rounded-lg',
        sizeClasses[size],
        className
      )}
    />
  )
}
```

**`TextOnlyEntry`** - Text-based meal entry form
```tsx
interface TextOnlyEntryProps {
  onAnalyze: (description: string) => void
  isAnalyzing: boolean
}

export function TextOnlyEntry({ onAnalyze, isAnalyzing }: TextOnlyEntryProps) {
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim()) {
      onAnalyze(description)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Chicken salad with tomatoes, cucumbers, and olive oil dressing"
        rows={5}
        className="resize-none"
      />
      <Button
        type="submit"
        disabled={!description.trim() || isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Meal'
        )}
      </Button>
    </form>
  )
}
```

#### Trigger Components

**`DetectedTriggersList`** - Display detected triggers
```tsx
interface DetectedTriggersListProps {
  triggers: DetectedTrigger[]
  onRemove?: (trigger: DetectedTrigger) => void
  onInfo?: (trigger: DetectedTrigger) => void
  editable?: boolean
}

export function DetectedTriggersList({
  triggers,
  onRemove,
  onInfo,
  editable = false
}: DetectedTriggersListProps) {
  if (!triggers || triggers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No triggers detected
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {triggers.map((trigger, index) => {
        const category = TRIGGER_CATEGORIES.find(c => c.id === trigger.category)
        if (!category) return null

        return (
          <Badge
            key={`${trigger.category}-${index}`}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => onInfo?.(trigger)}
          >
            <span className="mr-1">{category.emoji}</span>
            {trigger.food || category.displayName}
            {editable && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(trigger)
                }}
                className="ml-2 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        )
      })}
    </div>
  )
}
```

**`TriggerSelectorModal`** - Add manual triggers
```tsx
interface TriggerSelectorModalProps {
  open: boolean
  onClose: () => void
  onAdd: (trigger: DetectedTrigger) => void
  existingTriggers: DetectedTrigger[]
}

export function TriggerSelectorModal({
  open,
  onClose,
  onAdd,
  existingTriggers
}: TriggerSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [specificFood, setSpecificFood] = useState('')

  const handleAdd = () => {
    if (!selectedCategory) return

    onAdd({
      category: selectedCategory,
      food: specificFood || undefined,
      confidence: 100  // Manual additions are 100% confidence
    })

    setSelectedCategory('')
    setSpecificFood('')
    onClose()
  }

  // Filter out already-added categories
  const availableCategories = TRIGGER_CATEGORIES.filter(
    cat => !existingTriggers.some(t => t.category === cat.id)
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Trigger</DialogTitle>
          <DialogDescription>
            Select a trigger category and optionally specify a particular food
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Trigger Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji} {category.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div>
              <Label>Specific Food (Optional)</Label>
              <Input
                value={specificFood}
                onChange={(e) => setSpecificFood(e.target.value)}
                placeholder="e.g., garlic, milk, broccoli"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedCategory}>
            Add Trigger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### Insights Components

**`HealthScoreGauge`** - Radial progress gauge
```tsx
interface HealthScoreGaugeProps {
  score: number  // 0-100
}

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const circumference = 2 * Math.PI * 45  // radius = 45
  const offset = circumference - (score / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--mint))'
    if (score >= 60) return 'hsl(var(--sage))'
    if (score >= 40) return 'hsl(var(--peach))'
    return 'hsl(var(--coral))'
  }

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          stroke={getColor(score)}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">Health Score</span>
      </div>
    </div>
  )
}
```

**`TriggerFrequencyChart`** - Bar chart of triggers
```tsx
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface TriggerFrequencyChartProps {
  data: TriggerRanking[]
}

export function TriggerFrequencyChart({ data }: TriggerFrequencyChartProps) {
  const chartData = data.map(trigger => ({
    name: trigger.emoji,
    fullName: trigger.displayName,
    count: trigger.count,
    avgSeverity: trigger.avgSeverity
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 20 }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const data = payload[0].payload
            return (
              <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                <p className="font-semibold">{data.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  Found in {data.count} meals
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg severity: {data.avgSeverity.toFixed(1)}
                </p>
              </div>
            )
          }}
        />
        <Bar
          dataKey="count"
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## User Flows & Interaction Patterns

### Complete User Journey

#### 1. First-Time User (Day 1)

```
[Opens app for first time]
  ↓
[Lands on AuthPage]
  ↓
[Chooses signup method]
  ├─ Email/Password → Enter credentials → Email confirmation
  └─ Google OAuth → One-click signup
  ↓
[OnboardingModal appears]
  ↓
[Completes 5-step questionnaire]
  ├─ Step 1: Age + Sex
  ├─ Step 2: Primary goal
  ├─ Step 3: Bloating frequency (baseline)
  ├─ Step 4: Medications (optional)
  └─ Step 5: Welcome message
  ↓
[Onboarding complete → Saved to database]
  ↓
[Redirects to /pricing]
  ↓
[Views subscription plans]
  ├─ Monthly: $9.99/month
  └─ Annual: $29.99/year (75% savings)
  ↓
[Clicks "Start Free Trial" or "Subscribe"]
  ↓
[Stripe Checkout opens]
  ↓
[Enters payment info]
  ↓
[Subscription activated]
  ↓
[Redirects to /dashboard]
  ↓
[Sees empty dashboard with CTA: "Log Your First Meal"]
  ↓
[Taps "Log New Meal" button]
  ↓
[Camera interface appears]
  ↓
[Takes photo of meal]
  ↓
[AI analyzes photo (3-5 seconds)]
  ├─ Generates meal description
  ├─ Creates 3+ title options
  ├─ Detects triggers
  └─ Assigns emoji + category
  ↓
[Reviews AI results]
  ├─ Can edit description
  ├─ Can add/remove triggers
  ├─ Can add contextual notes
  └─ Can rate bloating now (or skip)
  ↓
[Taps "Save Meal"]
  ↓
[Success toast appears]
  ↓
[Redirects back to /dashboard]
  ↓
[Dashboard now shows:]
  ├─ 1-day streak
  ├─ "Building insights..." message
  └─ Pending rating card (after 90 min)
  ↓
[90 minutes later...]
  ↓
[Pending rating appears on dashboard]
  ↓
[User taps rating button (1-5)]
  ↓
[Rating saved → Entry marked "completed"]
  ↓
[Success feedback]
```

#### 2. Returning User (Week 1-2)

```
[Opens app]
  ↓
[Auto-logged in → /dashboard]
  ↓
[Sees:]
  ├─ Current streak (e.g., 5 days)
  ├─ Pending rating (if any)
  └─ "Building insights..." (until 5 meals)
  ↓
[Logs meals regularly]
  ├─ Breakfast, lunch, dinner
  ├─ Takes photos or describes meals
  └─ Rates bloating after 90 minutes
  ↓
[After 5 completed ratings...]
  ↓
[Dashboard updates:]
  ├─ Weekly metrics card appears
  │  ├─ X meals logged this week
  │  ├─ X.X average bloating
  │  └─ Progress bar
  └─ "Building insights..." disappears
  ↓
[User navigates to /insights]
  ↓
[First insights generated!]
  ├─ Health score: 65
  ├─ Top 2-3 triggers identified
  ├─ Behavioral patterns detected
  ├─ Safe foods listed
  └─ Action plan provided
  ↓
[User reads recommendations]
  ├─ "Eliminate garlic and onions for 2 weeks"
  ├─ "Try lactose-free dairy"
  └─ "Slow down while eating"
  ↓
[Starts elimination phase]
  ↓
[Continues logging meals]
  ↓
[Notices lower bloating scores]
  ↓
[Week 2 insights show improvement:]
  ├─ Health score increased to 78
  ├─ Average bloating down 1.2 points
  └─ "15% improvement from baseline"
```

#### 3. Power User (Month 1+)

```
[Daily routine:]
  ↓
[Open app → Check streak]
  ↓
[Rate pending meals from yesterday]
  ↓
[Log new meals throughout day]
  ↓
[Check insights weekly]
  ├─ Track progress over time
  ├─ Identify new patterns
  └─ Adjust elimination diet
  ↓
[Uses /history frequently]
  ├─ Filter by high bloating
  ├─ Review successful meals
  └─ Edit meal details as needed
  ↓
[Shares progress with doctor]
  ├─ Export feature (future)
  └─ Show insights charts
  ↓
[Achieves goals:]
  ├─ Identified main triggers
  ├─ Reduced bloating by 40%
  └─ Built personalized diet
```

### Key Interaction Patterns

#### Progressive Disclosure
```
Simple → More Detail → Full Control

Example: Meal Entry
1. Simple: "Take a photo"
2. More detail: AI analysis results
3. Full control: Edit description, add triggers, add notes
```

#### Optimistic Updates
```
User Action → Immediate UI Update → Background Save → Error Handling

Example: Rating a meal
1. User taps rating button
2. UI immediately shows rating
3. Database update in background
4. If error: Revert + show toast + retry option
```

#### Empty State → Data State → Insights
```
0 meals: "Log your first meal"
1-4 meals: "Building insights... (X/5 meals)"
5+ meals: Full insights with charts and recommendations
```

#### Contextual Help
```
User encounters new concept → Info icon appears
User taps info icon → Modal explains concept
User closes modal → Returns to previous state

Example: FODMAP trigger
1. User sees "Fructans" trigger
2. Taps on trigger chip
3. Modal explains: What are fructans? Common sources? Alternatives?
4. User closes modal → Back to meal entry
```

---

## AI Integration & Analysis

### Claude API Integration

#### Supabase Edge Function: `analyze-food`

```typescript
// supabase/functions/analyze-food/index.ts

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')
})

Deno.serve(async (req) => {
  const { image_url, text_description, entry_method } = await req.json()

  let content: any[]

  if (entry_method === 'photo' && image_url) {
    // Download image from Supabase storage
    const imageResponse = await fetch(image_url)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    )

    content = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Image
        }
      },
      {
        type: 'text',
        text: FOOD_ANALYSIS_PROMPT
      }
    ]
  } else {
    // Text-only entry
    content = [
      {
        type: 'text',
        text: `${FOOD_ANALYSIS_PROMPT}\n\nMeal description: ${text_description}`
      }
    ]
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    temperature: 0.7,  // Slightly creative for meal titles
    messages: [{
      role: 'user',
      content
    }]
  })

  const responseText = message.content[0].text
  const analysis = parseAnalysisResponse(responseText)

  return new Response(
    JSON.stringify(analysis),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

#### Food Analysis Prompt

```typescript
const FOOD_ANALYSIS_PROMPT = `
You are a food analysis expert specializing in digestive health.
Analyze this meal and provide the following information in JSON format:

{
  "meal_description": "Detailed description of the meal (1-2 sentences)",
  "title_options": [
    "Creative meal title 1",
    "Creative meal title 2",
    "Creative meal title 3"
  ],
  "meal_category": "breakfast|lunch|dinner|snack",
  "meal_emoji": "Single most relevant emoji",
  "detected_triggers": [
    {
      "category": "fodmaps-fructans|fodmaps-gos|fodmaps-lactose|fodmaps-fructose|fodmaps-polyols|gluten|dairy|cruciferous|high-fat|carbonated|refined-sugar|alcohol",
      "food": "Specific food item (optional)",
      "confidence": 0-100
    }
  ]
}

Guidelines:
- Meal titles should be creative and appetizing (e.g., "Mediterranean Chicken Delight" not "Chicken and Vegetables")
- Only include triggers you can identify with confidence >60%
- Trigger categories must be one of the 12 official categories listed
- Be conservative with trigger detection (false negatives better than false positives)
- Consider common FODMAP foods: garlic, onions, wheat, dairy, legumes, certain fruits/vegetables
- High-fat: fried foods, heavy cream, fatty meats
- Cruciferous: broccoli, cauliflower, cabbage, Brussels sprouts

IMPORTANT: Return ONLY valid JSON, no additional text.
`

function parseAnalysisResponse(text: string) {
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Invalid response format')
  }

  const analysis = JSON.parse(jsonMatch[0])

  // Validate trigger categories
  analysis.detected_triggers = analysis.detected_triggers.filter(
    (trigger: any) => VALID_TRIGGER_CATEGORIES.includes(trigger.category)
  )

  return analysis
}
```

### Local Insights Generation

The insights generation happens **client-side** (not via Claude API) using the algorithm in `/src/lib/insightsAnalysis.ts`:

```typescript
/**
 * Generates comprehensive bloat insights from meal entries
 *
 * Algorithm:
 * 1. Filter to completed entries with ratings
 * 2. Calculate trigger rankings (frequency × severity)
 * 3. Analyze behavioral patterns (stress, timing, etc.)
 * 4. Compute progress metrics (baseline vs. recent)
 * 5. Generate safe/unsafe food lists
 * 6. Create elimination recommendations
 * 7. Build action plan (2-week phased approach)
 * 8. Add FODMAP education if applicable
 * 9. Assign confidence scores based on data volume
 */

export function generateComprehensiveInsight(
  entries: MealEntry[]
): InsightsData {
  // Step 1: Filter data
  const completedEntries = entries.filter(
    e => e.rating_status === 'completed' && e.bloating_rating !== null
  )

  if (completedEntries.length < MIN_MEALS_FOR_INSIGHTS) {
    throw new Error('Not enough data')
  }

  const highBloatingEntries = completedEntries.filter(
    e => e.bloating_rating! >= HIGH_BLOATING_THRESHOLD
  )

  const lowBloatingEntries = completedEntries.filter(
    e => e.bloating_rating! <= LOW_BLOATING_THRESHOLD
  )

  // Step 2: Trigger rankings
  const triggerRankings = calculateTriggerRankings(highBloatingEntries)

  // Step 3: Behavioral insights
  const behavioralInsights = analyzeBehavioralPatterns(completedEntries, highBloatingEntries)

  // Step 4: Progress metrics
  const progressMetrics = calculateProgressMetrics(completedEntries)

  // Step 5: Safe foods
  const safeFoods = identifySafeFoods(lowBloatingEntries)

  // Step 6: Recommendations
  const recommendations = generateRecommendations(
    triggerRankings,
    completedEntries
  )

  // Step 7: Action plan
  const actionPlan = createActionPlan(
    recommendations,
    behavioralInsights
  )

  // Step 8: FODMAP education
  const fodmapEducation = shouldShowFodmapEducation(triggerRankings)
    ? generateFodmapEducation(triggerRankings)
    : null

  // Step 9: Confidence
  const confidence = calculateConfidence(completedEntries.length)

  // Step 10: Summary
  const summary = generateSummary(
    triggerRankings,
    progressMetrics,
    behavioralInsights
  )

  // Step 11: Health score
  const health_score = calculateHealthScore(
    completedEntries,
    progressMetrics
  )

  return {
    summary,
    health_score,
    trigger_rankings: triggerRankings,
    behavioral_insights: behavioralInsights,
    progress_metrics: progressMetrics,
    recommendations: {
      eliminate_first: recommendations,
      action_plan: actionPlan
    },
    safe_foods: safeFoods,
    fodmap_education: fodmapEducation,
    confidence_note: confidence.note,
    next_milestone: confidence.nextMilestone
  }
}

// Helper: Calculate trigger rankings
function calculateTriggerRankings(
  highBloatingEntries: MealEntry[]
): TriggerRanking[] {
  const triggerMap = new Map<string, {
    count: number
    totalSeverity: number
    entries: MealEntry[]
  }>()

  highBloatingEntries.forEach(entry => {
    entry.detected_triggers?.forEach(trigger => {
      const existing = triggerMap.get(trigger.category) || {
        count: 0,
        totalSeverity: 0,
        entries: []
      }

      triggerMap.set(trigger.category, {
        count: existing.count + 1,
        totalSeverity: existing.totalSeverity + entry.bloating_rating!,
        entries: [...existing.entries, entry]
      })
    })
  })

  return Array.from(triggerMap.entries())
    .map(([category, data]) => {
      const categoryInfo = TRIGGER_CATEGORIES.find(c => c.id === category)!
      const avgSeverity = data.totalSeverity / data.count

      return {
        category,
        emoji: categoryInfo.emoji,
        displayName: categoryInfo.displayName,
        count: data.count,
        avgSeverity,
        score: data.count * avgSeverity  // Composite score
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)  // Top 10 triggers
}

// Helper: Analyze behavioral patterns
function analyzeBehavioralPatterns(
  allEntries: MealEntry[],
  highBloatingEntries: MealEntry[]
): Record<string, BehavioralInsight> {
  const patterns = ['stressed', 'ate_late', 'rushed', 'very_hungry', 'overate', 'period']
  const insights: Record<string, BehavioralInsight> = {}

  patterns.forEach(pattern => {
    const totalWithPattern = allEntries.filter(e =>
      e.notes?.includes(pattern)
    ).length

    const highBloatingWithPattern = highBloatingEntries.filter(e =>
      e.notes?.includes(pattern)
    ).length

    if (totalWithPattern === 0) return

    const correlation = highBloatingWithPattern / totalWithPattern

    insights[pattern] = {
      pattern,
      frequency: totalWithPattern,
      highBloatingCorrelation: correlation,
      significance: highBloatingWithPattern >= 2 ? 'significant' : 'inconclusive',
      recommendation: correlation > 0.5
        ? getRecommendationForPattern(pattern)
        : undefined
    }
  })

  return insights
}

// Helper: Calculate progress metrics
function calculateProgressMetrics(
  entries: MealEntry[]
): ProgressMetrics {
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const baselineEntries = sortedEntries.slice(0, 5)
  const recentEntries = sortedEntries.filter(e =>
    isWithinDays(e.created_at, 7)
  )

  const baselineAvg = average(baselineEntries.map(e => e.bloating_rating!))
  const recentAvg = average(recentEntries.map(e => e.bloating_rating!))

  const improvement = {
    absolute: baselineAvg - recentAvg,
    percentage: ((baselineAvg - recentAvg) / baselineAvg) * 100
  }

  return {
    baseline: {
      avgBloating: baselineAvg,
      period: 'First 5 meals'
    },
    recent: {
      avgBloating: recentAvg,
      period: 'Last 7 days'
    },
    improvement
  }
}

// Helper: Calculate health score (0-100)
function calculateHealthScore(
  entries: MealEntry[],
  progressMetrics: ProgressMetrics
): number {
  let score = 50  // Base score

  // Factor 1: Recent bloating average (40 points)
  const recentAvg = progressMetrics.recent.avgBloating
  if (recentAvg <= 1.5) score += 40
  else if (recentAvg <= 2.0) score += 30
  else if (recentAvg <= 2.5) score += 20
  else if (recentAvg <= 3.0) score += 10
  // else: no points

  // Factor 2: Improvement trend (30 points)
  const improvement = progressMetrics.improvement.percentage
  if (improvement >= 40) score += 30
  else if (improvement >= 25) score += 20
  else if (improvement >= 10) score += 10
  else if (improvement < 0) score -= 10  // Getting worse

  // Factor 3: Consistency (20 points)
  const last7Days = entries.filter(e => isWithinDays(e.created_at, 7))
  if (last7Days.length >= 14) score += 20  // 2+ meals/day
  else if (last7Days.length >= 7) score += 10  // 1 meal/day

  // Factor 4: Data quality (10 points)
  const completionRate = entries.filter(e => e.rating_status === 'completed').length / entries.length
  score += completionRate * 10

  return Math.round(Math.min(100, Math.max(0, score)))
}
```

---

## Code Conventions & Patterns

### File Organization

```
Component naming: PascalCase
- Components: FeatureComponent.tsx (e.g., MealPhoto.tsx)
- Pages: FeaturePage.tsx (e.g., DashboardPage.tsx)

Utility naming: camelCase
- Utils: featureUtils.ts (e.g., triggerUtils.ts)
- Hooks: useFeature.ts (e.g., useSubscription.ts)

Type naming: PascalCase
- Interfaces: IFeatureName or FeatureProps
- Types: FeatureType

Constant naming: SCREAMING_SNAKE_CASE
- Constants: FEATURE_CONSTANT (e.g., HIGH_BLOATING_THRESHOLD)
```

### Import Order

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react'

// 2. Third-party imports
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

// 3. Local components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Hooks
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

// 5. Utils & types
import { cn } from '@/lib/utils'
import { TRIGGER_CATEGORIES } from '@/types'
import type { MealEntry } from '@/integrations/supabase/types'

// 6. Styles (if any)
import './styles.css'
```

### Component Structure

```typescript
/**
 * Component description
 *
 * Features:
 * - Feature 1
 * - Feature 2
 *
 * @param {Props} props - Component props
 */

interface ComponentProps {
  // Props with JSDoc comments
  /** User ID */
  userId: string
  /** Callback function */
  onComplete?: () => void
  /** Optional class name */
  className?: string
}

export function Component({ userId, onComplete, className }: ComponentProps) {
  // 1. Hooks (order matters)
  const { user } = useAuth()
  const [state, setState] = useState(initialValue)
  const { data, isLoading } = useQuery(...)

  // 2. Derived state
  const computedValue = useMemo(() => {
    return expensiveCalculation(state)
  }, [state])

  // 3. Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    }
  }, [dependencies])

  // 4. Event handlers
  const handleClick = () => {
    // Handler logic
    onComplete?.()
  }

  // 5. Conditional renders
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!data) {
    return <EmptyState />
  }

  // 6. Main render
  return (
    <div className={cn('base-classes', className)}>
      {/* JSX */}
    </div>
  )
}
```

### Error Handling Pattern

```typescript
// Async operations with try-catch
async function handleAction() {
  try {
    setIsLoading(true)

    const result = await someAsyncOperation()

    // Success feedback
    toast.success('Action completed!')
    onSuccess?.(result)

  } catch (error) {
    // Log error
    console.error('Action failed:', error)
    logError({
      error_type: 'action_failed',
      error_message: error.message,
      metadata: { userId, action: 'some_action' }
    })

    // User feedback
    toast.error('Something went wrong. Please try again.')

  } finally {
    setIsLoading(false)
  }
}
```

### Retry Logic Pattern

```typescript
/**
 * Retry async function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // Last attempt - throw error
      if (attempt === maxRetries) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      )

      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Unreachable')
}

// Usage
const data = await retryWithBackoff(
  () => supabase.from('table').select(),
  { maxRetries: 3, baseDelay: 1000 }
)
```

### Custom Hook Pattern

```typescript
/**
 * Custom hook for [feature]
 *
 * @returns {Object} Hook return values
 */
export function useFeature(param: string) {
  const [state, setState] = useState(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchSomeData(param)
        setState(data)

      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [param])

  return {
    state,
    isLoading,
    error,
    refetch: () => fetchData()
  }
}
```

---

## Subscription & Monetization

### Pricing Strategy

**Free Trial**
- 7-day free trial for new users
- Full access to all features
- Credit card required
- Auto-converts to paid after trial

**Monthly Plan**
- $9.99/month
- Billed monthly
- Cancel anytime
- Stripe Price ID: `price_1SihQELn3mHLHbNAg7k2bm2R`

**Annual Plan** (Recommended)
- $29.99/year
- $2.50/month (75% savings vs. monthly)
- Billed annually
- Cancel anytime
- Stripe Price ID: `price_1SihTILn3mHLHbNAl52h18FO`

### Subscription Implementation

#### Stripe Checkout Flow

```typescript
// Client-side: Create checkout session
async function handleSubscribe(planType: 'monthly' | 'annual') {
  try {
    // Call Edge Function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        plan: planType,
        success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/pricing`
      }
    })

    if (error) throw error

    // Redirect to Stripe Checkout
    window.location.href = data.checkout_url

  } catch (error) {
    toast.error('Failed to start checkout')
    console.error(error)
  }
}
```

#### Supabase Edge Function: `create-checkout`

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia'
})

Deno.serve(async (req) => {
  const { plan, success_url, cancel_url } = await req.json()
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')

  // Get user from JWT
  const { data: { user } } = await supabaseClient.auth.getUser(token)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get or create Stripe customer
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { supabase_user_id: user.id }
    })
    customerId = customer.id

    // Save customer ID
    await supabaseClient
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create checkout session
  const priceId = plan === 'monthly'
    ? 'price_1SihQELn3mHLHbNAg7k2bm2R'
    : 'price_1SihTILn3mHLHbNAl52h18FO'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    subscription_data: {
      trial_period_days: 7,  // 7-day free trial
      metadata: { supabase_user_id: user.id }
    },
    success_url,
    cancel_url,
    allow_promotion_codes: true
  })

  return new Response(
    JSON.stringify({ checkout_url: session.url }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

#### Stripe Webhooks

**Webhook Events to Handle**
```typescript
// webhook handler (Stripe dashboard webhook endpoint)

switch (event.type) {
  case 'checkout.session.completed':
    // New subscription created
    await handleCheckoutComplete(event.data.object)
    break

  case 'customer.subscription.updated':
    // Subscription status changed
    await handleSubscriptionUpdate(event.data.object)
    break

  case 'customer.subscription.deleted':
    // Subscription cancelled
    await handleSubscriptionDelete(event.data.object)
    break

  case 'invoice.payment_succeeded':
    // Payment successful (renewal)
    await handlePaymentSuccess(event.data.object)
    break

  case 'invoice.payment_failed':
    // Payment failed
    await handlePaymentFailed(event.data.object)
    break
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const userId = subscription.metadata.supabase_user_id

  await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_plan: subscription.items.data[0].price.id === 'price_1SihTILn3mHLHbNAl52h18FO'
        ? 'annual'
        : 'monthly',
      subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null
    })
    .eq('id', userId)
}
```

#### Subscription Gate (Route Protection)

```typescript
/**
 * Protects routes requiring active subscription
 * Redirects to /pricing if subscription inactive
 */

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { hasAccess, isLoading } = useSubscription(user?.id)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!hasAccess) {
    return <Navigate to="/pricing" replace />
  }

  return <>{children}</>
}

// Hook: useSubscription
export function useSubscription(userId?: string) {
  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return { hasAccess: false }

      // Check if user is admin (always has access)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at, trial_ends_at, email')
        .eq('id', userId)
        .single()

      if (!profile) return { hasAccess: false }

      // Admin override
      const ADMIN_EMAILS = ['admin@bloatai.com']
      if (ADMIN_EMAILS.includes(profile.email)) {
        return { hasAccess: true, isAdmin: true }
      }

      // Check subscription status
      const isActive = profile.subscription_status === 'active'

      // Check if in trial period
      const inTrial = profile.trial_ends_at
        ? new Date(profile.trial_ends_at) > new Date()
        : false

      // Check if subscription not expired
      const notExpired = profile.subscription_ends_at
        ? new Date(profile.subscription_ends_at) > new Date()
        : false

      return {
        hasAccess: isActive && (inTrial || notExpired),
        isAdmin: false
      }
    },
    enabled: !!userId,
    staleTime: 60000,  // Refetch every 60 seconds
    refetchInterval: 60000
  })
}
```

#### Customer Portal (Manage Subscription)

```typescript
// Client-side: Open Stripe customer portal
async function openCustomerPortal() {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        return_url: `${window.location.origin}/profile`
      }
    })

    if (error) throw error

    // Redirect to Stripe portal
    window.location.href = data.portal_url

  } catch (error) {
    toast.error('Failed to open customer portal')
  }
}
```

---

## Additional Implementation Details

### Admin Features

**Admin Dashboard** (`/admin`)
- Total users count
- Paying users count (active subscriptions)
- Total meal entries
- Photos uploaded today
- Recent errors (last 10)
- Monthly cost tracking

**User Search** (`/admin/users`)
- Search by email
- View user profile
- View all user meals
- View subscription status

**Error Logs** (`/admin/errors`)
- Paginated error log viewer
- Filter by error type
- View error metadata
- Track error trends

### Performance Optimizations

**Image Optimization**
- Upload images as JPEG with 80% quality
- Max dimension: 1200px (resize before upload)
- HEIC → JPEG conversion on iOS
- Signed URL caching (60-minute expiry)

**React Query Caching**
- Profile data: 5-minute stale time
- Meal entries: Manual invalidation on mutations
- Subscription status: 60-second refetch interval

**Code Splitting** (Prepared)
```typescript
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))
```

**Lazy Loading**
- Images: `loading="lazy"` attribute
- Components: React.lazy for admin routes
- Insights charts: Only load when scrolled into view

### Accessibility

**Keyboard Navigation**
- All interactive elements focusable
- Tab order follows visual order
- Escape closes modals
- Enter submits forms

**ARIA Labels**
- Buttons: aria-label for icon-only buttons
- Inputs: aria-describedby for error messages
- Modals: aria-modal, aria-labelledby
- Navigation: aria-current for active links

**Color Contrast**
- WCAG AA compliant (4.5:1 for text)
- Alternative to color alone (emojis + text)
- Focus indicators visible

### Testing Strategy

**Unit Tests** (Vitest)
- Utility functions (triggerUtils, bloatingUtils, insightsAnalysis)
- Custom hooks (useSignedUrl, useSubscription)

**Integration Tests** (React Testing Library)
- Component rendering
- User interactions
- Form submissions
- Error states

**E2E Tests** (Planned)
- Full meal logging flow
- Subscription checkout
- Insights generation

---

## Prompt for Claude AI Project

Copy the text below to add to your Claude AI project:

---

# BLOAT AI - PROJECT CONTEXT

This project is a mobile-first health tracking web application called **Bloat AI**. It helps users identify and manage food-related bloating triggers through photo-based meal logging, AI food analysis, and intelligent pattern recognition.

## Quick Facts
- **Tech Stack**: React 18 + TypeScript + Tailwind + Supabase + Stripe
- **AI Integration**: Claude API for food analysis via Supabase Edge Functions
- **Monetization**: $9.99/month or $29.99/year subscription
- **Target Users**: People with IBS, FODMAP sensitivities, chronic bloating

## Core Features
1. **Meal Logging**: Photo or text entry → AI analyzes food → Detects triggers → 1-5 bloating rating
2. **Insights Dashboard**: AI-generated comprehensive analysis after 3+ meals with recommendations
3. **History Management**: View, edit, filter all meals with statistics
4. **Trigger System**: 12 official categories (5 FODMAP + 7 common triggers)
5. **Subscription System**: Stripe-powered with 7-day free trial

## Design System
- **Colors**: Soft pastels (sage primary, mint/lavender/peach accents)
- **Typography**: SF Pro Display, 2xs-5xl scale
- **Animations**: Framer Motion spring animations (stiffness 400, damping 25)
- **Style**: Rounded corners (1-3rem), soft shadows, glass effects

## Key Patterns
- React Context for auth + meals state
- TanStack Query for server state
- Row-level security in Supabase
- Optimistic updates with retry logic (exponential backoff)
- Protected routes with subscription gating
- Trigger validation (12 official categories only)
- Health score algorithm (0-100 based on 4 factors)

## Critical Constants
```typescript
HIGH_BLOATING_THRESHOLD = 4
MODERATE_BLOATING_THRESHOLD = 3
MIN_MEALS_FOR_INSIGHTS = 3
MIN_MEALS_FOR_HIGH_CONFIDENCE = 10
RATING_DELAY = 90 minutes
```

## Database Schema
- **profiles**: User data, onboarding, subscription
- **meal_entries**: Meals with AI analysis, ratings, triggers
- **error_logs**: Application error tracking
- **monthly_costs**: Admin cost tracking

## File Structure
```
/src
  /components (layout, ui, meals, triggers, insights, shared)
  /contexts (AuthContext, MealContext)
  /hooks (useProfile, useSubscription, useSignedUrl)
  /pages (Dashboard, AddEntry, History, Insights, Profile, Auth, Pricing, admin)
  /lib (insightsAnalysis, triggerUtils, bloatingUtils, haptics)
  /types (interfaces, constants)
  /integrations/supabase (client, types)
```

When answering questions, refer to the comprehensive documentation in `BLOAT_AI_PROJECT_DOCUMENTATION.md` for detailed implementation specifics, component patterns, user flows, and design guidelines.

---

## How to Use This Documentation

1. **Upload this file** (`BLOAT_AI_PROJECT_DOCUMENTATION.md`) to your Claude AI project
2. **Upload your logos** to the project files
3. **Add the prompt above** to your project instructions

Now you can ask Claude:
- "How does the trigger detection system work?"
- "What are the Stripe price IDs?"
- "Show me the color palette in hex codes"
- "Explain the insights generation algorithm"
- "What's the database schema for meal_entries?"
- Literally anything about your app!

---

**Last Updated**: 2026-01-09 (Current session)
**Application Name**: Bloat AI (formerly referred to as "gut guardian")
**Version**: Production (Active)
