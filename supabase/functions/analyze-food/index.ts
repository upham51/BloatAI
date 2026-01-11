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

    const { imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing food image for FODMAP triggers:', imageUrl?.substring(0, 100));

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
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              },
              {
                type: 'text',
                text: `You are an expert food analyst. Analyze this meal photo thoroughly and identify all visible ingredients using simple, clear base names.

Your task:
1. Create a memorable, short meal title (2-4 words MAXIMUM) following the pattern: [Adjective] + [Main Dish] + [Optional: Style/Bowl/Stack/Plate]
2. Provide 3 alternative title options the user can choose from
3. Choose an appropriate meal emoji
4. Identify the meal category (1-2 words like "Breakfast", "Lunch", "Dinner", "Snack")
5. Write a detailed description listing ALL visible foods (2-3 sentences)
6. List all ingredients with their trigger information
7. Identify ALL potential FODMAP/digestive triggers

NAMING RULES:
- Title must be 2-4 words maximum
- Examples: "Spicy Chicken Bowl", "Sweet Pancakes", "Garden Salad", "Breakfast Stack"
- Make it memorable and easy to reference later

MEAL EMOJI GUIDE:
- Breakfast: 🥞 🍳 🥣 🍞 🥤
- Lunch/Dinner: 🥗 🍜 🥘 🍝 🍕 🍔 🥪 🍚 🍛 🍲
- Proteins: 🍗 🐟 🥩
- Sides: 🥦 🍟
- Snacks: 🍎 🥛 🥜
- Default: 🍽️

Return ONLY valid JSON (no markdown, no code blocks):
{
  "meal_emoji": "🥞",
  "meal_title": "Sweet Pancake Stack",
  "title_options": ["Sweet Pancake Stack", "Caramel Pancakes", "Breakfast Stack"],
  "main_dish": "pancakes",
  "meal_category": "Breakfast",
  "creative_title": "Sweet Pancake Stack",
  "meal_description": "Fluffy buttermilk pancakes topped with fresh strawberries, blueberries, and whipped cream, drizzled with maple syrup and dusted with powdered sugar. Served with a side of crispy bacon.",
  "ingredients": [
    {"name": "Pancakes", "detail": "wheat-based", "is_trigger": true, "trigger_category": "grains"},
    {"name": "Buttermilk", "detail": "dairy", "is_trigger": true, "trigger_category": "dairy"},
    {"name": "Whipped cream", "detail": "dairy", "is_trigger": true, "trigger_category": "dairy"},
    {"name": "Maple syrup", "detail": "contains fructose", "is_trigger": true, "trigger_category": "fruit"},
    {"name": "Bacon", "detail": "fatty meat", "is_trigger": true, "trigger_category": "fatty-food"},
    {"name": "Strawberries", "detail": "low FODMAP fruit", "is_trigger": false, "trigger_category": null},
    {"name": "Powdered sugar", "detail": "refined sugar", "is_trigger": true, "trigger_category": "sugar"}
  ],
  "triggers": [
    {"category": "grains", "food": "wheat bread"},
    {"category": "dairy", "food": "milk"},
    {"category": "dairy", "food": "cream"},
    {"category": "fruit", "food": "maple syrup"},
    {"category": "fatty-food", "food": "bacon"},
    {"category": "sugar", "food": "sugar"}
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
- "grains" - Wheat products (bread, pasta, tortillas, crackers, baked goods, wheat noodles), onions, garlic, shallots, leeks
- "beans" - Beans, lentils, chickpeas, hummus, legumes
- "dairy" - Milk, cream, cheese (all types), yogurt, ice cream, butter
- "fruit" - Apples, honey, mango, agave, high-fructose corn syrup, pears, certain fruits
- "sweeteners" - Sugar-free items with sweeteners (sorbitol, mannitol), stone fruits (peaches, plums, cherries)
- "gluten" - ONLY use for: barley, rye, beer (NOT wheat products - those are grains)
- "veggies" - Broccoli, cabbage, Brussels sprouts, kale, bok choy, cauliflower, mushrooms
- "fatty-food" - Fried foods, fatty meats, heavy cream, oils, butter, greasy foods
- "carbonated" - Soda, sparkling water, fizzy drinks
- "sugar" - Candy, pastries, white sugar, syrups, desserts
- "alcohol" - Beer, wine, spirits, cocktails
- "processed" - Packaged snacks, cereals, processed foods

IMPORTANT CATEGORIZATION RULES:
- Wheat-based foods (bread, pasta, flour products) should ALWAYS be categorized as "grains", NOT "gluten"
- Only use "gluten" for barley, rye, or beer (which contain gluten but are not wheat-based)
- All dairy products (milk, cheese, yogurt) should be categorized as "dairy"
- When in doubt between overlapping categories, prefer the most specific category

IMPORTANT:
- Be thorough with ingredient detection, but prefer SIMPLE BASE NAMES
- Include compound ingredients (e.g., if pizza, list: "wheat bread", "tomato sauce", "cheese", "pepperoni")
- Use base ingredient names: "broccoli" not "broccoli florets", "rice" not "jasmine rice"
- List each trigger separately even if multiple items share a category
- Only include foods you can actually see or reasonably infer
- When in doubt between specific variety vs. base name, ALWAYS choose the base name`
              }
            ]
          }
        ],
        max_tokens: 1500,
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
    const content = data.choices?.[0]?.message?.content || '{"meal_description": "A meal", "triggers": []}';
    
    console.log('AI response:', content);

    // Parse the JSON response
    let result: {
      meal_description: string;
      triggers: any[];
      creative_title: string;
      meal_category: string;
      meal_emoji: string;
      meal_title: string;
      title_options: string[];
      ingredients: any[];
    } = { 
      meal_description: 'A meal', 
      triggers: [], 
      creative_title: 'Delicious Meal', 
      meal_category: 'Homemade',
      meal_emoji: '🍽️',
      meal_title: 'Delicious Meal',
      title_options: ['Delicious Meal'],
      ingredients: []
    };
    
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      result = {
        meal_description: parsed.meal_description || 'A meal',
        triggers: Array.isArray(parsed.triggers) ? parsed.triggers : [],
        creative_title: parsed.creative_title || parsed.meal_title || 'Delicious Meal',
        meal_category: parsed.meal_category || 'Homemade',
        meal_emoji: parsed.meal_emoji || '🍽️',
        meal_title: parsed.meal_title || parsed.creative_title || 'Delicious Meal',
        title_options: Array.isArray(parsed.title_options) ? parsed.title_options : [parsed.meal_title || 'Delicious Meal'],
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : []
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
    }

    // Validate trigger categories
    const validCategories = [
      'grains', 'beans', 'dairy', 'fruit', 'sweeteners',
      'gluten', 'veggies', 'fatty-food', 'carbonated', 'sugar', 'alcohol', 'processed'
    ];
    
    result.triggers = result.triggers.filter((trigger: any) => {
      const isValid = validCategories.includes(trigger.category);
      if (!isValid) {
        console.warn(`Filtered out invalid category: ${trigger.category}`);
      }
      return isValid;
    });

    // Also validate ingredient trigger categories
    result.ingredients = result.ingredients.map((ingredient: any) => {
      if (ingredient.is_trigger && ingredient.trigger_category) {
        if (!validCategories.includes(ingredient.trigger_category)) {
          ingredient.is_trigger = false;
          ingredient.trigger_category = null;
        }
      }
      return ingredient;
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-food function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
