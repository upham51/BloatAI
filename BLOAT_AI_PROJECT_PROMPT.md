# BLOAT AI - Complete Application Blueprint

## PROJECT IDENTITY

**Application Name:** Bloat AI
**Purpose:** AI-powered food tracking and bloating analysis application that helps users identify digestive triggers through meal logging, photo analysis, and personalized insights.
**Target Users:** Individuals with digestive issues, IBS, FODMAP sensitivity, or anyone wanting to understand their bloating patterns.
**Platform:** Progressive Web App (mobile-optimized)

---

## CORE CONCEPT

Bloat AI is a comprehensive digestive health tracker that combines:
- **AI-powered meal photo analysis** using Google Gemini 2.5 Flash
- **90-minute delayed bloating ratings** (scientifically optimal timing)
- **12 standardized FODMAP/trigger categories** for consistency
- **Pattern detection algorithms** to identify food-bloating correlations
- **Personalized insights dashboard** with visual analytics
- **Educational content** about FODMAPs and digestive health
- **Subscription-based monetization** ($9.99/month or $29.99/year)

---

## TECH STACK

### Frontend
- **Framework:** React 18.3.1 with TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **Routing:** React Router DOM 6.30.1
- **State Management:**
  - TanStack Query 5.83.0 (server state)
  - React Context API (auth, meals)
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 3.4.17
- **Animations:** Framer Motion 12.24.10
- **Icons:** Lucide React 0.462.0
- **Charts:** Recharts 2.15.4
- **Forms:** React Hook Form 7.61.1 + Zod 3.25.76

### Backend
- **BaaS:** Supabase
  - PostgreSQL database
  - Authentication (email/password + Google OAuth)
  - Storage (meal photos)
  - Edge Functions (Deno runtime)
  - Row Level Security (RLS)

### External Services
- **AI:** Lovable AI Gateway → Google Gemini 2.5 Flash
- **Payments:** Stripe (Checkout + Customer Portal)

---

## DATABASE SCHEMA

### profiles
```sql
id                      UUID PRIMARY KEY (references auth.users)
email                   TEXT NOT NULL
display_name            TEXT
avatar_url              TEXT
created_at              TIMESTAMPTZ DEFAULT NOW()
updated_at              TIMESTAMPTZ DEFAULT NOW()
onboarding_completed    BOOLEAN DEFAULT FALSE
age_range               TEXT
biological_sex          TEXT
primary_goal            TEXT
bloating_frequency      TEXT
medications             TEXT[]
onboarding_completed_at TIMESTAMPTZ
push_subscription       JSONB
subscription_status     TEXT DEFAULT 'inactive'
subscription_plan       TEXT
subscription_ends_at    TIMESTAMPTZ
trial_ends_at           TIMESTAMPTZ
stripe_customer_id      TEXT
admin_granted_by        UUID (FK to profiles)
admin_granted_at        TIMESTAMPTZ
```

### meal_entries
```sql
id                  UUID PRIMARY KEY
user_id             UUID NOT NULL (FK to profiles)
created_at          TIMESTAMPTZ DEFAULT NOW()
updated_at          TIMESTAMPTZ DEFAULT NOW()
meal_description    TEXT NOT NULL
photo_url           TEXT (storage path, not public URL)
portion_size        TEXT (small/normal/large)
eating_speed        TEXT (slow/normal/fast)
social_setting      TEXT (solo/with_others)
bloating_rating     INTEGER (1-5, nullable)
rating_status       TEXT (pending/completed/skipped)
rating_due_at       TIMESTAMPTZ (90 minutes after creation)
detected_triggers   JSONB (array of trigger objects)
custom_title        TEXT
meal_emoji          TEXT
meal_title          TEXT
title_options       JSONB (array of 3 AI-generated titles)
notes               TEXT
notification_sent   BOOLEAN DEFAULT FALSE
entry_method        TEXT (photo/text)
```

### user_insights
```sql
id                          UUID PRIMARY KEY
user_id                     UUID NOT NULL (FK to profiles)
generated_at                TIMESTAMPTZ DEFAULT NOW()
insights_data               JSONB (comprehensive analysis object)
entry_count_at_generation   INTEGER
confidence_score            INTEGER (0-100)
```

### root_cause_assessments
```sql
id                    UUID PRIMARY KEY
user_id               UUID NOT NULL (FK to profiles)
completed_at          TIMESTAMPTZ DEFAULT NOW()
aerophagia_score      INTEGER (0-10)
motility_score        INTEGER (0-11)
dysbiosis_score       INTEGER (0-11)
brain_gut_score       INTEGER (0-14)
hormonal_score        INTEGER (0-6)
structural_score      INTEGER (0-10)
lifestyle_score       INTEGER (0-6)
overall_score         INTEGER (0-100)
primary_root_cause    TEXT
secondary_root_cause  TEXT
answers               JSONB
retake_number         INTEGER DEFAULT 0
```

