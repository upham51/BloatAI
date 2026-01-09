import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      console.error('Authentication failed:', userError?.message);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', userData.user.id);

    const { mealText } = await req.json();

    if (!mealText || typeof mealText !== 'string' || mealText.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Meal text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing meal text for FODMAP triggers:', mealText);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: `You are an expert food analyst specializing in digestive health and FODMAP triggers. Analyze this meal description and identify all potential FODMAP and digestive triggers.

Meal: "${mealText}"

Your task:
1. Identify ALL ingredients or food items mentioned in the meal description
2. For each ingredient, determine if it's a potential digestive trigger
3. Categorize each trigger according to the taxonomy below

Return ONLY valid JSON (no markdown, no code blocks):
{
  "triggers": [
    {"category": "fodmaps-fructans", "food": "wheat bread"},
    {"category": "fodmaps-lactose", "food": "milk"},
    {"category": "dairy", "food": "cheese"}
  ]
}

TRIGGER FOOD NAMING RULES:
- ALWAYS use SIMPLE, BASE ingredient names - not overly specific varieties or cuts
- Prefer the common ingredient name that people use in everyday conversation
- Strip unnecessary descriptors like preparation methods, cuts, colors, or varieties
- Examples of CORRECT naming:
  ✓ "broccoli" (NOT "broccoli florets", "steamed broccoli", "fresh broccoli")
  ✓ "onion" (NOT "red onion", "yellow onion", "diced onion")
  ✓ "rice" (NOT "forbidden rice", "jasmine rice", "white rice")
  ✓ "chicken" (NOT "grilled chicken breast", "organic chicken")
  ✓ "cheese" (NOT "aged cheddar cheese", "shredded cheese")
  ✓ "yogurt" (NOT "greek yogurt", "vanilla yogurt")
  ✓ "beef" (NOT "grass-fed ribeye", "wagyu beef")
- Use category when appropriate: "wheat bread" is acceptable, "milk" not "whole milk"
- Avoid partial phrases or unclear terms
- Bad examples: "glaze on", "with cream", "in sauce", "broccoli florets", "cauliflower florets"

VALID CATEGORY VALUES (use ONLY these exact strings):
- "fodmaps-fructans" - Wheat products (bread, pasta, tortillas, crackers, baked goods, wheat noodles), onions, garlic, shallots, leeks
- "fodmaps-gos" - Beans, lentils, chickpeas, hummus, legumes
- "fodmaps-lactose" - Milk, cream, soft cheese, yogurt, ice cream, butter
- "fodmaps-fructose" - Apples, honey, mango, agave, high-fructose corn syrup, certain fruits
- "fodmaps-polyols" - Sugar-free items with sweeteners (sorbitol, mannitol), stone fruits (peaches, plums, cherries), mushrooms, cauliflower
- "gluten" - ONLY use for: barley, rye, beer (NOT wheat products - those are fodmaps-fructans)
- "dairy" - All milk products including hard cheese, cream, butter (separate from lactose category)
- "cruciferous" - Broccoli, cabbage, Brussels sprouts, kale, bok choy
- "high-fat" - Fried foods, fatty meats, heavy cream, oils, butter, greasy foods
- "carbonated" - Soda, sparkling water, fizzy drinks
- "refined-sugar" - Candy, pastries, white sugar, syrups, desserts
- "alcohol" - Beer, wine, spirits, cocktails

IMPORTANT CATEGORIZATION RULES:
- Wheat-based foods (bread, pasta, flour products) should ALWAYS be categorized as "fodmaps-fructans", NOT "gluten"
- Only use "gluten" for barley, rye, or beer (which contain gluten but are not wheat-based)
- Hard cheeses are "dairy", soft cheeses/milk/yogurt are "fodmaps-lactose"
- When in doubt between overlapping categories, prefer the more specific FODMAP category

IMPORTANT:
- Be thorough but use SIMPLE BASE NAMES for all foods
- List each trigger separately even if multiple items share a category
- Only include foods you can reasonably infer from the description
- If the meal seems safe/low-trigger, return an empty triggers array
- When in doubt between specific variety vs. base name, ALWAYS choose the base name`
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"triggers": []}';

    console.log('AI response:', content);

    // Parse the JSON response
    let result: {
      triggers: any[];
    } = {
      triggers: []
    };

    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      result = {
        triggers: Array.isArray(parsed.triggers) ? parsed.triggers : []
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
    }

    // Validate trigger categories
    const validCategories = [
      'fodmaps-fructans', 'fodmaps-gos', 'fodmaps-lactose', 'fodmaps-fructose', 'fodmaps-polyols',
      'gluten', 'dairy', 'cruciferous', 'high-fat', 'carbonated', 'refined-sugar', 'alcohol'
    ];

    result.triggers = result.triggers.filter((trigger: any) => {
      const isValid = validCategories.includes(trigger.category);
      if (!isValid) {
        console.warn(`Filtered out invalid category: ${trigger.category}`);
      }
      return isValid;
    });

    // Add confidence score to all triggers
    result.triggers = result.triggers.map((trigger: any) => ({
      ...trigger,
      confidence: 0.9 // AI-detected triggers have high confidence
    }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-meal-text function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
