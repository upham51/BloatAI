import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { BookOpen, AlertCircle, Lightbulb, Heart, Activity, Apple, Pill, CheckCircle, X } from 'lucide-react';

export function BloatingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-lg"
        size="lg"
      >
        <BookOpen className="w-5 h-5 mr-2" />
        📘 Complete Guide to Bloating
      </Button>

      {/* Full-Screen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[95vh] p-0 gap-0">
          {/* Floating X Button (Top-Left) */}
          <button
            onClick={() => setIsOpen(false)}
            className="fixed top-6 left-6 z-50 w-10 h-10 rounded-full bg-background/95 backdrop-blur-sm border-2 border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-full px-8 py-12">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">🎈 The Complete Guide to Bloating</h1>
                <p className="text-lg text-muted-foreground">
                  Feeling like you have a balloon in your belly after eating? You're not alone.
                </p>
              </div>

              {/* Section 1: What is Bloating */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📖</span>
                  <h2 className="text-2xl font-bold">What Exactly is Bloating?</h2>
                </div>

                <p className="text-muted-foreground text-base">
                  When you feel bloated, your belly feels <strong>full, tight, stretched</strong>, and sometimes even looks bigger. It's like your intestines are throwing a party you didn't invite them to.
                </p>

                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-2xl">🔬</span>
                    Three Things Happening Inside You
                  </h3>

                  {/* INFOGRAPHIC #1: 3 Types of Bloating */}
                  <div className="my-6 rounded-lg overflow-hidden border border-border shadow-md">
                    <img
                      src="/assets/images/bloat-guide-infographic-1-three-types.png"
                      alt="3 Types of Bloating: Gas Bubble Effect, Traffic Jam (Slow Motility), and Overactive Alarm System illustrated with digestive system diagrams"
                      className="w-full h-auto"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900 rounded-lg p-4">
                    <p className="text-sm font-medium text-pink-900 dark:text-pink-100 mb-2">
                      🩸 Note for People Who Menstruate
                    </p>
                    <p className="text-sm text-pink-800 dark:text-pink-200">
                      About <strong>3 out of 4 women</strong> feel more bloated before or during their period. Estrogen causes water retention and makes your gut more sensitive to gas.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Section 2: Food Culprits */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Apple className="w-7 h-7 text-primary" />
                  <h2 className="text-2xl font-bold">The Food Culprits (FODMAPs)</h2>
                </div>

                <p className="text-muted-foreground text-base">
                  The #1 cause of bloating is <strong>what you eat</strong>. Specifically, a group of foods called <strong>FODMAPs</strong>.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-base">🧪 FODMAPs Explained Simply</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Short-chain carbohydrates your small intestine has trouble absorbing. They pull water into your gut and get fermented by bacteria, producing gas.
                  </p>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold text-lg">What Happens Step-by-Step</h3>

                  {/* INFOGRAPHIC #2: FODMAP Journey */}
                  <div className="my-6 rounded-lg overflow-hidden border border-border shadow-md">
                    <img
                      src="/assets/images/bloat-guide-infographic-2-fodmap-journey.png"
                      alt="Your FODMAP Journey from bite to bloat: showing the digestive process from eating high-FODMAP food through small intestine absorption failure to large intestine fermentation and resulting gas and bloating"
                      className="w-full h-auto"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold text-lg">🚨 Common High-FODMAP Foods</h3>

                  {/* INFOGRAPHIC #3: High-FODMAP Foods Grid */}
                  <div className="my-6 rounded-lg overflow-hidden border border-border shadow-md">
                    <img
                      src="/assets/images/bloat-guide-infographic-3-food-grid.png"
                      alt="High-FODMAP Foods Quick Reference Guide: visual grid showing fruits (apples, pears, mangoes, watermelon, peaches, plums), vegetables (onions, garlic, asparagus, cauliflower, mushrooms, snow peas), grains (wheat, rye, barley), legumes (beans, lentils, chickpeas), dairy products, and sweeteners to avoid"
                      className="w-full h-auto"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Section 3: Medical Conditions */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                  <h2 className="text-2xl font-bold">Medical Conditions</h2>
                </div>

                <p className="text-muted-foreground text-base">Sometimes, bloating is a symptom of an underlying health issue.</p>

                <div className="space-y-3 mt-4">
                  <div className="border-l-4 border-red-400 pl-4 py-2">
                    <p className="font-medium text-base">IBS (Irritable Bowel Syndrome)</p>
                    <p className="text-sm text-muted-foreground mt-1">Up to 90% of IBS patients experience bloating. Involves slow digestion and sensitive nerves.</p>
                  </div>

                  <div className="border-l-4 border-orange-400 pl-4 py-2">
                    <p className="font-medium text-base">SIBO (Small Intestinal Bacterial Overgrowth)</p>
                    <p className="text-sm text-muted-foreground mt-1">Bacteria growing in the wrong place, fermenting food too early.</p>
                  </div>

                  <div className="border-l-4 border-blue-400 pl-4 py-2">
                    <p className="font-medium text-base">Lactose Intolerance</p>
                    <p className="text-sm text-muted-foreground mt-1">Your body doesn't make enough lactase enzyme to digest milk sugar.</p>
                  </div>

                  <div className="border-l-4 border-purple-400 pl-4 py-2">
                    <p className="font-medium text-base">Celiac Disease</p>
                    <p className="text-sm text-muted-foreground mt-1">Autoimmune disorder where gluten damages the small intestine.</p>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Section 4: Immediate Relief */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-7 h-7 text-primary" />
                  <h2 className="text-2xl font-bold">Immediate Relief (Right Now!)</h2>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                    <p className="font-medium text-green-900 dark:text-green-100 mb-2 text-base">🚶‍♀️ Go for a Walk</p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      A gentle 10-15 minute walk after a meal stimulates your digestive system and moves gas along.
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
                    <p className="font-medium text-purple-900 dark:text-purple-100 mb-2 text-base">🧘‍♀️ Try Yoga Poses</p>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                      <strong>Wind-Relieving Pose:</strong> Lie on back, hug knees to chest, rock gently.
                    </p>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      <strong>Child's Pose:</strong> Kneel, sit on heels, fold forward.
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
                    <p className="font-medium text-orange-900 dark:text-orange-100 mb-2 text-base">🔥 Apply Heat</p>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Heating pad or hot water bottle relaxes intestinal muscles, easing cramping.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-base">💆‍♀️ Belly Massage</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Gentle clockwise circular motion following your large intestine's path.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Section 5: Long-term Prevention */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-7 h-7 text-primary" />
                  <h2 className="text-2xl font-bold">Long-Term Prevention</h2>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-base">Eat Smaller, More Frequent Meals</p>
                      <p className="text-sm text-muted-foreground mt-1">5-6 smaller meals instead of 3 large ones prevents overwhelming your digestive system.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-base">Chew Your Food Slowly</p>
                      <p className="text-sm text-muted-foreground mt-1">Aim for 20-30 chews per bite. Digestion begins in your mouth!</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-base">Drink Between Meals, Not During</p>
                      <p className="text-sm text-muted-foreground mt-1">Too much liquid dilutes stomach acid, making digestion less efficient.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-base">Avoid Carbonated Drinks & Straws</p>
                      <p className="text-sm text-muted-foreground mt-1">Both put extra gas/air directly into your stomach.</p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Section 6: Natural Remedies */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-7 h-7 text-primary" />
                  <h2 className="text-2xl font-bold">Natural Helpers & Supplements</h2>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-2 text-base">🌱 Peppermint Oil ⭐</p>
                    <p className="text-sm text-muted-foreground">Relaxes intestinal muscles. Take enteric-coated capsules or drink peppermint tea.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-2 text-base">🫚 Ginger</p>
                    <p className="text-sm text-muted-foreground">Speeds up stomach emptying and reduces inflammation. Try ginger tea or fresh ginger in meals.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-2 text-base">🦠 Probiotics</p>
                    <p className="text-sm text-muted-foreground">Balance gut bacteria. Found in yogurt, kefir, kimchi. Look for Bifidobacterium and Lactobacillus strains.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-2 text-base">💊 Digestive Enzymes</p>
                    <p className="text-sm text-muted-foreground">Lactase (Lactaid) for dairy, Alpha-galactosidase (Beano) for beans/veggies.</p>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Section 7: When to Worry */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                  <h2 className="text-2xl font-bold">When to See a Doctor</h2>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 space-y-3">
                    <p className="font-semibold text-red-900 dark:text-red-100 text-base">⚠️ See a Doctor ASAP if you have:</p>
                    <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                      <li className="flex gap-2"><span>🔴</span> Blood in your stool (red or black/tarry)</li>
                      <li className="flex gap-2"><span>🔴</span> Severe, unbearable abdominal pain</li>
                      <li className="flex gap-2"><span>🔴</span> Unintentional weight loss</li>
                      <li className="flex gap-2"><span>🔴</span> High fever</li>
                      <li className="flex gap-2"><span>🔴</span> Vomiting that won't stop</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 space-y-3">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 text-base">📅 Schedule an appointment if:</p>
                    <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                      <li className="flex gap-2"><span>🟡</span> Bloating is persistent (most days for 2-3+ weeks)</li>
                      <li className="flex gap-2"><span>🟡</span> It's getting worse over time</li>
                      <li className="flex gap-2"><span>🟡</span> It's seriously impacting your life</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Section 8: Action Plan */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🕵️</span>
                  <h2 className="text-2xl font-bold">Your Action Plan</h2>
                </div>

                <p className="text-muted-foreground text-base">
                  The key to beating bloating is finding <strong>YOUR personal triggers</strong>. What bothers your friend might be fine for you.
                </p>

                <div className="space-y-4 mt-6">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <p className="font-semibold mb-2 text-base">📝 STEP 1: Keep a Food & Symptom Diary</p>
                    <p className="text-sm text-muted-foreground mb-3">For 2 weeks, write down:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span>•</span> Everything you eat and drink (with times)</li>
                      <li className="flex gap-2"><span>•</span> When you feel bloated (1-10 scale)</li>
                      <li className="flex gap-2"><span>•</span> Stress levels and sleep quality</li>
                      <li className="flex gap-2"><span>•</span> Bowel movements</li>
                    </ul>
                    <p className="text-sm font-medium text-primary mt-3">💡 Use Gut Guardian to track this!</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-semibold mb-2 text-base">🔍 STEP 2: Look for Patterns</p>
                    <p className="text-sm text-muted-foreground">
                      After two weeks, review your diary. Do you see bloating every time you eat onions? After pasta meals?
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="font-semibold mb-2 text-base">🧪 STEP 3: Try an Elimination Diet</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      ⚠️ Best done with a doctor or dietitian.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><strong>Phase 1 (3-6 weeks):</strong> Avoid all high-FODMAP foods</li>
                      <li className="flex gap-2"><strong>Phase 2:</strong> Slowly reintroduce one group at a time</li>
                      <li className="flex gap-2"><strong>Phase 3:</strong> Create a personalized diet avoiding only YOUR triggers</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Key Takeaways */}
              <section className="space-y-4 pb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">✨</span>
                  Key Takeaways
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-3 text-base">
                    <span className="text-primary text-xl">💡</span>
                    <p>Bloating is usually caused by gas from gut bacteria fermenting undigested food (especially FODMAPs).</p>
                  </div>
                  <div className="flex gap-3 text-base">
                    <span className="text-primary text-xl">💡</span>
                    <p>Simple lifestyle changes like eating slowly, walking, and managing stress can make a huge difference.</p>
                  </div>
                  <div className="flex gap-3 text-base">
                    <span className="text-primary text-xl">💡</span>
                    <p>You are your own best doctor. Tracking your food and symptoms is your most powerful tool.</p>
                  </div>
                  <div className="flex gap-3 text-base">
                    <span className="text-primary text-xl">💡</span>
                    <p>Don't be afraid to ask for help. If bloating is severe or worrying, see a doctor or dietitian.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
