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
    {"category": "gluten-gang", "food": "wheat bread"},
    {"category": "dairy-drama", "food": "milk"},
    {"category": "dairy-drama", "food": "cheese"}
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

=== 9 TRIGGER CATEGORIES (use ONLY these exact strings) ===

1. "veggie-vengeance" - High-FODMAP vegetables & legumes
   → Onions, garlic, shallots, leeks, beans, lentils, chickpeas, broccoli, cauliflower, Brussels sprouts, cabbage, asparagus, mushrooms, peas

2. "fruit-fury" - High-fructose fruits & sweeteners
   → Apples, pears, mango, watermelon, honey, agave, dried fruits, high-fructose corn syrup, fruit juice

3. "gluten-gang" - Wheat, barley, rye products
   → Bread, pasta, pizza crust, crackers, bagels, muffins, cookies, cakes, wheat noodles, couscous, barley, rye, beer, soy sauce

4. "dairy-drama" - High-lactose milk products
   → Milk, ice cream, soft cheese (ricotta, cottage, cream cheese), yogurt, cream, condensed milk

5. "bad-beef" - Processed/cured/aged meats
   → Bacon, sausages, hot dogs, deli meats, salami, pepperoni, ham, jerky, canned fish, smoked meats

6. "chemical-chaos" - Artificial sweeteners & additives
   → Sugar-free gum, diet soda, protein bars, xylitol, sorbitol, maltitol, erythritol, inulin, chicory root

7. "grease-gridlock" - High-fat & fried foods
   → French fries, fried chicken, pizza, burgers, fatty meats (ribeye, pork belly), butter (large amounts), mayo, cream sauces

8. "spice-strike" - Hot peppers & irritating acids
   → Jalapeños, hot sauce, sriracha, habanero, cayenne, chili, curry, vinegar (large amounts)

9. "bubble-trouble" - Carbonation & air-swallowing
   → Soda, sparkling water, beer, champagne, energy drinks, kombucha, drinking through straws

=== CATEGORIZATION RULES ===
- Each food goes in ONE category only (primary trigger mechanism)
- Onions and garlic → "veggie-vengeance" (fructans, NOT gluten)
- Wheat/bread/pasta → "gluten-gang"
- Fresh meat (chicken, beef, fish) → NOT a trigger unless fried or processed
- Pizza → "grease-gridlock" (fat is the primary issue)
- Beer → "bubble-trouble" (carbonation is primary)
- Ice cream → "dairy-drama" (lactose is primary)
- If user mentions STRAW → add {"category": "bubble-trouble", "food": "straw"}

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

    // Validate trigger categories (new 9-category taxonomy)
    const validCategories = [
      'veggie-vengeance', 'fruit-fury', 'gluten-gang', 'dairy-drama',
      'bad-beef', 'chemical-chaos', 'grease-gridlock', 'spice-strike', 'bubble-trouble'
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