### user_roles
```sql
id          UUID PRIMARY KEY
user_id     UUID NOT NULL (FK to auth.users)
role        TEXT NOT NULL (admin/moderator/user)
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### error_logs
```sql
id              UUID PRIMARY KEY
error_type      TEXT NOT NULL
user_id         UUID (FK to profiles, nullable)
error_message   TEXT
metadata        JSONB
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### admin_actions
```sql
id              UUID PRIMARY KEY
admin_id        UUID NOT NULL (FK to profiles)
target_user_id  UUID NOT NULL (FK to profiles)
action_type     TEXT NOT NULL
action_details  JSONB
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### monthly_costs
```sql
id              UUID PRIMARY KEY
month           TEXT UNIQUE NOT NULL (YYYY-MM format)
ai_api_cost     DECIMAL(10,2)
supabase_cost   DECIMAL(10,2)
stripe_fees     DECIMAL(10,2)
other_costs     DECIMAL(10,2)
total_cost      DECIMAL(10,2)
notes           TEXT
```

### Storage Bucket: meal-photos
- **Privacy:** Private (requires authentication)
- **Structure:** `{user_id}/{timestamp}.{ext}`
- **Access:** Via signed URLs (15-minute expiry)
- **File Limits:** 10MB max, JPEG/PNG/WebP only
- **RLS:** Users can only access their own folders

---

## THE 12 OFFICIAL TRIGGER CATEGORIES

This is the **complete, locked taxonomy**. No other categories exist in the system.

| ID | Display Name | Examples | Color |
|---|---|---|---|
| `fodmaps-fructans` | FODMAPs - Fructans | Wheat, bread, onions, garlic | `#FF6B6B` |
| `fodmaps-gos` | FODMAPs - GOS | Beans, lentils, chickpeas | `#FF8E53` |
| `fodmaps-lactose` | FODMAPs - Lactose | Milk, soft cheese, yogurt | `#FFA07A` |
| `fodmaps-fructose` | FODMAPs - Fructose | Apples, honey, mango | `#FFB347` |
| `fodmaps-polyols` | FODMAPs - Polyols | Sugar-free gum, stone fruits | `#FFCC5C` |
| `gluten` | Gluten | Wheat, barley, rye, beer | `#95E1D3` |
| `dairy` | Dairy | All milk products | `#A8E6CF` |
| `cruciferous` | Cruciferous | Broccoli, cabbage, Brussels sprouts | `#7FB069` |
| `high-fat` | High-Fat/Fried | Fried foods, fatty meats | `#C77DFF` |
| `carbonated` | Carbonated | Soda, sparkling water | `#9D84B7` |
| `refined-sugar` | Refined Sugar | Candy, pastries, white bread | `#E0ACD5` |
| `alcohol` | Alcohol | Beer, wine, spirits | `#F3B0C3` |

**AI Validation Rule:** Any trigger returned by AI that doesn't match these exact IDs is filtered out client-side.

---

## BLOATING RATING SYSTEM

### 5-Point Scale
1. **No bloat** 😊 - Feeling great, no discomfort
2. **Mild** 🙂 - Slight awareness, not bothersome
3. **Some** 😐 - Noticeable, uncomfortable but manageable
4. **Bad** 😣 - Significant discomfort, impacts activity
5. **Awful** 😫 - Severe pain/distension, very distressing

### Rating Timing Logic
- **Immediate Rating:** Optional at meal creation time
- **Delayed Rating:** 90 minutes after meal (scientifically optimal)
- **Rating Status:**
  - `pending` - Rating not yet provided, due in 90 min
  - `completed` - User provided rating
  - `skipped` - User dismissed rating

### Pending Entry Selection Algorithm
```javascript
// Find the most overdue pending rating
1. Filter entries with status='pending'
2. Find entry with earliest rating_due_at
3. If none overdue, get oldest pending within 24 hours
4. If all expired, return null (no pending entry)
```

---

## MEAL LOGGING FLOW

### Method 1: Photo Upload

**Step 1: Capture**
- User takes photo or selects from gallery
- Image compressed and converted to base64
- Sent to `/functions/v1/analyze-food`

**Step 2: AI Analysis** (Google Gemini 2.5 Flash)
AI receives structured prompt to:
1. Identify ALL visible ingredients exhaustively
2. Generate 3 creative meal titles (2-4 words max)
3. Select appropriate meal emoji
4. Write detailed description (2-3 sentences)
5. Detect FODMAP/digestive triggers
6. Return structured JSON

