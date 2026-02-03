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
    {"name": "Pancakes", "detail": "wheat-based", "is_trigger": true, "trigger_category": "gluten-gang"},
    {"name": "Buttermilk", "detail": "dairy", "is_trigger": true, "trigger_category": "dairy-drama"},
    {"name": "Whipped cream", "detail": "dairy", "is_trigger": true, "trigger_category": "dairy-drama"},
    {"name": "Maple syrup", "detail": "contains fructose", "is_trigger": true, "trigger_category": "fruit-fury"},
    {"name": "Bacon", "detail": "processed meat", "is_trigger": true, "trigger_category": "bad-beef"},
    {"name": "Strawberries", "detail": "low FODMAP fruit", "is_trigger": false, "trigger_category": null},
    {"name": "Butter", "detail": "high fat", "is_trigger": true, "trigger_category": "grease-gridlock"}
  ],
  "triggers": [
    {"category": "gluten-gang", "food": "wheat bread"},
    {"category": "dairy-drama", "food": "milk"},
    {"category": "dairy-drama", "food": "cream"},
    {"category": "fruit-fury", "food": "maple syrup"},
    {"category": "bad-beef", "food": "bacon"},
    {"category": "grease-gridlock", "food": "butter"}
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
- If you see a STRAW in the image → add {"category": "bubble-trouble", "food": "straw"}

=== CRITICAL: ALWAYS DETECT THESE COMMON TRIGGERS ===
You MUST detect and add triggers for these foods if visible:
- ANY onion (green onion, scallion, red onion, yellow onion) → "veggie-vengeance"
- Garlic → "veggie-vengeance"
- Broccoli → "veggie-vengeance"
- Cauliflower → "veggie-vengeance"
- Mushrooms → "veggie-vengeance"
- Beans/lentils/chickpeas → "veggie-vengeance"
- Ice cream → "dairy-drama"
- Milk/cream → "dairy-drama"
- Cheese (soft types) → "dairy-drama"
- Bread/pasta/noodles → "gluten-gang"
- Fried foods → "grease-gridlock"

DO NOT return empty triggers if ANY of these foods are visible!
Most meals contain at least one trigger - analyze carefully.

IMPORTANT:
- Be thorough with ingredient detection, but prefer SIMPLE BASE NAMES
- Include compound ingredients (e.g., if pizza, list: "wheat bread", "cheese", "pepperoni")
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

    // FALLBACK 1: If triggers array is empty but ingredients have triggers, extract them
    if (result.triggers.length === 0 && result.ingredients.length > 0) {
      console.log('Triggers array empty, extracting from ingredients...');
      const ingredientTriggers = result.ingredients
        .filter((ing: any) => ing.is_trigger && ing.trigger_category && validCategories.includes(ing.trigger_category))
        .map((ing: any) => ({
          category: ing.trigger_category,
          food: ing.name?.toLowerCase() || ing.trigger_category
        }));

      if (ingredientTriggers.length > 0) {
        console.log(`Extracted ${ingredientTriggers.length} triggers from ingredients`);
        result.triggers = ingredientTriggers;
      }
    }

    // FALLBACK 2: Keyword-based trigger detection from meal description
    // This catches triggers even when AI completely fails to detect them
    if (result.triggers.length === 0 && result.meal_description) {
      console.log('Running keyword-based trigger detection fallback...');
      const description = result.meal_description.toLowerCase();
      const keywordTriggers: Array<{category: string, food: string}> = [];

      // Common trigger keywords mapped to categories
      const triggerKeywords: Record<string, Array<{keywords: string[], food: string}>> = {
        'veggie-vengeance': [
          { keywords: ['onion', 'onions', 'green onion', 'scallion', 'shallot'], food: 'onion' },
          { keywords: ['garlic'], food: 'garlic' },
          { keywords: ['broccoli'], food: 'broccoli' },
          { keywords: ['cauliflower'], food: 'cauliflower' },
          { keywords: ['mushroom', 'mushrooms'], food: 'mushrooms' },
          { keywords: ['beans', 'bean', 'lentil', 'lentils', 'chickpea', 'hummus'], food: 'beans' },
          { keywords: ['cabbage', 'sauerkraut', 'coleslaw'], food: 'cabbage' },
          { keywords: ['asparagus'], food: 'asparagus' },
          { keywords: ['artichoke'], food: 'artichoke' },
          { keywords: ['leek', 'leeks'], food: 'leek' },
        ],
        'dairy-drama': [
          { keywords: ['ice cream', 'icecream', 'gelato', 'frozen yogurt'], food: 'ice cream' },
          { keywords: ['milk', 'milkshake', 'latte', 'cappuccino'], food: 'milk' },
          { keywords: ['cream', 'creamy', 'whipped cream', 'sour cream'], food: 'cream' },
          { keywords: ['cheese', 'cheesy', 'mozzarella', 'cheddar', 'parmesan', 'ricotta', 'cottage cheese', 'cream cheese'], food: 'cheese' },
          { keywords: ['yogurt', 'yoghurt'], food: 'yogurt' },
          { keywords: ['butter', 'buttery'], food: 'butter' },
        ],
        'gluten-gang': [
          { keywords: ['bread', 'toast', 'sandwich', 'bun', 'roll', 'bagel', 'croissant'], food: 'bread' },
          { keywords: ['pasta', 'spaghetti', 'noodle', 'noodles', 'macaroni', 'penne', 'fettuccine', 'linguine', 'ramen'], food: 'pasta' },
          { keywords: ['wheat', 'flour', 'tortilla', 'wrap'], food: 'wheat' },
          { keywords: ['pizza', 'calzone'], food: 'pizza crust' },
          { keywords: ['pancake', 'pancakes', 'waffle', 'waffles', 'crepe'], food: 'pancakes' },
          { keywords: ['cake', 'cupcake', 'muffin', 'cookie', 'cookies', 'brownie', 'pastry', 'croissant', 'donut', 'doughnut'], food: 'baked goods' },
          { keywords: ['cereal', 'oatmeal', 'granola'], food: 'cereal' },
        ],
        'fruit-fury': [
          { keywords: ['apple', 'apples'], food: 'apple' },
          { keywords: ['pear', 'pears'], food: 'pear' },
          { keywords: ['mango', 'mangoes'], food: 'mango' },
          { keywords: ['watermelon'], food: 'watermelon' },
          { keywords: ['dried fruit', 'raisins', 'dates', 'prunes', 'dried apricot'], food: 'dried fruit' },
          { keywords: ['honey'], food: 'honey' },
          { keywords: ['agave'], food: 'agave' },
        ],
        'grease-gridlock': [
          { keywords: ['fried', 'deep fried', 'deep-fried', 'crispy', 'battered'], food: 'fried food' },
          { keywords: ['french fries', 'fries', 'chips'], food: 'fries' },
          { keywords: ['bacon'], food: 'bacon' },
          { keywords: ['sausage', 'sausages', 'hot dog', 'hotdog'], food: 'sausage' },
          { keywords: ['fatty', 'greasy', 'oily'], food: 'fatty food' },
        ],
        'spice-strike': [
          { keywords: ['spicy', 'hot sauce', 'sriracha', 'tabasco', 'chili', 'jalapeño', 'jalapeno', 'habanero', 'cayenne'], food: 'spicy food' },
          { keywords: ['curry', 'curried'], food: 'curry' },
          { keywords: ['wasabi'], food: 'wasabi' },
        ],
        'bubble-trouble': [
          { keywords: ['soda', 'cola', 'coke', 'pepsi', 'sprite', 'fanta', 'fizzy', 'carbonated'], food: 'soda' },
          { keywords: ['beer', 'lager', 'ale'], food: 'beer' },
          { keywords: ['sparkling water', 'seltzer', 'tonic'], food: 'sparkling water' },
          { keywords: ['champagne', 'prosecco'], food: 'champagne' },
        ],
        'bad-beef': [
          { keywords: ['deli meat', 'deli', 'cold cuts', 'salami', 'pepperoni', 'ham', 'prosciutto', 'pastrami'], food: 'deli meat' },
          { keywords: ['processed meat', 'spam', 'bologna'], food: 'processed meat' },
        ],
        'chemical-chaos': [
          { keywords: ['sugar-free', 'sugar free', 'diet soda', 'diet coke', 'zero sugar', 'no sugar'], food: 'sugar-free product' },
          { keywords: ['protein bar', 'energy bar'], food: 'protein bar' },
          { keywords: ['gum', 'chewing gum'], food: 'gum' },
          { keywords: ['artificial sweetener', 'aspartame', 'sucralose', 'stevia', 'xylitol', 'sorbitol'], food: 'artificial sweetener' },
        ],
      };

      // Scan description for trigger keywords
      for (const [category, items] of Object.entries(triggerKeywords)) {
        for (const item of items) {
          const found = item.keywords.some(keyword => description.includes(keyword));
          if (found) {
            // Avoid duplicates
            const exists = keywordTriggers.some(t => t.category === category && t.food === item.food);
            if (!exists) {
              keywordTriggers.push({ category, food: item.food });
            }
          }
        }
      }

      if (keywordTriggers.length > 0) {
        console.log(`Keyword fallback detected ${keywordTriggers.length} triggers:`, keywordTriggers);
        result.triggers = keywordTriggers;
      }
    }

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
