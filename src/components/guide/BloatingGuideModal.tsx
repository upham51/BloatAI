import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
          <div className="p-6 md:p-8 pb-16 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3 pt-4">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                The Complete Guide to Eliminating Bloating
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Foods, Remedies & Relief Strategies
              </p>
            </div>

            <Accordion type="multiple" className="space-y-4" defaultValue={["understanding"]}>
              
              {/* Understanding Bloating */}
              <AccordionItem value="understanding" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Understanding Bloating
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Bloating affects approximately 25-30% of the general population, making it one of the most common digestive complaints. Understanding the physiological basis of what's happening in your body will help you identify patterns and take targeted action.
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">What Causes Bloating Physiologically</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Bloating occurs when your gastrointestinal tract fills with gas or air, creating abdominal discomfort and a sensation of fullness or distension. This can happen through several mechanisms:
                    </p>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Gas Production from Fermentation</p>
                        <p className="text-sm text-muted-foreground">When certain carbohydrates (especially FODMAPs) reach your colon undigested, your gut bacteria ferment them, producing gas and water. This fermentation is the primary driver of bloating in sensitive individuals.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Slowed Gastric Emptying</p>
                        <p className="text-sm text-muted-foreground">When your stomach empties food too slowly into the small intestine, it can create a sense of fullness and pressure. Certain foods and stress can significantly slow this process.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Increased Intestinal Permeability</p>
                        <p className="text-sm text-muted-foreground">A compromised gut lining may trigger inflammatory responses that contribute to bloating sensations.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Dysbiosis</p>
                        <p className="text-sm text-muted-foreground">An imbalanced gut microbiota (too many gas-producing bacteria) can increase fermentation and bloating.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Swallowing Air</p>
                        <p className="text-sm text-muted-foreground">Eating too quickly, chewing gum, or sipping through straws introduces excess air into your digestive tract.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Bloating vs. Distension vs. Gas</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-semibold">Term</th>
                            <th className="text-left p-3 font-semibold">Definition</th>
                            <th className="text-left p-3 font-semibold">Typical Experience</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Bloating</td>
                            <td className="p-3 text-muted-foreground">Uncomfortable fullness sensation</td>
                            <td className="p-3 text-muted-foreground">Feeling overly full even after small portions</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Distension</td>
                            <td className="p-3 text-muted-foreground">Visible abdominal swelling</td>
                            <td className="p-3 text-muted-foreground">Clothes fit tighter; stomach appears noticeably fuller</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Gas</td>
                            <td className="p-3 text-muted-foreground">Accumulation of air/gas in GI tract</td>
                            <td className="p-3 text-muted-foreground">Burping, flatulence, or internal pressure</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">When to See a Doctor vs. Self-Manage</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                        <p className="font-semibold mb-2 text-destructive">Seek medical evaluation if:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Bloating with unexplained weight loss</li>
                          <li>• Persistent bloating after 4+ weeks of dietary changes</li>
                          <li>• Severe abdominal pain, fever, or vomiting</li>
                          <li>• Bowel habit changes lasting more than 2 weeks</li>
                          <li>• Bloating interfering with daily activities</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                        <p className="font-semibold mb-2 text-primary">Self-management is appropriate for:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Occasional bloating related to specific foods</li>
                          <li>• Bloating that responds to lifestyle modifications</li>
                          <li>• Mild to moderate symptoms without concerning additional symptoms</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Immediate Relief */}
              <AccordionItem value="immediate-relief" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Immediate Relief Strategies
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    When bloating strikes, these science-backed techniques can provide relief within 15-60 minutes. The combination works best—try stacking multiple strategies for faster results.
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Physical Positions & Movements</h3>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Child's Pose (5-10 minutes)</p>
                        <p className="text-sm text-muted-foreground mb-2">Kneel on a mat, bring your forehead to the ground, and extend your arms forward.</p>
                        <p className="text-xs text-primary">Why it works: Gently compresses the abdomen and encourages gas movement</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Recumbent Figure-4 Stretch (30-60 seconds per side)</p>
                        <p className="text-sm text-muted-foreground mb-2">Lie on your back, cross one knee over your body toward the opposite shoulder.</p>
                        <p className="text-xs text-primary">Why it works: Directly stretches the colon and facilitates gas passage</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Gentle Walking (10-15 minutes)</p>
                        <p className="text-sm text-muted-foreground mb-2">Leisurely pacing, not vigorous exercise. Best within 5 minutes after meals.</p>
                        <p className="text-xs text-primary">Why it works: Mechanical movement helps move gas through your intestines</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Legs-Up-The-Wall Pose (5 minutes)</p>
                        <p className="text-sm text-muted-foreground mb-2">Lie on your back with legs extended up a wall at 90-degree angles.</p>
                        <p className="text-xs text-primary">Why it works: Inversion helps gas rise and exit; relaxes abdominal muscles</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">The 3-Minute Bloating Relief Massage</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li><span className="font-medium text-foreground">1. Starting position:</span> Lie on your back with knees bent</li>
                        <li><span className="font-medium text-foreground">2. Direction matters:</span> Always massage in a clockwise pattern (follows the path of the colon)</li>
                        <li><span className="font-medium text-foreground">3. Pressure:</span> Use firm but gentle pressure with your fingertips or palm</li>
                        <li><span className="font-medium text-foreground">4. Path:</span> Start at lower right side → move upward along right side → cross horizontally below ribs → move downward along left side → finish at lower left side</li>
                        <li><span className="font-medium text-foreground">5. Duration:</span> Spend 30-45 seconds on each section, repeat 2-3 times total</li>
                      </ol>
                      <p className="text-xs text-primary mt-3">Research shows abdominal massage can provide relief within 15-20 minutes for mild bloating.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Diaphragmatic (Belly) Breathing</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li>1. Sit comfortably or lie on your back</li>
                        <li>2. Place one hand on your chest, one on your belly</li>
                        <li>3. Breathe in slowly through your nose for a count of 4, allowing your belly (not chest) to expand</li>
                        <li>4. Hold for a count of 4</li>
                        <li>5. Exhale slowly through your mouth for a count of 6</li>
                        <li>6. Pause for a count of 2</li>
                        <li>7. Repeat 10-15 times</li>
                      </ol>
                      <p className="text-xs text-primary mt-3">Deep breathing activates your parasympathetic nervous system, which promotes digestion and reduces bloating sensation.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Heat Therapy</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply a heating pad, warm water bottle, or take a warm bath for 10-20 minutes. Heat relaxes abdominal muscles and may increase blood flow to facilitate digestion. Combine with gentle massage for enhanced relief.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Herbal Teas for Immediate Relief</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-2">Peppermint Tea</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Dosage:</span> 1 cup, 2-3 times daily</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Timing:</span> 30 min before or after meals</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Works in:</span> 15-30 minutes</p>
                        <p className="text-xs text-primary">Menthol relaxes smooth muscle in your GI tract</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-2">Ginger Tea</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Dosage:</span> 1-2 slices fresh ginger, steeped 5-10 min</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Timing:</span> 30 min before meals</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Works in:</span> 20-45 minutes</p>
                        <p className="text-xs text-primary">Increases gastric emptying rate, reducing fullness</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-2">Fennel Seed Tea</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Dosage:</span> 1 tsp seeds per cup, steeped 10 min</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Timing:</span> After meals</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Works in:</span> 15-30 minutes</p>
                        <p className="text-xs text-primary">Carminative properties that reduce gas production</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-2">Chamomile Tea</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Dosage:</span> 1 cup, 2-3 times daily</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Best for:</span> Bloating with anxiety or stress</p>
                        <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Works in:</span> 20-30 minutes</p>
                        <p className="text-xs text-primary">Anti-inflammatory properties reduce visceral sensitivity</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Foods That Fight Bloating */}
              <AccordionItem value="anti-bloat-foods" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Foods That Fight Bloating
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Anti-Inflammatory Foods</h3>
                    <p className="text-sm text-muted-foreground">These foods reduce the inflammatory response that can increase bloating sensation.</p>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Leafy Greens (Spinach, Kale, Arugula)</p>
                        <p className="text-sm text-muted-foreground">High in magnesium, which supports muscle relaxation in the GI tract. Cook rather than eat raw to reduce bulk.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Fatty Fish (Salmon, Mackerel, Sardines)</p>
                        <p className="text-sm text-muted-foreground">Omega-3 fatty acids reduce inflammatory markers. Serve 3-4 oz, 2-3 times weekly.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Berries (Blueberries, Raspberries, Strawberries)</p>
                        <p className="text-sm text-muted-foreground">Anthocyanins provide strong anti-inflammatory action. Limit to ½-1 cup per day.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Ginger & Turmeric</p>
                        <p className="text-sm text-muted-foreground">Gingerols and curcumin have powerful anti-inflammatory properties. Pair turmeric with black pepper to increase absorption by up to 2000%.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Naturally Diuretic Foods</h3>
                    <p className="text-sm text-muted-foreground">These foods promote gentle fluid movement, reducing water retention that can exacerbate bloating.</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Cucumber</p>
                        <p className="text-xs text-muted-foreground">High water content, mild diuretic effect</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Watermelon</p>
                        <p className="text-xs text-muted-foreground">Natural diuretic with 92% water content</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Lemon Water</p>
                        <p className="text-xs text-muted-foreground">Gentle diuretic effect; aids digestion</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Asparagus</p>
                        <p className="text-xs text-muted-foreground">Contains asparagine, a natural diuretic</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Prebiotic vs. Probiotic Foods</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border bg-card">
                        <p className="font-semibold mb-2">Best Prebiotic Foods</p>
                        <p className="text-xs text-muted-foreground mb-2">Introduce slowly to minimize initial bloating:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Cooked onions (small amounts)</li>
                          <li>• Garlic (cooked)</li>
                          <li>• Green banana</li>
                          <li>• Oats (rolled, ¾ cup max)</li>
                          <li>• Asparagus</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg border bg-card">
                        <p className="font-semibold mb-2">Best Probiotic Foods</p>
                        <p className="text-xs text-muted-foreground mb-2">Naturally fermented, no added sugar:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Yogurt (plain, unsweetened, live cultures)</li>
                          <li>• Kefir</li>
                          <li>• Sauerkraut (raw, unpasteurized)</li>
                          <li>• Miso paste</li>
                          <li>• Tempeh</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Meal Timing & Portion Strategies</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Frequent, Smaller Meals</p>
                        <p className="text-sm text-muted-foreground">5-6 smaller meals instead of 3 large ones reduces volume in stomach at any given time.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Intermeal Spacing</p>
                        <p className="text-sm text-muted-foreground">Wait at least 3 hours between main meals to allow adequate time for gastric emptying.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">The 80/20 Rule</p>
                        <p className="text-sm text-muted-foreground">Eat slowly until you're 80% full, then stop. It takes 20 minutes for satiety signals to reach your brain.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Foods & Triggers to Avoid */}
              <AccordionItem value="foods-to-avoid" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Foods & Triggers to Avoid
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">FODMAPs: The Primary Bloating Culprit</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      FODMAP stands for Fermentable Oligosaccharides, Disaccharides, Monosaccharides, And Polyols. These are short-chain carbohydrates that your small intestine doesn't absorb well. Research shows 86% of IBS patients who followed a low-FODMAP diet reported substantial improvement.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left p-3 font-semibold">Category</th>
                            <th className="text-left p-3 font-semibold">Avoid</th>
                            <th className="text-left p-3 font-semibold">Choose Instead</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b">
                            <td className="p-3 font-medium text-foreground">Fruits</td>
                            <td className="p-3">Apples, pears, stone fruits, mangoes</td>
                            <td className="p-3">Bananas, blueberries, strawberries, grapes</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium text-foreground">Vegetables</td>
                            <td className="p-3">Onions, garlic, mushrooms, asparagus</td>
                            <td className="p-3">Lettuce, carrots, spinach, cucumbers</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium text-foreground">Grains</td>
                            <td className="p-3">Wheat, barley, rye bread</td>
                            <td className="p-3">Rice, oats (¾ cup or less), GF bread</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium text-foreground">Dairy</td>
                            <td className="p-3">Milk, soft cheeses, ice cream</td>
                            <td className="p-3">Lactose-free milk, hard cheeses</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium text-foreground">Sweeteners</td>
                            <td className="p-3">Honey, HFCS, sorbitol, xylitol</td>
                            <td className="p-3">Maple syrup (small amounts)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium text-foreground">Legumes</td>
                            <td className="p-3">Beans, lentils, chickpeas</td>
                            <td className="p-3">Tofu, tempeh</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-primary mt-2">
                      Tip: Low-FODMAP doesn't mean zero FODMAP. The restrictive phase typically lasts 4-6 weeks, then foods are systematically reintroduced.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sugar Alcohols (Polyols)</h3>
                    <p className="text-sm text-muted-foreground">
                      Hidden in many "diet" and "sugar-free" products. They're poorly absorbed and highly fermentable. Look for: sorbitol, xylitol, maltitol, erythritol on labels.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Carbonation</h3>
                    <p className="text-sm text-muted-foreground">
                      Carbon dioxide gas directly enters your digestive tract. Avoid soda, sparkling water, kombucha, and carbonated energy drinks. Try still water or herbal tea instead.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Hidden Sodium Sources</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Excess sodium causes water retention. Target less than 2000 mg daily for bloating management.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Frozen meals', 'Canned soups', 'Deli meats', 'Restaurant foods', 'Bread', 'Condiments', 'Processed cheese'].map((item) => (
                        <span key={item} className="px-3 py-1 rounded-full bg-muted text-xs">{item}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Surprising "Healthy" Foods That Cause Bloating</h3>
                    <div className="grid gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Raw Vegetables</p>
                        <p className="text-xs text-muted-foreground">Raw plant cells are harder to break down. Solution: Cook vegetables lightly.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Whole Grains</p>
                        <p className="text-xs text-muted-foreground">Sudden increase in fiber increases gas. Solution: Introduce slowly, cook thoroughly.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Large Amounts of Nuts</p>
                        <p className="text-xs text-muted-foreground">High in fiber and fat. Solution: Limit to 1 oz at a time, soak if possible.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Plant-Based Meat Substitutes</p>
                        <p className="text-xs text-muted-foreground">Often contain high FODMAP ingredients. Solution: Check labels or use whole food options.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Over-the-Counter Solutions */}
              <AccordionItem value="otc-solutions" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Over-the-Counter Solutions
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Simethicone (Gas-X)</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground mb-2">Breaks surface tension of gas bubbles, allowing them to be expelled more easily.</p>
                      <p className="text-xs"><span className="font-medium">Dosage:</span> 40-80 mg every 6 hours, max 240 mg daily</p>
                      <p className="text-xs"><span className="font-medium">Works in:</span> 30-60 minutes</p>
                      <p className="text-xs text-primary mt-2">Very safe (not systemically absorbed), no interactions with other medications.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Digestive Enzymes</h3>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Lactase (for dairy)</p>
                        <p className="text-xs text-muted-foreground">1-2 tablets with first bite of dairy. 70-80% see significant improvement.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Alpha-Galactosidase (Beano - for beans/legumes)</p>
                        <p className="text-xs text-muted-foreground">2-3 tablets with first bite. 50-80% reduction in gas from beans and cruciferous vegetables.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Broad-spectrum (Protease/Lipase/Amylase)</p>
                        <p className="text-xs text-muted-foreground">1-2 capsules with meals. For general digestive insufficiency.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Activated Charcoal</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground mb-2">Binds to gases and compounds in your intestines, potentially reducing bloating and odor.</p>
                      <p className="text-xs"><span className="font-medium">Dosage:</span> 500-1000 mg, 1-2 times daily</p>
                      <p className="text-xs"><span className="font-medium">Important:</span> Take 2+ hours away from medications</p>
                      <p className="text-xs text-destructive mt-2">Use sparingly. Can cause constipation and interfere with nutrient absorption.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Laxatives (for constipation-related bloating)</h3>
                    <div className="grid gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Osmotic (MiraLAX)</p>
                        <p className="text-xs text-muted-foreground">Gentle, not addictive, safe for long-term use. 12-72 hours onset.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Stimulant (Senna)</p>
                        <p className="text-xs text-muted-foreground">Faster-acting (6-12 hours). Risk of dependence—don't use regularly without supervision.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Stool Softeners (Docusate)</p>
                        <p className="text-xs text-muted-foreground">Gentle, non-habit forming. Best for mild constipation.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Natural Remedies & Supplements */}
              <AccordionItem value="natural-remedies" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Natural Remedies & Supplements
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Evidence-Based Probiotic Strains</h3>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Bacillus subtilis BS50</p>
                        <p className="text-sm text-muted-foreground">47.4% improvement rate in bloating vs. 22.2% placebo. 2×10⁹ CFU daily for 4-6 weeks.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Lab4 Probiotic (Multi-strain)</p>
                        <p className="text-sm text-muted-foreground">25 billion CFU daily. Best for IBS-related bloating with irregular bowel habits.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Lactobacillus & Bifidobacterium strains</p>
                        <p className="text-sm text-muted-foreground">10-50 billion CFU daily for 4-12 weeks. General digestive wellness.</p>
                      </div>
                    </div>
                    <p className="text-xs text-primary">Plan for 4-6 weeks before evaluating effectiveness. Combine with prebiotic foods for best results.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Peppermint Oil</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground mb-3">The most evidence-based natural remedy for bloating and IBS. Menthol reduces spasms and cramping while increasing gas expulsion.</p>
                      <p className="text-xs"><span className="font-medium">Recommended:</span> Enteric-coated capsules, 180-240 mg, 2-3 times daily</p>
                      <p className="text-xs"><span className="font-medium">Timing:</span> 30-60 minutes before meals</p>
                      <p className="text-xs"><span className="font-medium">First dose:</span> Relief in 15-20 minutes</p>
                      <p className="text-xs text-muted-foreground mt-2">Caution if you have GERD (can relax lower esophageal sphincter).</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ginger</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground mb-3">Increases gastric emptying rate by 20-60%. Also has anti-inflammatory properties.</p>
                      <p className="text-xs"><span className="font-medium">Fresh:</span> 1-2 grams daily (½-1 inch root) as tea or in cooking</p>
                      <p className="text-xs"><span className="font-medium">Supplements:</span> 1000-2000 mg daily</p>
                      <p className="text-xs"><span className="font-medium">Timing:</span> 30 minutes before meals</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Magnesium for Digestive Health</h3>
                    <div className="grid gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Magnesium Glycinate</p>
                        <p className="text-xs text-muted-foreground">Best for general bloating. 200-400 mg daily. Gentle on stomach, highly absorbable.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Magnesium Citrate</p>
                        <p className="text-xs text-muted-foreground">Best for bloating with constipation. Mild osmotic effect helps bowel movements.</p>
                      </div>
                    </div>
                    <p className="text-xs text-primary">Start at 100-150 mg daily, increase gradually. Full benefit in 2-4 weeks.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Lifestyle Modifications */}
              <AccordionItem value="lifestyle" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Lifestyle Modifications
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">The Mindful Eating Framework</h3>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Eating Speed</p>
                        <p className="text-sm text-muted-foreground">Target 20-30 minutes per meal instead of 10-15. Use smaller forks, put fork down between bites, play slow music.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Chewing Thoroughly</p>
                        <p className="text-sm text-muted-foreground">20-30 chews per bite minimum. Foods should be nearly liquid before swallowing. Reduces gas production by 30-50%.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Awareness Eating</p>
                        <p className="text-sm text-muted-foreground">No screens during meals. Eat at table, not desk. Notice when you're 80% full and stop.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Posture During Meals</p>
                        <p className="text-sm text-muted-foreground">Sit upright, feet flat on floor. Avoid eating while lying down or slouching.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Stress Management & Digestion</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your gut-brain connection is powerful. Stress reduces digestive enzyme production, decreases motility, increases gut permeability, and heightens visceral sensitivity.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Vagus Nerve Stimulation</p>
                        <p className="text-xs text-muted-foreground">Humming, singing, or gargling for 30 seconds activates rest-and-digest function.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Box Breathing</p>
                        <p className="text-xs text-muted-foreground">Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 5-10 times before meals.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Meditation</p>
                        <p className="text-xs text-muted-foreground">Even 10 minutes daily reduces IBS symptoms by 25-50%.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Journaling</p>
                        <p className="text-xs text-muted-foreground">5-10 minutes writing about stress or food patterns reveals connections.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sleep Optimization for Gut Health</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Sleep deprivation alters microbiota, decreases motility, increases cortisol, and heightens sensitivity. Quality sleep reduces IBS symptoms by up to 30%.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Same bedtime and wake time daily (even weekends)</li>
                      <li>• 7-9 hours nightly minimum</li>
                      <li>• Last meal 2-3 hours before bed</li>
                      <li>• No screens before bed, cool dark room (65-68°F)</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Exercise Timing & Types</h3>
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <p className="font-semibold text-sm mb-2">Critical: Timing Matters</p>
                      <p className="text-xs text-muted-foreground">Intense exercise during digestion increases bloating. Wait 3+ hours after meals for any vigorous activity.</p>
                    </div>
                    <div className="grid gap-3 mt-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Gentle Walking (Best intervention)</p>
                        <p className="text-xs text-muted-foreground">10-15 minutes immediately after meals. 20-30% reduction in bloating.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Yin Yoga</p>
                        <p className="text-xs text-muted-foreground">30-45 minutes, 3+ hours after meals. Child's pose, supine twist excellent for bloating.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Prevention Protocols */}
              <AccordionItem value="prevention" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Prevention Protocols
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Daily Habits to Minimize Bloating</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <ol className="space-y-3 text-sm">
                        <li><span className="font-medium">Upon waking:</span> <span className="text-muted-foreground">8-16 oz room temperature water + 5 min diaphragmatic breathing</span></li>
                        <li><span className="font-medium">With breakfast:</span> <span className="text-muted-foreground">Mindful eating (30+ min, proper chewing) + probiotic food</span></li>
                        <li><span className="font-medium">Before lunch:</span> <span className="text-muted-foreground">5-10 min light movement + deep breathing</span></li>
                        <li><span className="font-medium">After lunch:</span> <span className="text-muted-foreground">15-minute leisurely walk</span></li>
                        <li><span className="font-medium">Afternoon:</span> <span className="text-muted-foreground">5-10 min stress management + hydration</span></li>
                        <li><span className="font-medium">Evening:</span> <span className="text-muted-foreground">Dinner 2-3 hours before bed + gentle stretching + herbal tea</span></li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Food Diary Tracking Tips</h3>
                    <p className="text-sm text-muted-foreground mb-2">What to track:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Specific foods eaten', 'Portion sizes', 'Timing', 'Preparation method', 'Stress level (1-10)', 'Water intake', 'Sleep quality', 'Exercise', 'Bloating severity'].map((item) => (
                        <span key={item} className="px-3 py-2 rounded-lg bg-muted text-xs text-center">{item}</span>
                      ))}
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-muted/50">
                      <p className="font-semibold text-sm mb-2">Timing of Bloating</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <span className="font-medium">Immediate (within 15 min):</span> Suggests food sensitivities</li>
                        <li>• <span className="font-medium">Delayed (1-2 hours):</span> Suggests volume/fermentation issues</li>
                        <li>• <span className="font-medium">Progressive (2-4 hours):</span> Suggests slow gastric emptying</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Elimination Diet Basics</h3>
                    <div className="grid gap-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Phase 1: Baseline (1 week)</p>
                        <p className="text-sm text-muted-foreground">Eat normally, track bloating severity daily. Establish baseline level.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Phase 2: Elimination (2-4 weeks)</p>
                        <p className="text-sm text-muted-foreground">Remove high-FODMAP foods. Some see improvement in 3-5 days, others need 2-4 weeks.</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold mb-1">Phase 3: Reintroduction (4-6 weeks)</p>
                        <p className="text-sm text-muted-foreground">Reintroduce one high-FODMAP food per week. Eat small portion for 3-4 days, track response.</p>
                      </div>
                    </div>
                    <p className="text-xs text-primary">Many people discover only 1-2 trigger food categories. Most can tolerate some high-FODMAP foods in small portions.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Quick Reference Tables */}
              <AccordionItem value="quick-reference" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Quick Reference Tables
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Best Anti-Bloating Foods</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left p-2 font-semibold">Food</th>
                            <th className="text-left p-2 font-semibold">Benefit</th>
                            <th className="text-left p-2 font-semibold">Portion</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Peppermint tea</td><td className="p-2">Gas relief, muscle relaxation</td><td className="p-2">1 cup, 2-3x daily</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Ginger</td><td className="p-2">Gastric emptying, anti-inflammatory</td><td className="p-2">½-1 inch daily</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Cooked spinach</td><td className="p-2">Magnesium, anti-inflammatory</td><td className="p-2">1 cup daily</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Salmon</td><td className="p-2">Omega-3, anti-inflammatory</td><td className="p-2">3-4 oz, 2-3x weekly</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Rice</td><td className="p-2">Low-FODMAP carbs</td><td className="p-2">¾ cup cooked</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Cooked carrots</td><td className="p-2">Low-FODMAP, soluble fiber</td><td className="p-2">1 cup daily</td></tr>
                          <tr><td className="p-2 font-medium text-foreground">Greek yogurt</td><td className="p-2">Probiotics, protein</td><td className="p-2">¾ cup daily</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Supplement Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left p-2 font-semibold">Supplement</th>
                            <th className="text-left p-2 font-semibold">Dosage</th>
                            <th className="text-left p-2 font-semibold">Onset</th>
                            <th className="text-left p-2 font-semibold">Evidence</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Peppermint oil</td><td className="p-2">180-240 mg, 2-3x daily</td><td className="p-2">15-30 min</td><td className="p-2">Very strong</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Ginger</td><td className="p-2">1-2 g daily</td><td className="p-2">30-60 min</td><td className="p-2">Strong</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Probiotics</td><td className="p-2">10-50 billion CFU</td><td className="p-2">4-6 weeks</td><td className="p-2">Moderate</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">Magnesium</td><td className="p-2">200-400 mg daily</td><td className="p-2">2-4 weeks</td><td className="p-2">Moderate</td></tr>
                          <tr><td className="p-2 font-medium text-foreground">Simethicone</td><td className="p-2">40-80 mg after meals</td><td className="p-2">30-60 min</td><td className="p-2">Moderate</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Relief Timeline</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left p-2 font-semibold">Timeline</th>
                            <th className="text-left p-2 font-semibold">Intervention</th>
                            <th className="text-left p-2 font-semibold">Expected Relief</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">5-15 min</td><td className="p-2">Herbal tea, breathing techniques</td><td className="p-2">10-30%</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">15-30 min</td><td className="p-2">Peppermint oil, massage, walking</td><td className="p-2">20-40%</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">30-60 min</td><td className="p-2">Ginger, simethicone, enzymes</td><td className="p-2">30-50%</td></tr>
                          <tr className="border-b"><td className="p-2 font-medium text-foreground">1-2 weeks</td><td className="p-2">Low-FODMAP diet, probiotic start</td><td className="p-2">60-80%</td></tr>
                          <tr><td className="p-2 font-medium text-foreground">4-12 weeks</td><td className="p-2">Full optimization</td><td className="p-2">80-95%</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* When to Seek Medical Help */}
              <AccordionItem value="medical-help" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  When to Seek Medical Help
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="p-4 rounded-lg border border-destructive bg-destructive/5">
                    <p className="font-semibold mb-3 text-destructive">Seek immediate medical attention if:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Severe abdominal pain (especially sudden onset)</li>
                      <li>• Vomiting or inability to eat</li>
                      <li>• Blood in stool or vomit</li>
                      <li>• Persistent fever</li>
                      <li>• Acute abdominal distension</li>
                      <li>• Signs of dehydration</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <p className="font-semibold mb-3 text-amber-600 dark:text-amber-400">Seek evaluation within 1-2 weeks if:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Bloating doesn't improve after 2-4 weeks of home interventions</li>
                      <li>• Bloating worsens progressively</li>
                      <li>• Unexplained weight loss (more than 5 lbs in 1 month)</li>
                      <li>• Bowel habit changes lasting more than 2 weeks</li>
                      <li>• Bloating interferes significantly with daily functioning</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Conditions That Mimic or Accompany Bloating</h3>
                    <div className="grid gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">IBS (Irritable Bowel Syndrome)</p>
                        <p className="text-xs text-muted-foreground">Abdominal pain, diarrhea or constipation, bloating. Recurrent pain 1+ day weekly for 3+ months.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">SIBO (Small Intestinal Bacterial Overgrowth)</p>
                        <p className="text-xs text-muted-foreground">Bloating, flatulence, diarrhea/constipation, sometimes brain fog. Diagnosed by breath test.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Food Intolerances</p>
                        <p className="text-xs text-muted-foreground">Lactose, fructose, or histamine intolerance can all present with bloating.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold text-sm">Celiac Disease</p>
                        <p className="text-xs text-muted-foreground">Autoimmune condition triggered by gluten. Bloating, diarrhea, weight loss, fatigue.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Questions to Ask Your Doctor</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>Could this be IBS, SIBO, or another GI condition?</li>
                      <li>Would you recommend a low-FODMAP diet trial?</li>
                      <li>Are there any medications contributing to bloating?</li>
                      <li>Would food sensitivity testing be helpful?</li>
                      <li>Should I see a gastroenterologist or registered dietitian?</li>
                      <li>Do I need any testing (breath test, blood work, endoscopy)?</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Tips for Success */}
              <AccordionItem value="success-tips" className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-xl font-bold hover:no-underline py-4">
                  Tips for Success
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Maximizing Your Tracking</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><span className="font-medium text-foreground">Consistency is key:</span> Track for at least 2 weeks for patterns to emerge</li>
                      <li><span className="font-medium text-foreground">Be specific:</span> "Spinach, chicken, olive oil, lemon juice" not just "salad"</li>
                      <li><span className="font-medium text-foreground">Include context:</span> Stress level, sleep quality, exercise, and water intake matter as much as food</li>
                      <li><span className="font-medium text-foreground">Notice timing:</span> When does bloating peak? 30 minutes after eating? 2 hours?</li>
                      <li><span className="font-medium text-foreground">Review regularly:</span> Check your patterns weekly to identify triggers</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Implementing Changes Gradually</h3>
                    <div className="p-4 rounded-lg border bg-card">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Don't overhaul everything at once (too hard to identify what helps)</li>
                        <li>• Try one intervention for 1-2 weeks</li>
                        <li>• If it helps: Keep it, add another</li>
                        <li>• If it doesn't: Drop it, try something different</li>
                        <li>• Build your personalized bloating-prevention plan incrementally</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Creating Your Personal Protocol</h3>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium mb-3">Example Protocol:</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><span className="font-medium text-foreground">My triggers:</span> Onions, wheat, carbonation</li>
                        <li><span className="font-medium text-foreground">My relief tools:</span> Peppermint tea, post-meal walks, magnesium</li>
                        <li><span className="font-medium text-foreground">My prevention:</span> Low-FODMAP diet, 15-min walks after meals, stress management</li>
                        <li><span className="font-medium text-foreground">My emergency protocol:</span> Peppermint oil + ginger tea + gentle massage</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">When to Reassess</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><span className="font-medium text-foreground">Every 4 weeks:</span> Review data, assess which interventions work best</li>
                      <li><span className="font-medium text-foreground">Every 8-12 weeks:</span> Major reassessment, try removing or adding interventions</li>
                      <li><span className="font-medium text-foreground">When circumstances change:</span> Travel, new stress, medications, etc.</li>
                      <li><span className="font-medium text-foreground">As tolerance improves:</span> You may be able to reintroduce foods</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Disclaimer */}
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">
                This guide is for informational purposes and should not replace professional medical advice. Consult with a healthcare provider before beginning any new supplement or dietary regimen, especially if you have underlying medical conditions or take medications.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Version 1.0 | Last Updated: January 2026
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
