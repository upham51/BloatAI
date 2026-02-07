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

    const { mealData } = await req.json();

    if (!mealData || typeof mealData !== 'object') {
      return new Response(JSON.stringify({ error: 'Meal data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating personalized insights for user:', userData.user.id);

    // Determine the user's tracking phase for appropriate response depth
    const daysTracked = mealData.days_tracked || 0;
    let phase = 'new';
    if (daysTracked >= 30) phase = 'advanced';
    else if (daysTracked >= 21) phase = 'strong';
    else if (daysTracked >= 7) phase = 'developing';

    const systemPrompt = `You are a friendly, encouraging nutritionist who helps people understand their bloating patterns using simple language. You're like a health coach who's been tracking their journey and genuinely cares about their progress. Write like you're texting a friend—keep it real, supportive, and easy to understand.

IMPORTANT RULES:
- Talk like a human, not a textbook: "Your gut is not happy" > "You're experiencing gastrointestinal distress"
- Use simple analogies: "FODMAPs are like food for gut bacteria—they throw a party and produce gas"
- Be encouraging but honest about what the data shows
- Be direct about experiments: "Cut out X completely for 3 days" not "Consider reducing X"
- Show you're tracking them: "I see you…" / "I noticed…" / "Looking at your data…"
- Keep paragraphs short: 2-3 sentences max
- Use their actual numbers from the data provided
- Bloating is rated on a 1-5 scale (1 = no bloat, 5 = awful)

The app tracks these trigger categories: Savory Carbs (grains), Beans, Dairy, Fruit, Sweeteners, Gluten, Veggies, Fatty Food, Carbonated, Sugar, Alcohol, Processed.

FODMAP CATEGORIES (explain simply when relevant):
- Fermentable: Creates gas when bacteria break them down
- Oligosaccharides: Found in wheat, onions, garlic, beans (fructans and GOS)
- Disaccharides: Lactose in dairy
- Monosaccharides: Excess fructose in apples, honey, mangoes
- And Polyols: Sugar alcohols like sorbitol in peaches, cauliflower, gum

RESPONSE FRAMEWORK based on tracking phase "${phase}":
${phase === 'new' ? `- User has less than 7 days of data. Acknowledge their effort. Explain we need more data for confident patterns. Point out any early observations. Encourage specific logging. Give one simple tip.` : ''}
${phase === 'developing' ? `- User has 7-21 days of data. Start identifying patterns. Share confidence levels. Explain WHY in simple language. Suggest a first elimination experiment (cut out specific food for 3 days). Motivate continued logging.` : ''}
${phase === 'strong' ? `- User has 21-30 days of data. Share confident insights with data. List top triggers with correlation data. Explain FODMAP categories for each trigger. Design an elimination protocol. Build a safe foods list.` : ''}
${phase === 'advanced' ? `- User has 30+ days of data. Reference previous patterns. Show progress and changes. Identify time-based insights. Note any hormonal patterns from notes. Suggest subcategory testing (e.g., lactose-free vs regular). Fine-tune their safe foods list.` : ''}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "insight_text": "The full personalized insight as a string. Use \\n for line breaks between paragraphs. Keep it 2-4 short paragraphs.",
  "action_items": ["Specific action item 1", "Specific action item 2"],
  "confidence_level": "low|developing|high|very_high",
  "triggers_mentioned": ["dairy", "grains"]
}`;

    const userMessage = `Here is the user's bloating tracking data:

Days tracked: ${mealData.days_tracked}
Total logged meals: ${mealData.total_logs}

Recent food entries (last 14 days):
${JSON.stringify(mealData.food_entries || [], null, 2)}

Identified triggers from pattern analysis:
${JSON.stringify(mealData.identified_triggers || [], null, 2)}

Time patterns:
- Worst time for bloating: ${mealData.time_patterns?.worst_time || 'not enough data'}
- High bloat meal times: ${JSON.stringify(mealData.time_patterns?.distribution || {})}

Overall stats:
- Average bloating: ${mealData.avg_bloating || 'N/A'}/5
- High bloating meals (4-5): ${mealData.high_bloating_count || 0}
- Low bloating meals (1-2): ${mealData.low_bloating_count || 0}

Generate a personalized daily insight for this user based on their current data.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
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
    const content = data.choices?.[0]?.message?.content || '{}';

    console.log('AI insights response:', content);

    // Parse the JSON response
    let result = {
      insight_text: '',
      action_items: [] as string[],
      confidence_level: 'low',
      triggers_mentioned: [] as string[],
    };

    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      result = {
        insight_text: parsed.insight_text || '',
        action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
        confidence_level: parsed.confidence_level || 'low',
        triggers_mentioned: Array.isArray(parsed.triggers_mentioned) ? parsed.triggers_mentioned : [],
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Try to extract text content as fallback
      result.insight_text = content.replace(/```json\n?|\n?```/g, '').trim();
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