**Example AI Response:**
```json
{
  "meal_emoji": "🍜",
  "meal_title": "Spicy Ramen Bowl",
  "title_options": ["Spicy Ramen Bowl", "Asian Noodle Soup", "Chicken Ramen"],
  "main_dish": "ramen noodles",
  "meal_category": "Lunch",
  "meal_description": "A steaming bowl of ramen with wheat noodles, chicken broth, sliced chicken breast, soft-boiled egg, green onions, and chili oil. Garnished with sesame seeds and nori.",
  "ingredients": [
    {"name": "Ramen noodles", "detail": "wheat-based", "is_trigger": true, "trigger_category": "fodmaps-fructans"},
    {"name": "Green onions", "detail": "allium vegetable", "is_trigger": true, "trigger_category": "fodmaps-fructans"},
    {"name": "Chicken breast", "detail": "lean protein", "is_trigger": false, "trigger_category": null}
  ],
  "triggers": [
    {"category": "fodmaps-fructans", "food": "wheat noodles", "confidence": 95},
    {"category": "fodmaps-fructans", "food": "green onions", "confidence": 90},
    {"category": "high-fat", "food": "chili oil", "confidence": 70}
  ]
}
```

**Step 3: User Confirmation**
- User sees AI-generated title (editable)
- Photo thumbnail displayed
- Detected triggers shown as colored chips
- User can add/remove triggers manually
- Optional: Add notes with quick chips

**Step 4: Optional Immediate Rating**
- If user already feels bloated, rate now
- Otherwise, skip and rate in 90 minutes

**Step 5: Save to Database**
- Photo uploaded to `meal-photos/{user_id}/{timestamp}.jpg`
- Entry saved with `rating_due_at = created_at + 90 minutes`
- `rating_status = 'pending'` if no immediate rating

### Method 2: Text Entry

**Step 1: Describe Meal**
- Text input (10-1000 characters)
- Must contain at least 2 words
- Validation prevents generic phrases

**Step 2: Select Triggers**
- Grid of 12 categories with examples
- Multi-select checkboxes
- Info modal for each category

**Step 3: Add Context**
- Optional notes
- Quick chips (stressed, late, rushed, etc.)

**Step 4: Save**
- Same rating logic as photo method
- No AI analysis (text-only entry)

---

## INSIGHTS ANALYTICS ENGINE

### Minimum Data Requirement
- **3+ rated meals** for basic insights
- **5+ meals** for confident analysis
- **10+ meals** for robust patterns

### Calculated Metrics

#### 1. Health Score (0-100)
```javascript
// Formula: 100 - (avgBloating * 20)
// Examples:
// avgBloating = 1.0 → score = 80 (excellent)
// avgBloating = 3.0 → score = 40 (needs work)
// avgBloating = 5.0 → score = 0 (poor)
```

#### 2. Trigger Frequency Analysis
```javascript
// For each trigger category:
1. Count unique MEALS with trigger (not occurrences)
2. Count meals with high bloating (rating >= 4)
3. Calculate correlation percentage
4. Assign suspicion score:
   - HIGH: 3+ meals with trigger AND 2+ high bloating
   - MEDIUM: 1+ high bloating
   - LOW: no high bloating correlation
5. Sort by count descending
```

#### 3. Bloat Heatmap Calendar
- Color-code each day by average bloating
- Show 30-day view with rating legend
- Highlight patterns (weekends, specific dates)

#### 4. Food Safety Classification
```javascript
// Safe foods: rating <= 2 in 80%+ of occurrences
// Risky foods: rating >= 4 in 50%+ of occurrences
// Neutral: everything else

// Deduplication logic:
1. Normalize names (remove "fresh", "grilled", etc.)
2. Apply transformation map (e.g., "ground beef" → "Beef")
3. Lowercase matching
4. Sum counts for duplicates
```

#### 5. Behavioral Pattern Detection
Search notes for keywords:
- "stress" → stress correlation
- "late" → timing issues
- "rushed" → eating speed
- "hungry" → portion control
- "overate" → portion control

Calculate correlation with high bloating (rating >= 4)

#### 6. Weekly Trends
- Calculate average bloating per day of week
- Identify best/worst days
- Show progress over time

### Insights Data Structure
```typescript
{
  summary: string, // One-sentence overview
  trigger_rankings: [
    {
      category: string,
      severity_score: number,
      frequency: number, // % of meals with this trigger
      confidence: number, // 0-100
      explanation: string,
      example_foods: string[]
    }
  ],
  behavioral_insights: {
    stress: { finding: string, data: string, recommendation: string },
    timing: { ... },
    speed: { ... }
  },
  progress_metrics: {
    baseline_avg: number,
    recent_avg: number,
    improvement_pct: number,
    good_days_count: number,
    best_meal_pattern: string,
    worst_meal_pattern: string
  },
  recommendations: {
    eliminate_first: [
      { trigger: string, reason: string, safe_alternative: string }
    ],
    action_plan: {
      week_1: string,
      week_2: string,
      behavioral_changes: string[]
    }
  },
  fodmap_education: {
    key_category: string,
    simple_explanation: string,
    common_sources: string[],
    low_fodmap_swaps: { "high": "low alternative" }
  },
  confidence_note: string,
  next_milestone: string
}
```

---

## DESIGN SYSTEM

### Color Palette (Tailwind CSS Variables)

