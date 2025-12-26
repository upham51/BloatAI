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
                text: `Analyze this meal photo and identify potential FODMAP triggers and bloating-causing foods.

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks):
[
  {
    "category": "FODMAPs-fructans",
    "food": "garlic",
    "confidence": 85
  }
]

Valid categories:
- FODMAPs-fructans (wheat, onions, garlic, artichokes)
- FODMAPs-GOS (beans, lentils, chickpeas, cashews)
- FODMAPs-lactose (milk, soft cheese, yogurt, ice cream)
- FODMAPs-fructose (apples, honey, mango, watermelon)
- FODMAPs-polyols (sugar-free gum, stone fruits, mushrooms)
- gluten (wheat, barley, rye)
- dairy (all milk products)
- cruciferous (broccoli, cabbage, Brussels sprouts, cauliflower)
- high-fat (fried foods, fatty meats, butter)
- carbonated (soda, sparkling water, beer)
- refined-sugar (candy, pastries, desserts)
- alcohol (beer, wine, spirits)
- legumes (beans, peas, lentils)
- spicy (hot peppers, chili)

Only include foods you can clearly identify in the image. Set confidence 0-100 based on how certain you are.
If you cannot identify any food or the image is not food-related, return an empty array: []`
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
    const content = data.choices?.[0]?.message?.content || '[]';
    
    console.log('AI response:', content);

    // Parse the JSON response
    let triggers = [];
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      triggers = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      triggers = [];
    }

    return new Response(JSON.stringify({ triggers }), {
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
