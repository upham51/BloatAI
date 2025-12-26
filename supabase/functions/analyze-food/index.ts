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
                text: `Analyze this meal photo and provide:

1. A creative, appetizing short title for the meal (2-4 words max, like "Caramel Bliss Pancakes" or "Garden Fresh Harvest")
2. A meal category (1-2 words like "Breakfast Indulgence", "Comfort Food", "Light & Fresh")
3. A natural description of the meal (1-2 sentences)
4. List of FODMAP/trigger categories detected

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "creative_title": "Golden Sunrise Stack",
  "meal_category": "Breakfast Delight",
  "meal_description": "Fluffy pancakes drizzled with maple syrup, served with fresh berries and whipped cream",
  "triggers": [
    {
      "category": "fodmaps-fructans",
      "food": "wheat flour"
    },
    {
      "category": "fodmaps-lactose",
      "food": "whipped cream"
    }
  ]
}

CRITICAL: You MUST use ONLY these exact category values (copy exactly as written):

1. "fodmaps-fructans" - Wheat, bread, onions, garlic
2. "fodmaps-gos" - Beans, lentils, chickpeas
3. "fodmaps-lactose" - Milk, soft cheese, yogurt
4. "fodmaps-fructose" - Apples, honey, mango
5. "fodmaps-polyols" - Sugar-free gum, stone fruits
6. "gluten" - Wheat, barley, rye, beer
7. "dairy" - All milk products
8. "cruciferous" - Broccoli, cabbage, Brussels sprouts
9. "high-fat" - Fried foods, fatty meats
10. "carbonated" - Soda, sparkling water
11. "refined-sugar" - Candy, pastries, white bread
12. "alcohol" - Beer, wine, spirits

Do NOT create new categories. Only use the 12 listed above.
Make the creative_title sound appetizing and memorable - avoid generic names.
Only include foods you can clearly identify.
If you cannot identify any triggers, return an empty triggers array.
If you cannot identify the food, return a generic title and description.`
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
