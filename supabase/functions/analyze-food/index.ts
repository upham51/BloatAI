import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
1. Create a creative, appetizing short title (2-4 words, like "Caramel Bliss Pancakes" or "Mediterranean Sunset Bowl")
2. Create a meal category (1-2 words like "Breakfast Indulgence", "Comfort Food", "Light & Fresh")
3. Write a detailed description listing ALL visible foods (2-3 sentences)
4. Identify ALL potential FODMAP/digestive triggers

CRITICAL INSTRUCTIONS FOR INGREDIENT DETECTION:
- List EVERY ingredient you can see, no matter how small
- Include all sauces, seasonings, garnishes, sides
- If you see bread, identify the type and list wheat/gluten
- If you see any dairy (cheese, cream, butter, milk), list it
- If you see onions or garlic (even as seasoning), list them
- If you see any sweeteners or sugar, list them
- Be thorough - users depend on this for their digestive health

Return ONLY valid JSON (no markdown, no code blocks):
{
  "creative_title": "Golden Sunrise Stack",
  "meal_category": "Breakfast Delight",
  "meal_description": "Fluffy buttermilk pancakes topped with fresh strawberries, blueberries, and whipped cream, drizzled with maple syrup and dusted with powdered sugar. Served with a side of crispy bacon.",
  "triggers": [
    {"category": "fodmaps-fructans", "food": "wheat flour (pancakes)"},
    {"category": "fodmaps-lactose", "food": "buttermilk"},
    {"category": "fodmaps-lactose", "food": "whipped cream"},
    {"category": "fodmaps-fructose", "food": "maple syrup"},
    {"category": "high-fat", "food": "bacon"},
    {"category": "refined-sugar", "food": "powdered sugar"}
  ]
}

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
        max_tokens: 1024,
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
    let result = { meal_description: 'A meal', triggers: [], creative_title: 'Delicious Meal', meal_category: 'Homemade' };
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      result = {
        meal_description: parsed.meal_description || 'A meal',
        triggers: Array.isArray(parsed.triggers) ? parsed.triggers : [],
        creative_title: parsed.creative_title || 'Delicious Meal',
        meal_category: parsed.meal_category || 'Homemade'
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
