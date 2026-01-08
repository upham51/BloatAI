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
                text: `You are an expert food analyst. Analyze this meal photo EXHAUSTIVELY. Identify EVERY visible ingredient, component, and food item.

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
    {"name": "Pancakes", "detail": "wheat-based", "is_trigger": true, "trigger_category": "fodmaps-fructans"},
    {"name": "Buttermilk", "detail": "dairy", "is_trigger": true, "trigger_category": "fodmaps-lactose"},
    {"name": "Whipped cream", "detail": "dairy", "is_trigger": true, "trigger_category": "dairy"},
    {"name": "Maple syrup", "detail": "contains fructose", "is_trigger": true, "trigger_category": "fodmaps-fructose"},
    {"name": "Bacon", "detail": "fatty meat", "is_trigger": true, "trigger_category": "high-fat"},
    {"name": "Strawberries", "detail": "low FODMAP fruit", "is_trigger": false, "trigger_category": null},
    {"name": "Powdered sugar", "detail": "refined sugar", "is_trigger": true, "trigger_category": "refined-sugar"}
  ],
  "triggers": [
    {"category": "fodmaps-fructans", "food": "wheat flour"},
    {"category": "fodmaps-lactose", "food": "buttermilk"},
    {"category": "dairy", "food": "whipped cream"},
    {"category": "fodmaps-fructose", "food": "maple syrup"},
    {"category": "high-fat", "food": "bacon"},
    {"category": "refined-sugar", "food": "powdered sugar"}
  ]
}

TRIGGER FOOD NAMING RULES:
- Use complete, clear ingredient names (e.g., "honey glaze" not "glaze on")
- Be specific but concise (e.g., "wheat bread" not "wheat flour in bread")
- Avoid partial phrases or unclear terms
- Use the actual ingredient name that causes the trigger
- Examples: "onions", "milk", "honey", "wheat pasta", "fried chicken"
- Bad examples: "glaze on", "with cream", "in sauce"

VALID CATEGORY VALUES (use ONLY these exact strings):
- "fodmaps-fructans" - Wheat, bread, pasta, onions, garlic, shallots
- "fodmaps-gos" - Beans, lentils, chickpeas, hummus
- "fodmaps-lactose" - Milk, cream, soft cheese, yogurt, ice cream, butter
- "fodmaps-fructose" - Apples, honey, mango, agave, high-fructose corn syrup
- "fodmaps-polyols" - Sugar-free items, stone fruits (peaches, plums), mushrooms
- "gluten" - Wheat, barley, rye, bread, pasta, beer, soy sauce
- "dairy" - All milk products including cheese, cream, butter
- "cruciferous" - Broccoli, cabbage, cauliflower, Brussels sprouts, kale
- "high-fat" - Fried foods, fatty meats, heavy cream, oils, butter
- "carbonated" - Soda, sparkling water, beer
- "refined-sugar" - Candy, pastries, white sugar, syrups, desserts
- "alcohol" - Beer, wine, spirits, cocktails

IMPORTANT:
- Be EXHAUSTIVE with ingredient detection
- Include compound ingredients (e.g., if pizza, list: wheat crust, tomato sauce, cheese, toppings)
- List each trigger separately even if multiple items share a category
- Only include foods you can actually see or reasonably infer
- If unsure about an ingredient, include it to be safe`
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
