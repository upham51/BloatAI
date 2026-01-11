import { useState, useMemo } from 'react';
import { TRIGGER_ICONS, getIconForTrigger } from '@/lib/triggerUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmojiTest() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ input: string; emoji: string } | null>(null);

  // Sort emoji mappings alphabetically by key
  const sortedMappings = useMemo(() => {
    return Object.entries(TRIGGER_ICONS).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  // Filter mappings based on search query
  const filteredMappings = useMemo(() => {
    if (!searchQuery) return sortedMappings;
    const query = searchQuery.toLowerCase();
    return sortedMappings.filter(([key]) => key.toLowerCase().includes(query));
  }, [sortedMappings, searchQuery]);

  // Group mappings by category
  const groupedMappings = useMemo(() => {
    const groups: Record<string, [string, string][]> = {
      'FODMAP Categories': [],
      'Proteins': [],
      'Herbs & Spices': [],
      'Grains & Carbs': [],
      'Vegetables': [],
      'Beans & Legumes': [],
      'Fruits': [],
      'Dairy': [],
      'Condiments & Sauces': [],
      'Nuts & Seeds': [],
      'Sweets & Desserts': [],
      'Spices & Seasonings': [],
      'Beverages': [],
      'Prepared Foods': [],
      'Cooking Techniques & Preparations': [],
      'Other': [],
    };

    filteredMappings.forEach((mapping) => {
      const [key] = mapping;

      if (['grains', 'beans', 'dairy', 'fruit', 'sweeteners'].includes(key)) {
        groups['FODMAP Categories'].push(mapping);
      } else if (['protein', 'meat', 'steak', 'beef', 'pork', 'bacon', 'ham', 'chicken', 'turkey', 'duck', 'fish', 'salmon', 'tuna', 'shrimp', 'seafood', 'shellfish', 'crab', 'lobster', 'egg', 'tofu', 'tempeh', 'prosciutto', 'pancetta', 'chorizo', 'salami', 'pepperoni', 'pastrami', 'corned beef', 'brisket', 'ribs', 'tenderloin', 'filet', 'sirloin', 'ribeye', 't-bone', 'porterhouse', 'lamb', 'veal', 'venison', 'trout', 'cod', 'halibut', 'sea bass', 'snapper', 'tilapia', 'catfish', 'mahi mahi', 'swordfish', 'anchovies', 'sardines', 'mackerel', 'octopus', 'squid', 'calamari', 'clams', 'mussels', 'oysters', 'scallops'].includes(key)) {
        groups['Proteins'].push(mapping);
      } else if (['herb', 'herbs', 'compound herb', 'basil', 'parsley', 'cilantro', 'oregano', 'thyme', 'rosemary', 'mint', 'dill'].includes(key)) {
        groups['Herbs & Spices'].push(mapping);
      } else if (['wheat', 'bread', 'pasta', 'rice', 'noodles', 'tortilla', 'bagel', 'croissant', 'cereal', 'oats', 'quinoa', 'corn', 'popcorn'].includes(key)) {
        groups['Grains & Carbs'].push(mapping);
      } else if (['vegetable', 'broccoli', 'cauliflower', 'cabbage', 'lettuce', 'spinach', 'kale', 'carrot', 'onion', 'scallion', 'green onion', 'shallot', 'leek', 'garlic', 'ginger', 'tomato', 'potato', 'sweet potato', 'yam', 'pepper', 'bell pepper', 'cucumber', 'pickle', 'eggplant', 'mushroom', 'avocado', 'zucchini', 'squash', 'pumpkin', 'asparagus', 'celery', 'radish', 'beet'].includes(key)) {
        groups['Vegetables'].push(mapping);
      } else if (['beans', 'black beans', 'kidney beans', 'pinto beans', 'chickpeas', 'lentils', 'peas', 'edamame', 'soy', 'soybean'].includes(key)) {
        groups['Beans & Legumes'].push(mapping);
      } else if (['fruit', 'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'berry', 'blueberry', 'raspberry', 'blackberry', 'watermelon', 'melon', 'peach', 'pear', 'cherry', 'pineapple', 'mango', 'kiwi', 'coconut'].includes(key)) {
        groups['Fruits'].push(mapping);
      } else if (['milk', 'cheese', 'cream', 'butter', 'yogurt', 'ice cream', 'mascarpone', 'ricotta', 'feta', 'goat cheese', 'brie', 'camembert', 'gorgonzola', 'blue cheese', 'gouda', 'swiss', 'provolone', 'fontina', 'gruyere', 'manchego', 'pecorino', 'asiago', 'havarti', 'bocconcini', 'burrata', 'queso'].includes(key)) {
        groups['Dairy'].push(mapping);
      } else if (['sauce', 'jus', 'au jus', 'gravy', 'soy sauce', 'teriyaki', 'hot sauce', 'salsa', 'ketchup', 'mustard', 'mayo', 'mayonnaise', 'dressing', 'vinegar', 'balsamic', 'oil', 'olive oil', 'sesame oil', 'coconut oil', 'honey', 'syrup', 'jam', 'jelly', 'peanut butter', 'almond butter', 'dark sauce', 'brown sauce', 'demi-glace', 'reduction', 'glaze', 'aioli', 'pesto', 'chimichurri', 'hollandaise', 'béarnaise', 'bechamel', 'mornay', 'velouté', 'espagnole', 'coulis', 'chutney', 'relish', 'compote', 'crema', 'crème fraîche', 'compound butter', 'herb butter', 'garlic butter', 'truffle', 'truffle oil'].includes(key)) {
        groups['Condiments & Sauces'].push(mapping);
      } else if (['nut', 'peanut', 'almond', 'walnut', 'cashew', 'pistachio', 'seed', 'sesame', 'sunflower'].includes(key)) {
        groups['Nuts & Seeds'].push(mapping);
      } else if (['sugar', 'candy', 'chocolate', 'cake', 'cookie', 'donut', 'pie'].includes(key)) {
        groups['Sweets & Desserts'].push(mapping);
      } else if (['spicy', 'hot', 'chili', 'jalapeño', 'salt'].includes(key)) {
        groups['Spices & Seasonings'].push(mapping);
      } else if (['sparkling', 'soda', 'cola', 'juice', 'fried', 'greasy', 'caffeine', 'coffee', 'tea', 'wine', 'beer', 'cocktail', 'water', 'milkshake', 'smoothie', 'frappe', 'latte', 'cappuccino', 'espresso', 'americano', 'macchiato', 'mocha', 'matcha', 'chai'].includes(key)) {
        groups['Beverages'].push(mapping);
      } else if (['pizza', 'burger', 'sandwich', 'taco', 'burrito', 'sushi', 'ramen', 'soup', 'stew', 'curry', 'salad', 'fries', 'chips', 'casserole', 'pot pie', 'quiche', 'frittata', 'omelet', 'scramble', 'risotto', 'paella', 'biryani', 'pilaf', 'chowder', 'bisque', 'consommé', 'pho', 'udon', 'soba', 'lo mein', 'pad thai', 'lasagna', 'ravioli', 'gnocchi', 'penne', 'fettuccine', 'linguine', 'spaghetti', 'carbonara', 'bolognese', 'marinara', 'alfredo', 'puttanesca', 'arrabbiata', 'pesto pasta'].includes(key)) {
        groups['Prepared Foods'].push(mapping);
      } else if (['grilled', 'grill marks', 'charred', 'seared', 'blackened', 'smoked', 'braised', 'roasted', 'baked', 'broiled', 'pan-fried', 'deep-fried', 'sautéed', 'stir-fried', 'poached', 'steamed', 'boiled', 'blanched', 'caramelized', 'glazed', 'pickled', 'fermented', 'cured', 'marinated', 'brined', 'confit', 'tempura', 'crispy', 'crunchy', 'tender', 'juicy', 'flaky', 'garnish', 'drizzle', 'topped', 'stuffed', 'breaded', 'crusted', 'raw', 'rare', 'medium rare', 'medium', 'well done', 'au gratin', 'en croute', 'flambe', 'julienned', 'diced', 'minced', 'sliced', 'chopped', 'shredded', 'grated', 'whipped', 'mashed', 'puréed', 'seasoned', 'spiced', 'zested', 'infused', 'emulsion', 'roux', 'stock', 'broth', 'bouillon', 'marinade', 'brine', 'rub', 'crust', 'coating', 'batter', 'dough', 'pastry', 'phyllo', 'puff pastry', 'shortcrust', 'tart', 'galette', 'crumble', 'crisp', 'cobbler', 'mousse', 'custard', 'crème', 'flan', 'pudding', 'panna cotta', 'tiramisu', 'cheesecake', 'torte', 'gelato', 'sorbet', 'sherbet', 'granita', 'parfait', 'sundae'].includes(key)) {
        groups['Cooking Techniques & Preparations'].push(mapping);
      } else if (['gluten', 'veggies', 'fatty-food', 'carbonated', 'sugar', 'alcohol', 'processed'].includes(key)) {
        groups['Other Trigger Categories'].push(mapping);
      } else {
        groups['Other'].push(mapping);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([, mappings]) => mappings.length > 0);
  }, [filteredMappings]);

  const handleTest = () => {
    if (testInput.trim()) {
      const emoji = getIconForTrigger(testInput);
      setTestResult({ input: testInput, emoji });
    }
  };

  const totalMappings = sortedMappings.length;
  const displayedMappings = filteredMappings.length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Emoji Mapping Test Page</h1>
            <p className="text-muted-foreground">
              Visual testing tool for food emoji mappings ({totalMappings} total mappings)
            </p>
          </div>
        </div>

        {/* Test Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Test Emoji Lookup</CardTitle>
            <CardDescription>
              Enter a food term to see which emoji it maps to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., dark sauce, compound butter, grill marks"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTest()}
              />
              <Button onClick={handleTest}>Test</Button>
            </div>
            {testResult && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{testResult.emoji}</div>
                  <div>
                    <div className="font-semibold">Input: "{testResult.input}"</div>
                    <div className="text-sm text-muted-foreground">Emoji: {testResult.emoji}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emoji mappings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {displayedMappings} of {totalMappings} mappings
              </p>
            )}
          </CardContent>
        </Card>

        {/* Emoji Mappings by Category */}
        <div className="space-y-6">
          {groupedMappings.map(([category, mappings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>{mappings.length} mappings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {mappings.map(([key, emoji]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors"
                    >
                      <div className="text-2xl flex-shrink-0">{emoji}</div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{key}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMappings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No mappings found for "{searchQuery}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
