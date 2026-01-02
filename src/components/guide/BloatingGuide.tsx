import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, AlertCircle, Lightbulb, Heart, Activity, Apple, Pill, CheckCircle } from 'lucide-react';

export function BloatingGuide() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">🎈 The Complete Guide to Bloating</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Feeling like you have a balloon in your belly after eating? You're not alone.
            </p>
          </div>
        </div>

        {/* Guide Content */}
        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
          {/* What is Bloating */}
          <AccordionItem value="what-is-bloating">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <span className="font-semibold">What Exactly is Bloating?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                When you feel bloated, your belly feels <strong>full, tight, stretched</strong>, and sometimes even looks bigger. It's like your intestines are throwing a party you didn't invite them to.
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="text-xl">🔬</span>
                  Three Things Happening Inside You
                </h4>

                {/* INFOGRAPHIC #1: 3 Types of Bloating */}
                <div className="my-4 rounded-lg overflow-hidden border border-border shadow-sm">
                  <img
                    src="/assets/images/bloat-guide-infographic-1-three-types.png"
                    alt="3 Types of Bloating: Gas Bubble Effect, Traffic Jam (Slow Motility), and Overactive Alarm System illustrated with digestive system diagrams"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>

                <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900 rounded-lg p-3">
                  <p className="text-xs font-medium text-pink-900 dark:text-pink-100 mb-1">
                    🩸 Note for People Who Menstruate
                  </p>
                  <p className="text-xs text-pink-800 dark:text-pink-200">
                    About <strong>3 out of 4 women</strong> feel more bloated before or during their period. Estrogen causes water retention and makes your gut more sensitive to gas.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Food Culprits */}
          <AccordionItem value="food-culprits">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                <span className="font-semibold">The Food Culprits (FODMAPs)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                The #1 cause of bloating is <strong>what you eat</strong>. Specifically, a group of foods called <strong>FODMAPs</strong>.
              </p>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">🧪 FODMAPs Explained Simply</h4>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Short-chain carbohydrates your small intestine has trouble absorbing. They pull water into your gut and get fermented by bacteria, producing gas.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">What Happens Step-by-Step</h4>

                {/* INFOGRAPHIC #2: FODMAP Journey */}
                <div className="my-4 rounded-lg overflow-hidden border border-border shadow-sm">
                  <img
                    src="/assets/images/bloat-guide-infographic-2-fodmap-journey.png"
                    alt="Your FODMAP Journey from bite to bloat: showing the digestive process from eating high-FODMAP food through small intestine absorption failure to large intestine fermentation and resulting gas and bloating"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">🚨 Common High-FODMAP Foods</h4>

                {/* INFOGRAPHIC #3: High-FODMAP Foods Grid */}
                <div className="my-4 rounded-lg overflow-hidden border border-border shadow-sm">
                  <img
                    src="/assets/images/bloat-guide-infographic-3-food-grid.png"
                    alt="High-FODMAP Foods Quick Reference Guide: visual grid showing fruits (apples, pears, mangoes, watermelon, peaches, plums), vegetables (onions, garlic, asparagus, cauliflower, mushrooms, snow peas), grains (wheat, rye, barley), legumes (beans, lentils, chickpeas), dairy products, and sweeteners to avoid"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Medical Conditions */}
          <AccordionItem value="medical-conditions">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">Medical Conditions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">Sometimes, bloating is a symptom of an underlying health issue.</p>

              <div className="space-y-2">
                <div className="border-l-2 border-red-400 pl-3">
                  <p className="font-medium">IBS (Irritable Bowel Syndrome)</p>
                  <p className="text-xs text-muted-foreground">Up to 90% of IBS patients experience bloating. Involves slow digestion and sensitive nerves.</p>
                </div>

                <div className="border-l-2 border-orange-400 pl-3">
                  <p className="font-medium">SIBO (Small Intestinal Bacterial Overgrowth)</p>
                  <p className="text-xs text-muted-foreground">Bacteria growing in the wrong place, fermenting food too early.</p>
                </div>

                <div className="border-l-2 border-blue-400 pl-3">
                  <p className="font-medium">Lactose Intolerance</p>
                  <p className="text-xs text-muted-foreground">Your body doesn't make enough lactase enzyme to digest milk sugar.</p>
                </div>

                <div className="border-l-2 border-purple-400 pl-3">
                  <p className="font-medium">Celiac Disease</p>
                  <p className="text-xs text-muted-foreground">Autoimmune disorder where gluten damages the small intestine.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Immediate Relief */}
          <AccordionItem value="immediate-relief">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Immediate Relief (Right Now!)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                  <p className="font-medium text-green-900 dark:text-green-100 mb-1">🚶‍♀️ Go for a Walk</p>
                  <p className="text-xs text-green-800 dark:text-green-200">
                    A gentle 10-15 minute walk after a meal stimulates your digestive system and moves gas along.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
                  <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">🧘‍♀️ Try Yoga Poses</p>
                  <p className="text-xs text-purple-800 dark:text-purple-200 mb-2">
                    <strong>Wind-Relieving Pose:</strong> Lie on back, hug knees to chest, rock gently.
                  </p>
                  <p className="text-xs text-purple-800 dark:text-purple-200">
                    <strong>Child's Pose:</strong> Kneel, sit on heels, fold forward.
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
                  <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">🔥 Apply Heat</p>
                  <p className="text-xs text-orange-800 dark:text-orange-200">
                    Heating pad or hot water bottle relaxes intestinal muscles, easing cramping.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💆‍♀️ Belly Massage</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Gentle clockwise circular motion following your large intestine's path.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Long-term Habits */}
          <AccordionItem value="long-term-habits">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                <span className="font-semibold">Long-Term Prevention</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Eat Smaller, More Frequent Meals</p>
                    <p className="text-xs text-muted-foreground">5-6 smaller meals instead of 3 large ones prevents overwhelming your digestive system.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Chew Your Food Slowly</p>
                    <p className="text-xs text-muted-foreground">Aim for 20-30 chews per bite. Digestion begins in your mouth!</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Drink Between Meals, Not During</p>
                    <p className="text-xs text-muted-foreground">Too much liquid dilutes stomach acid, making digestion less efficient.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Avoid Carbonated Drinks & Straws</p>
                    <p className="text-xs text-muted-foreground">Both put extra gas/air directly into your stomach.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Natural Remedies */}
          <AccordionItem value="natural-remedies">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                <span className="font-semibold">Natural Helpers & Supplements</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <div className="border rounded-lg p-3">
                  <p className="font-medium mb-1">🌱 Peppermint Oil ⭐</p>
                  <p className="text-xs text-muted-foreground">Relaxes intestinal muscles. Take enteric-coated capsules or drink peppermint tea.</p>
                </div>

                <div className="border rounded-lg p-3">
                  <p className="font-medium mb-1">🫚 Ginger</p>
                  <p className="text-xs text-muted-foreground">Speeds up stomach emptying and reduces inflammation. Try ginger tea or fresh ginger in meals.</p>
                </div>

                <div className="border rounded-lg p-3">
                  <p className="font-medium mb-1">🦠 Probiotics</p>
                  <p className="text-xs text-muted-foreground">Balance gut bacteria. Found in yogurt, kefir, kimchi. Look for Bifidobacterium and Lactobacillus strains.</p>
                </div>

                <div className="border rounded-lg p-3">
                  <p className="font-medium mb-1">💊 Digestive Enzymes</p>
                  <p className="text-xs text-muted-foreground">Lactase (Lactaid) for dairy, Alpha-galactosidase (Beano) for beans/veggies.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* When to Worry */}
          <AccordionItem value="when-to-worry">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold">When to See a Doctor</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 space-y-2">
                <p className="font-semibold text-red-900 dark:text-red-100">⚠️ See a Doctor ASAP if you have:</p>
                <ul className="space-y-1 text-xs text-red-800 dark:text-red-200">
                  <li>🔴 Blood in your stool (red or black/tarry)</li>
                  <li>🔴 Severe, unbearable abdominal pain</li>
                  <li>🔴 Unintentional weight loss</li>
                  <li>🔴 High fever</li>
                  <li>🔴 Vomiting that won't stop</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 space-y-2">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">📅 Schedule an appointment if:</p>
                <ul className="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
                  <li>🟡 Bloating is persistent (most days for 2-3+ weeks)</li>
                  <li>🟡 It's getting worse over time</li>
                  <li>🟡 It's seriously impacting your life</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Action Plan */}
          <AccordionItem value="action-plan">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕵️</span>
                <span className="font-semibold">Your Action Plan</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                The key to beating bloating is finding <strong>YOUR personal triggers</strong>. What bothers your friend might be fine for you.
              </p>

              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-3">
                  <p className="font-semibold mb-1">📝 STEP 1: Keep a Food & Symptom Diary</p>
                  <p className="text-xs text-muted-foreground mb-2">For 2 weeks, write down:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Everything you eat and drink (with times)</li>
                    <li>• When you feel bloated (1-10 scale)</li>
                    <li>• Stress levels and sleep quality</li>
                    <li>• Bowel movements</li>
                  </ul>
                  <p className="text-xs font-medium text-primary mt-2">💡 Use Gut Guardian to track this!</p>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <p className="font-semibold mb-1">🔍 STEP 2: Look for Patterns</p>
                  <p className="text-xs text-muted-foreground">
                    After two weeks, review your diary. Do you see bloating every time you eat onions? After pasta meals?
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-3">
                  <p className="font-semibold mb-1">🧪 STEP 3: Try an Elimination Diet</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    ⚠️ Best done with a doctor or dietitian.
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li><strong>Phase 1 (3-6 weeks):</strong> Avoid all high-FODMAP foods</li>
                    <li><strong>Phase 2:</strong> Slowly reintroduce one group at a time</li>
                    <li><strong>Phase 3:</strong> Create a personalized diet avoiding only YOUR triggers</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Key Takeaways */}
        <Separator />
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-xl">✨</span>
            Key Takeaways
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2 text-sm">
              <span className="text-primary">💡</span>
              <p>Bloating is usually caused by gas from gut bacteria fermenting undigested food (especially FODMAPs).</p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-primary">💡</span>
              <p>Simple lifestyle changes like eating slowly, walking, and managing stress can make a huge difference.</p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-primary">💡</span>
              <p>You are your own best doctor. Tracking your food and symptoms is your most powerful tool.</p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-primary">💡</span>
              <p>Don't be afraid to ask for help. If bloating is severe or worrying, see a doctor or dietitian.</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