**Primary Colors:**
```css
--sage: 120 20% 50% (calming green)
--sage-light: 120 30% 90%
--sage-dark: 120 20% 30%
--mint: 150 40% 70%
--lavender: 260 50% 70%
--lavender-light: 260 60% 90%
--peach: 20 80% 75%
--peach-light: 20 90% 90%
--coral: 15 85% 65%
--sky: 200 60% 70%
--sky-light: 200 70% 95%
```

**Semantic Colors:**
- `primary` - Main brand color (HSL-based)
- `secondary` - Secondary actions
- `accent` - Highlights and CTAs
- `muted` - Subtle backgrounds
- `destructive` - Errors and deletions
- `border` - Dividers and outlines
- `input` - Form field borders
- `ring` - Focus states

### Typography
- **Font Family:** SF Pro Display, system fonts fallback
- **Sizes:** 2xs (0.625rem) through 9xl
- **Line Heights:** Automatic based on size

### Shadows
```css
soft: 0 2px 16px -4px rgba(foreground, 0.08)
medium: 0 4px 24px -4px rgba(foreground, 0.1)
elevated: 0 8px 32px -8px rgba(foreground, 0.12)
```

### Border Radius
- `rounded-lg` - Default cards
- `rounded-xl` - Medium emphasis
- `rounded-2xl` - High emphasis
- `rounded-3xl` - Premium cards (24px)
- `rounded-4xl` - Hero sections (32px)

### Component Patterns

#### Premium Card
```tsx
<div className="premium-card p-6 rounded-3xl shadow-elevated bg-gradient-to-br from-white to-gray-50">
  {/* Content */}
</div>
```

#### Page Transition
```tsx
<PageTransition>
  <StaggerContainer>
    <StaggerItem>{/* Animates in with delay */}</StaggerItem>
    <StaggerItem>{/* Animates in with delay */}</StaggerItem>
  </StaggerContainer>
</PageTransition>
```

#### Abstract Background
```tsx
<AbstractBackground className="min-h-screen">
  <GrainTexture /> {/* Film grain overlay */}
  {/* Content */}
</AbstractBackground>
```

#### Empty State
```tsx
<EmptyState
  IconComponent={Utensils}
  title="No meals yet"
  description="Start tracking your meals to see insights"
  actionLabel="Log first meal"
  onAction={() => navigate('/add')}
/>
```

### Responsive Strategy
- **Mobile-first design** (optimized for 375-428px)
- **Max container width:** 480-520px
- **Bottom tab navigation** for main sections
- **Safe area insets** for iOS notch/home indicator
- **Touch targets:** Minimum 44x44px

---

## AUTHENTICATION & AUTHORIZATION

### Sign Up Flow
1. User provides: email, password, display_name
2. Supabase creates `auth.users` entry
3. Database trigger auto-creates `profiles` entry
4. User redirected to onboarding modal
5. 5-step questionnaire: age, sex, goal, bloating frequency, medications
6. Profile marked as `onboarding_completed = true`
7. Redirect to dashboard

### Sign In Flow
1. Email/password OR Google OAuth
2. Session token stored in localStorage
3. Auth context updates with user data
4. Protected routes accessible

### Auth Context API
```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{error: string | null}>
  signUp: (email: string, password: string, displayName: string) => Promise<{error: string | null}>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{error: string | null}>
}
```

### Route Protection Layers

#### 1. Public Route (Auth Redirect)
```tsx
// If authenticated, redirect to dashboard
// If not, show auth page
<PublicRoute><AuthPage /></PublicRoute>
```

#### 2. Protected Route (Auth Required)
```tsx
// If not authenticated, redirect to auth page
// If authenticated, show content
<ProtectedRoute><DashboardPage /></ProtectedRoute>
```

#### 3. Subscription Gate (Pro Required)
```tsx
// If no active subscription, show upgrade prompt
// Admins bypass this check
<SubscriptionGate><InsightsPage /></SubscriptionGate>
```

#### 4. Admin Route (Admin Role Required)
```tsx
// Check user_roles table for admin role
// If not admin, redirect to dashboard
<AdminRoute><AdminDashboard /></AdminRoute>
```

### Row Level Security (RLS)

**Example Policy:**
```sql
-- Users can only view their own meals
CREATE POLICY "Users can view own entries"
  ON meal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view everything
CREATE POLICY "Admins can view all entries"
  ON meal_entries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
```

**Key RLS Patterns:**
- All tables have RLS enabled
- Default: Users can only access their own data
- Admin role checked via `has_role(user_id, 'admin')` function
- Storage bucket policies enforce folder-level access

---

## API ENDPOINTS (SUPABASE EDGE FUNCTIONS)

### 1. analyze-food
**URL:** `https://{project}.supabase.co/functions/v1/analyze-food`
**Method:** POST
**Auth:** Required (Bearer token)

**Request:**
```json
{
  "imageUrl": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "meal_emoji": "🍔",
  "meal_title": "Loaded Burger",
  "title_options": ["Loaded Burger", "Cheeseburger Stack", "Classic Burger"],
  "main_dish": "hamburger",
  "meal_category": "Lunch",
  "creative_title": "Loaded Burger",
  "meal_description": "...",
  "ingredients": [...],
  "triggers": [...]
}
```

