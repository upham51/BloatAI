import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface BloatingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BloatingGuideModal({ isOpen, onClose }: BloatingGuideModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
        {/* Floating X Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-lg hover:bg-muted transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Close guide"
        >
          <X className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-full">
          <div className="p-8 pb-16 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3 pt-4">
              <h1 className="text-4xl font-bold text-primary">
                🎈 The Complete Guide to Bloating
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Feeling like you have a balloon in your belly after eating? You're not alone.
              </p>
            </div>

            {/* What is Bloating */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📖</span>
                <h2 className="text-2xl font-bold text-foreground">What Exactly is Bloating?</h2>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed">
                When you feel bloated, your belly feels <strong>full, tight, stretched</strong>, and sometimes even looks bigger. It's like your intestines are throwing a party you didn't invite them to.
              </p>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <span className="text-2xl">🔬</span>
                  Three Things Happening Inside You
                </h3>

                {/* INFOGRAPHIC #1: 3 Types of Bloating */}
                <div className="my-6 rounded-2xl overflow-hidden border-2 border-border shadow-xl">
                  <img
                    src="/assets/images/bloat-guide-infographic-1-three-types.png"
                    alt="3 Types of Bloating: Gas Bubble Effect, Traffic Jam (Slow Motility), and Overactive Alarm System illustrated with digestive system diagrams"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-2 border-pink-200 dark:border-pink-900 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-pink-900 dark:text-pink-100 mb-2 flex items-center gap-2">
                    🩸 Note for People Who Menstruate
                  </p>
                  <p className="text-sm text-pink-800 dark:text-pink-200 leading-relaxed">
                    About <strong>3 out of 4 women</strong> feel more bloated before or during their period. Estrogen causes water retention and makes your gut more sensitive to gas.
                  </p>
                </div>
              </div>
            </section>

            {/* Food Culprits */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍎</span>
                <h2 className="text-2xl font-bold text-foreground">The Food Culprits (FODMAPs)</h2>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed">
                The #1 cause of bloating is <strong>what you eat</strong>. Specifically, a group of foods called <strong>FODMAPs</strong>.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-5 space-y-2">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">🧪 FODMAPs Explained Simply</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  Short-chain carbohydrates your small intestine has trouble absorbing. They pull water into your gut and get fermented by bacteria, producing gas.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">What Happens Step-by-Step</h3>

                {/* INFOGRAPHIC #2: FODMAP Journey */}
                <div className="my-6 rounded-2xl overflow-hidden border-2 border-border shadow-xl">
                  <img
                    src="/assets/images/bloat-guide-infographic-2-fodmap-journey.png"
                    alt="Your FODMAP Journey from bite to bloat: showing the digestive process from eating high-FODMAP food through small intestine absorption failure to large intestine fermentation and resulting gas and bloating"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">🚨 Common High-FODMAP Foods</h3>

                {/* INFOGRAPHIC #3: High-FODMAP Foods Grid */}
                <div className="my-6 rounded-2xl overflow-hidden border-2 border-border shadow-xl">
                  <img
                    src="/assets/images/bloat-guide-infographic-3-food-grid.png"
                    alt="High-FODMAP Foods Quick Reference Guide: visual grid showing fruits (apples, pears, mangoes, watermelon, peaches, plums), vegetables (onions, garlic, asparagus, cauliflower, mushrooms, snow peas), grains (wheat, rye, barley), legumes (beans, lentils, chickpeas), dairy products, and sweeteners to avoid"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </section>

            {/* Medical Conditions */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">❤️</span>
                <h2 className="text-2xl font-bold text-foreground">Medical Conditions</h2>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed">
                Sometimes, bloating is a symptom of an underlying health issue.
              </p>

              <div className="grid gap-4">
                <div className="border-l-4 border-red-400 pl-5 py-3 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20">
                  <p className="font-semibold text-lg mb-1">IBS (Irritable Bowel Syndrome)</p>
                  <p className="text-sm text-muted-foreground">Up to 90% of IBS patients experience bloating. Involves slow digestion and sensitive nerves.</p>
                </div>

                <div className="border-l-4 border-orange-400 pl-5 py-3 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20">
                  <p className="font-semibold text-lg mb-1">SIBO (Small Intestinal Bacterial Overgrowth)</p>
                  <p className="text-sm text-muted-foreground">Bacteria growing in the wrong place, fermenting food too early.</p>
                </div>

                <div className="border-l-4 border-blue-400 pl-5 py-3 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                  <p className="font-semibold text-lg mb-1">Lactose Intolerance</p>
                  <p className="text-sm text-muted-foreground">Your body doesn't make enough lactase enzyme to digest milk sugar.</p>
                </div>

                <div className="border-l-4 border-purple-400 pl-5 py-3 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20">
                  <p className="font-semibold text-lg mb-1">Celiac Disease</p>
                  <p className="text-sm text-muted-foreground">Autoimmune disorder where gluten damages the small intestine.</p>
                </div>
              </div>
            </section>

            {/* Immediate Relief */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <h2 className="text-2xl font-bold text-foreground">Immediate Relief (Right Now!)</h2>
              </div>

              <div className="grid gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-900 rounded-2xl p-5">
                  <p className="font-semibold text-lg text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    🚶‍♀️ Go for a Walk
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    A gentle 10-15 minute walk after a meal stimulates your digestive system and moves gas along.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-5">
                  <p className="font-semibold text-lg text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    🧘‍♀️ Try Yoga Poses
                  </p>
                  <p className="text-sm text-purple-800 dark:text-purple-200 mb-2 leading-relaxed">
                    <strong>Wind-Relieving Pose:</strong> Lie on back, hug knees to chest, rock gently.
                  </p>
                  <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                    <strong>Child's Pose:</strong> Kneel, sit on heels, fold forward.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-200 dark:border-orange-900 rounded-2xl p-5">
                  <p className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                    🔥 Apply Heat
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                    Heating pad or hot water bottle relaxes intestinal muscles, easing cramping.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-5">
                  <p className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    💆‍♀️ Belly Massage
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Gentle clockwise circular motion following your large intestine's path.
                  </p>
                </div>
              </div>
            </section>

            {/* Long-term Prevention */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💡</span>
                <h2 className="text-2xl font-bold text-foreground">Long-Term Prevention</h2>
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Eat Smaller, More Frequent Meals</p>
                    <p className="text-sm text-muted-foreground">5-6 smaller meals instead of 3 large ones prevents overwhelming your digestive system.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Chew Your Food Slowly</p>
                    <p className="text-sm text-muted-foreground">Aim for 20-30 chews per bite. Digestion begins in your mouth!</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Drink Between Meals, Not During</p>
                    <p className="text-sm text-muted-foreground">Too much liquid dilutes stomach acid, making digestion less efficient.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Avoid Carbonated Drinks & Straws</p>
                    <p className="text-sm text-muted-foreground">Both put extra gas/air directly into your stomach.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Natural Helpers */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💊</span>
                <h2 className="text-2xl font-bold text-foreground">Natural Helpers & Supplements</h2>
              </div>

              <div className="grid gap-4">
                <div className="border-2 border-border rounded-2xl p-5 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-lg mb-2">🌱 Peppermint Oil ⭐</p>
                  <p className="text-sm text-muted-foreground">Relaxes intestinal muscles. Take enteric-coated capsules or drink peppermint tea.</p>
                </div>

                <div className="border-2 border-border rounded-2xl p-5 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-lg mb-2">🫚 Ginger</p>
                  <p className="text-sm text-muted-foreground">Speeds up stomach emptying and reduces inflammation. Try ginger tea or fresh ginger in meals.</p>
                </div>

                <div className="border-2 border-border rounded-2xl p-5 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-lg mb-2">🦠 Probiotics</p>
                  <p className="text-sm text-muted-foreground">Balance gut bacteria. Found in yogurt, kefir, kimchi. Look for Bifidobacterium and Lactobacillus strains.</p>
                </div>

                <div className="border-2 border-border rounded-2xl p-5 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-lg mb-2">💊 Digestive Enzymes</p>
                  <p className="text-sm text-muted-foreground">Lactase (Lactaid) for dairy, Alpha-galactosidase (Beano) for beans/veggies.</p>
                </div>
              </div>
            </section>

            {/* When to See a Doctor */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <h2 className="text-2xl font-bold text-foreground">When to See a Doctor</h2>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-2 border-red-200 dark:border-red-900 rounded-2xl p-6 space-y-3">
                <p className="font-bold text-red-900 dark:text-red-100 text-lg">⚠️ See a Doctor ASAP if you have:</p>
                <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🔴</span>
                    <span>Blood in your stool (red or black/tarry)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🔴</span>
                    <span>Severe, unbearable abdominal pain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🔴</span>
                    <span>Unintentional weight loss</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🔴</span>
                    <span>High fever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🔴</span>
                    <span>Vomiting that won't stop</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-200 dark:border-yellow-900 rounded-2xl p-6 space-y-3">
                <p className="font-bold text-yellow-900 dark:text-yellow-100 text-lg">📅 Schedule an appointment if:</p>
                <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🟡</span>
                    <span>Bloating is persistent (most days for 2-3+ weeks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🟡</span>
                    <span>It's getting worse over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🟡</span>
                    <span>It's seriously impacting your life</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Action Plan */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🕵️</span>
                <h2 className="text-2xl font-bold text-foreground">Your Action Plan</h2>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed">
                The key to beating bloating is finding <strong>YOUR personal triggers</strong>. What bothers your friend might be fine for you.
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-6 py-4 bg-gradient-to-r from-primary/5 to-transparent">
                  <p className="font-bold text-xl mb-2">📝 STEP 1: Keep a Food & Symptom Diary</p>
                  <p className="text-sm text-muted-foreground mb-3">For 2 weeks, write down:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Everything you eat and drink (with times)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>When you feel bloated (1-10 scale)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Stress levels and sleep quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Bowel movements</span>
                    </li>
                  </ul>
                  <p className="text-sm font-semibold text-primary mt-3 flex items-center gap-2">
                    💡 Use Gut Guardian to track this!
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-6 py-4 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
                  <p className="font-bold text-xl mb-2">🔍 STEP 2: Look for Patterns</p>
                  <p className="text-sm text-muted-foreground">
                    After two weeks, review your diary. Do you see bloating every time you eat onions? After pasta meals?
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-6 py-4 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20">
                  <p className="font-bold text-xl mb-2">🧪 STEP 3: Try an Elimination Diet</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    ⚠️ Best done with a doctor or dietitian.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span><strong>Phase 1 (3-6 weeks):</strong> Avoid all high-FODMAP foods</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span><strong>Phase 2:</strong> Slowly reintroduce one group at a time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span><strong>Phase 3:</strong> Create a personalized diet avoiding only YOUR triggers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Key Takeaways */}
            <section className="space-y-4 border-t-2 border-border pt-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">✨</span>
                Key Takeaways
              </h2>
              <div className="grid gap-4">
                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-base leading-relaxed">Bloating is usually caused by gas from gut bacteria fermenting undigested food (especially FODMAPs).</p>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-base leading-relaxed">Simple lifestyle changes like eating slowly, walking, and managing stress can make a huge difference.</p>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-base leading-relaxed">You are your own best doctor. Tracking your food and symptoms is your most powerful tool.</p>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-base leading-relaxed">Don't be afraid to ask for help. If bloating is severe or worrying, see a doctor or dietitian.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