**AI Model:** Google Gemini 2.5 Flash (via Lovable AI Gateway)
**Error Handling:**
- 429: Rate limit exceeded
- 402: AI credits exhausted
- 500: Server error

### 2. create-checkout
**URL:** `/functions/v1/create-checkout`
**Method:** POST
**Auth:** Required

**Request:**
```json
{
  "priceId": "price_1SihQELn3mHLHbNAg7k2bm2R"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

**Price IDs:**
- Monthly: `price_1SihQELn3mHLHbNAg7k2bm2R` ($9.99/month)
- Annual: `price_1SihTILn3mHLHbNAl52h18FO` ($29.99/year)

### 3. customer-portal
**URL:** `/functions/v1/customer-portal`
**Method:** POST
**Auth:** Required

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

### 4. check-subscription
**URL:** `/functions/v1/check-subscription`
**Method:** POST
**Auth:** Required

**Response:**
```json
{
  "subscribed": true,
  "plan": "monthly",
  "subscription_end": "2026-02-09T12:00:00Z"
}
```

### 5. admin-manage-roles
**URL:** `/functions/v1/admin-manage-roles`
**Method:** POST
**Auth:** Required (Admin only)

**Request:**
```json
{
  "action": "grant",
  "userId": "uuid",
  "role": "admin"
}
```

### 6. admin-update-subscription
**URL:** `/functions/v1/admin-update-subscription`
**Method:** POST
**Auth:** Required (Admin only)

**Request:**
```json
{
  "userId": "uuid",
  "status": "active",
  "plan": "monthly",
  "endsAt": "2026-02-09T12:00:00Z"
}
```

---

## KEY ALGORITHMS & BUSINESS LOGIC

### 1. Streak Calculation
```javascript
function calculateStreak(entries) {
  // 1. Extract unique dates (YYYY-MM-DD format)
  const uniqueDates = [...new Set(
    entries.map(e => new Date(e.created_at).toLocaleDateString())
  )].sort().reverse();

  // 2. Check if most recent is today or yesterday
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0; // Streak broken
  }

  // 3. Count consecutive days backwards
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const dayDiff = (new Date(uniqueDates[i-1]) - new Date(uniqueDates[i])) / 86400000;
    if (dayDiff > 1) break; // Gap found
    streak++;
  }

  return streak;
}
```

### 2. Food Name Deduplication
```javascript
// Problem: AI might say "Fresh Broccoli" and "Broccoli Florets"
// Solution: Normalize and deduplicate

const TRANSFORMATIONS = {
  'ground beef': 'Beef',
  'chicken breast': 'Chicken',
  'broccoli florets': 'Broccoli',
  'white rice': 'Rice'
};

function deduplicateFoods(foods) {
  const normalized = {};

  for (const food of foods) {
    // Remove descriptors
    let clean = food.name
      .replace(/^(fresh|raw|cooked|grilled|fried|diced|sliced|chopped) /i, '')
      .trim();

    // Apply transformations
    const key = TRANSFORMATIONS[clean.toLowerCase()] || clean;

    // Merge counts
    if (!normalized[key]) {
      normalized[key] = { name: key, count: 0 };
    }
    normalized[key].count += food.count;
  }

  return Object.values(normalized);
}
```

### 3. Emoji Icon Matching (650+ Foods)
```javascript
const FOOD_ICONS = {
  // Exact matches
  'steak': '🥩',
  'pasta': '🍝',
  'sushi': '🍣',

  // Word-by-word matching
  'chicken breast': '🍗', // matches "chicken"
  'french fries': '🍟', // matches "fries"

  // Category defaults
  'vegetables': '🥗',
  'fruit': '🍎',
  'protein': '🍖'
};

function getFoodEmoji(foodName) {
  const lower = foodName.toLowerCase();

  // 1. Exact match
  if (FOOD_ICONS[lower]) return FOOD_ICONS[lower];

  // 2. Word-by-word match
  for (const word of lower.split(' ')) {
    if (FOOD_ICONS[word]) return FOOD_ICONS[word];
  }

  // 3. Whole-word regex search
  for (const [key, emoji] of Object.entries(FOOD_ICONS)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(lower)) {
      return emoji;
    }
  }

  // 4. Default
  return '🍽️';
}
```

### 4. Retry with Exponential Backoff
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage:
const result = await retryWithBackoff(async () => {
  return await supabase.from('meal_entries').insert(data);
});
```

### 5. Meal Description Validation
```javascript
function validateMealDescription(description) {
  const trimmed = description.trim();

  // Length check
  if (trimmed.length < 10 || trimmed.length > 1000) {
    return { valid: false, error: 'Must be 10-1000 characters' };
  }

  // Word count
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2) {
    return { valid: false, error: 'Please provide more detail (at least 2 words)' };
  }

  // Generic phrase check
  const generic = ['meal', 'food', 'ate', 'lunch', 'dinner'];
  if (words.length <= 3 && words.every(w => generic.includes(w.toLowerCase()))) {
    return { valid: false, error: 'Please describe what you ate' };
  }

  return { valid: true };
}
```

### 6. Safe Food Alternative Mapping
```javascript
const SAFE_ALTERNATIVES = {
  'fodmaps-fructans': [
    'Garlic-infused oil (flavor without FODMAP)',
    'Green part of scallions only',
    'Chives',
    'Asafoetida powder'
  ],
  'fodmaps-lactose': [
    'Lactose-free milk',
    'Hard cheeses (aged cheddar, parmesan)',
    'Almond milk',
    'Oat milk'
  ],
  'fodmaps-gos': [
    'Canned lentils (rinsed)',
    'Firm tofu',
    'Tempeh',
    'Quinoa'
  ],
  'gluten': [
    'Rice',
    'Quinoa',
    'Gluten-free bread',
    'Corn tortillas'
  ],
  'high-fat': [
    'Grilled instead of fried',
    'Lean proteins (chicken breast, white fish)',
    'Steamed vegetables',
    'Baked goods instead of fried'
  ],
  'carbonated': [
    'Still water',
    'Herbal tea',
    'Low-FODMAP fruit juices',
    'Coconut water'
  ]
};
```

---

## USER FLOWS

### New User Journey

**Step 1: Landing → Sign Up**
- Hero section with value proposition
- CTA: "Start tracking free"
- Email/password form OR Google OAuth

**Step 2: Onboarding Modal (5 Steps)**
1. Age range selection
2. Biological sex (for hormonal insights)
3. Primary goal (understand triggers, reduce bloating, etc.)
4. Bloating frequency (daily, weekly, occasionally)
5. Current medications (optional, affects recommendations)

**Step 3: Dashboard**
- Empty state: "Log your first meal to start tracking"
- Prominent "Add Meal" button
- Educational tooltips

**Step 4: First Meal**
- Guided photo upload experience
- AI analysis demonstration
- Trigger explanation
- Rating reminder setup

**Step 5: First Rating**
- 90-minute notification prompt (if enabled)
- Explain why 90 minutes is optimal
- Simple 1-5 scale with emojis

**Step 6: Unlock Insights (After 3+ Rated Meals)**
- Celebration modal: "You've unlocked insights!"
- Show first basic pattern analysis
- Encourage 5+ meals for better accuracy

**Step 7: Subscription Prompt (After 7 Days or 10 Meals)**
- "You've logged X meals - upgrade to see advanced insights"
- Show premium features locked
- CTA: "Upgrade to Pro"

### Meal Logging Journey

**Photo Method:**
1. Tap "Add Meal" button
2. Choose camera or gallery
3. Select/capture photo
4. Upload (show loading with progress)
5. AI analysis (15-30 seconds)
6. Review AI suggestions:
   - Edit title if desired
   - Confirm/modify triggers
   - Add notes
7. Optional: Rate bloating now
8. Save → Success toast → Return to dashboard

**Text Method:**
1. Tap "Add Meal" button → "Log with text"
2. Describe meal (10+ characters)
3. Select triggers from grid
4. Add notes with quick chips
5. Optional: Rate bloating now
6. Save → Success toast → Return to dashboard

### Rating Journey

**From Dashboard:**
- "You have a pending rating" banner
- Shows meal title + photo thumbnail
- Tap → Rating modal appears

**From History:**
- Browse past meals
- Tap meal with pending rating
- Rate directly from detail view

**Rating Modal:**
- Meal title + photo at top
- "How bloated do you feel?" heading
- 5 large buttons with emoji + label
- Optional: Skip this meal
- After rating → Success feedback

### Insights Journey

**First Visit (3-5 Meals):**
- Basic health score gauge
- Top 1-2 trigger suspects
- "Log more meals for better insights"

**Established User (10+ Meals):**
- Complete dashboard with all widgets
- Trigger frequency chart
- Bloat heatmap calendar
- Safe/risky foods list
- Behavioral patterns
- Recommendations with action plan
- FODMAP education section

**Subscription Required:**
- Non-subscribers see blurred previews
- "Upgrade to unlock" overlay
- One-click upgrade to Stripe Checkout

---

## SUBSCRIPTION & MONETIZATION

### Plans

**Free Tier:**
- Unlimited meal logging
- Photo upload with AI analysis
- Bloating ratings
- Basic dashboard
- 3 days of history

**Pro Tier ($9.99/month or $29.99/year):**
- Full insights dashboard
- Unlimited history
- Advanced analytics
- Behavioral pattern detection
- Personalized recommendations
- FODMAP education
- Export data (future)
- Priority support (future)

### Stripe Integration

**Checkout Flow:**
1. User clicks "Upgrade to Pro"
2. Call `/functions/v1/create-checkout` with `priceId`
3. Redirect to Stripe Checkout
4. User completes payment
5. Stripe webhook updates `profiles.subscription_status = 'active'`
6. User redirected back to app
7. Success modal: "Welcome to Pro!"

**Customer Portal:**
1. User clicks "Manage subscription" in settings
2. Call `/functions/v1/customer-portal`
3. Redirect to Stripe Customer Portal
4. User can update payment method, cancel, etc.
5. Changes reflected immediately via webhooks

**Webhook Events:**
- `checkout.session.completed` → Activate subscription
- `customer.subscription.updated` → Update plan/status
- `customer.subscription.deleted` → Deactivate subscription
- `invoice.payment_failed` → Mark as past due

### Admin Override

Admins can grant Pro access without payment:
1. Search for user in admin panel
2. Click "Grant subscription"
3. Select plan (monthly/annual) and end date
4. Logs action to `admin_actions` table
5. User immediately gains Pro access

---

## EDUCATIONAL CONTENT

### Bloating Guide (Interactive)

**Section 1: Types of Bloating**
- **Water Retention** - Salty foods, hormones
- **Gas Buildup** - FODMAPs, fermentation
- **Constipation** - Slow motility, low fiber

Each type has:
- Illustrated infographic
- Common causes
- How to identify
- Relief strategies

**Section 2: The FODMAP Journey**
- Visual timeline of elimination → testing → reintroduction
- Step-by-step guide with checkboxes
- Expected timeline (2-8 weeks)
- When to consult a dietitian

**Section 3: Food Grid Reference**
- Searchable table of 100+ foods
- FODMAP category indicators
- Serving size limits
- Color-coded safety levels

**Section 4: Medical Conditions**
- IBS (types A, C, D, M)
- IBD (Crohn's, UC)
- SIBO
- Celiac disease
- Lactose intolerance
- Each with symptoms and testing info

**Section 5: Immediate Relief Tips**
- Peppermint tea
- Gentle movement/yoga
- Heating pad
- Specific stretches (illustrated)
- When to seek medical help

**Section 6: Long-Term Prevention**
- Eating behaviors (speed, chewing)
- Stress management
- Sleep hygiene
- Meal timing
- Hydration

---

## ADMIN FEATURES

### Admin Dashboard

**User Management:**
- Search users by email/name
- View user profiles
- Check subscription status
- Grant/revoke Pro access
- Change user roles

**Role Management:**
- Grant admin/moderator roles
- View role history
- Remove roles

**Error Log Viewer:**
- Filter by error type, user, date range
- View full error details + metadata
- Download logs

**Analytics:**
- Total users count
- Active subscriptions
- MRR (Monthly Recurring Revenue)
- Meal logging statistics
- AI API usage

**Cost Tracking:**
- Monthly expense breakdown
- AI API costs
- Supabase costs
- Stripe fees
- Compare against revenue

### Admin Actions Logging

Every admin action is logged:
```typescript
{
  admin_id: "uuid",
  target_user_id: "uuid",
  action_type: "grant_subscription" | "revoke_role" | "view_user_data",
  action_details: {
    plan: "monthly",
    reason: "Customer support request",
    previous_value: "inactive",
    new_value: "active"
  },
  created_at: "timestamp"
}
```

---

## PERFORMANCE OPTIMIZATIONS

1. **Image Compression** - Compress photos to 800px max width before upload
2. **Signed URL Caching** - Cache for 15 minutes to reduce auth requests
3. **Optimistic UI Updates** - Update UI immediately, sync in background
4. **TanStack Query Caching** - Cache API responses for 5 minutes
5. **Lazy Loading** - Load meal photos only when visible
6. **Background Processing** - Calculate insights asynchronously
7. **Debounced Search** - 300ms delay on search inputs
8. **Pagination** - Load 20 meals at a time in history

---

## TESTING STRATEGY

### Unit Tests (Vitest)
- Utility functions (validation, calculations)
- Hooks (custom React hooks)
- Type guards

### Component Tests (Testing Library)
- Form validation
- Button interactions
- Modal behavior
- Navigation flows

### Integration Tests
- Auth flow (sign up → onboarding → dashboard)
- Meal logging (photo → AI → save → history)
- Rating flow (pending → rate → update insights)
- Subscription (checkout → activate → unlock features)

### E2E Tests (Future: Playwright)
- Critical user paths
- Payment flows
- Admin operations

---

## DEPLOYMENT

### Environment Variables

**Frontend (.env):**
```
VITE_SUPABASE_PROJECT_ID=anefzgdcqveejrxnsovm
VITE_SUPABASE_URL=https://anefzgdcqveejrxnsovm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon_key]
```

**Backend (Supabase Secrets):**
```
SUPABASE_URL=[project_url]
SUPABASE_ANON_KEY=[anon_key]
LOVABLE_API_KEY=[ai_gateway_key]
STRIPE_SECRET_KEY=[stripe_secret]
STRIPE_WEBHOOK_SECRET=[webhook_secret]
```

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Hosting
- **Frontend:** Vercel/Netlify (Vite static build)
- **Backend:** Supabase (managed platform)
- **Edge Functions:** Supabase (Deno Deploy)
- **Database:** Supabase (managed PostgreSQL)
- **Storage:** Supabase Storage

---

## FUTURE ROADMAP

**Phase 1: Core Features** ✅ (Completed)
- Meal logging (photo + text)
- AI food analysis
- Bloating ratings
- Basic insights
- Subscription system

**Phase 2: Enhanced Analytics** (In Progress)
- Root cause assessment quiz
- Advanced pattern detection
- Export data (CSV, PDF)
- Sharing insights with doctor

**Phase 3: Social & Community**
- Share safe recipes
- Community challenges
- Expert Q&A
- In-app coaching

**Phase 4: Integrations**
- Apple Health / Google Fit
- Wearable devices (sleep, stress tracking)
- Calendar sync
- Medication reminders

**Phase 5: AI Enhancements**
- Voice meal logging
- Meal recommendations
- Recipe generator
- Symptom predictions

---

## CRITICAL FILE REFERENCES

When building this application, these are the most important files:

### Type Definitions
- `/src/types/index.ts` - Central type system, trigger categories, enums

### Business Logic
- `/src/lib/insightsAnalysis.ts` - Core analytics algorithms
- `/src/lib/triggerUtils.ts` - Food emoji mapping (650+ foods)
- `/src/lib/validations.ts` - Form validation schemas

### Context Providers
- `/src/contexts/AuthContext.tsx` - Authentication state
- `/src/contexts/MealContext.tsx` - Meal data management

### Key Components
- `/src/components/meals/AddMealButton.tsx` - Entry point for logging
- `/src/components/meals/PhotoAnalysisFlow.tsx` - AI analysis UI
- `/src/components/insights/InsightsDashboard.tsx` - Analytics display
- `/src/components/layout/BottomNav.tsx` - Main navigation

### Pages
- `/src/pages/Dashboard.tsx` - Home screen
- `/src/pages/AddMeal.tsx` - Meal logging hub
- `/src/pages/Insights.tsx` - Analytics dashboard
- `/src/pages/History.tsx` - Meal history
- `/src/pages/Guide.tsx` - Educational content

### API Functions
- `/supabase/functions/analyze-food/index.ts` - AI image analysis
- `/supabase/functions/create-checkout/index.ts` - Stripe checkout
- `/supabase/functions/check-subscription/index.ts` - Subscription status

### Database
- `/supabase/migrations/` - Schema definitions (chronological)

---

## BRAND VOICE & MESSAGING

**Tone:** Friendly, empowering, science-backed, non-judgmental

**Key Messages:**
- "Take control of your digestive health"
- "Discover your personal triggers"
- "Science-backed food tracking"
- "Your bloating decoder"

**User Reassurances:**
- Data privacy ("Your health data is private and secure")
- No medical claims ("Not a substitute for medical advice")
- Progress takes time ("Patterns emerge with consistency")
- Supportive community ("You're not alone in this journey")

**Emoji Strategy:**
- Use liberally in meal titles and triggers
- Keep consistent (same emoji for same food)
- Friendly, not childish
- Enhance scannability

---

## ACCESSIBILITY

**Color Contrast:** WCAG AA compliant
**Keyboard Navigation:** Full tab support
**Screen Readers:** ARIA labels on all interactive elements
**Focus States:** Visible focus rings
**Error Messages:** Descriptive and helpful
**Touch Targets:** Minimum 44x44px
**Font Sizes:** Minimum 16px body text
**Alternative Text:** All images have meaningful alt text

---

## SECURITY CONSIDERATIONS

1. **Authentication:** JWT tokens with secure httpOnly cookies
2. **Authorization:** Row-level security on all tables
3. **Input Validation:** Client + server-side validation
4. **SQL Injection:** Parameterized queries only
5. **XSS Prevention:** React automatic escaping
6. **CSRF Protection:** Supabase built-in tokens
7. **Rate Limiting:** AI endpoint limited to prevent abuse
8. **Data Encryption:** At rest (Supabase) and in transit (HTTPS)
9. **PII Protection:** Email is the only required PII
10. **GDPR Compliance:** User data deletion on request

---

## QUESTIONS TO ASK ME ABOUT BLOAT AI

You can now ask me anything about the application:

- "How does the AI food analysis work?"
- "Explain the insights algorithm"
- "What's the database schema for meals?"
- "How do I implement the subscription check?"
- "Show me the meal logging flow"
- "What's the color palette?"
- "How are triggers validated?"
- "Explain the rating reminder system"
- "What's the admin dashboard structure?"
- "How do I add a new feature to X page?"

I have complete knowledge of this application's architecture, design, features, and implementation details.

---

**Last Updated:** January 9, 2026
**Application Version:** 1.0
**Codebase:** React + TypeScript + Supabase + Stripe
**AI Model:** Google Gemini 2.5 Flash via Lovable AI Gateway