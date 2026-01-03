# 🖼️ Fix Guide Images Not Loading

## Problem
The bloating guide infographics aren't displaying in the guide.

## Root Cause
The image files haven't been uploaded to the `/public/assets/images/` directory yet.

## Solution: Upload the 3 Infographic Images

### Step 1: Locate Your Image Files

You previously generated these 3 infographics using Gemini. Find these files:

1. `Gemini_Generated_Image_1ebqaa1ebqaa1ebq.png` - 3 Types of Bloating
2. `Gemini_Generated_Image_biz282biz282biz2.png` - FODMAP Journey
3. `Gemini_Generated_Image_pvq99vpvq99vpvq9.png` - High-FODMAP Foods Grid

### Step 2: Rename Them

Rename the files to these exact names (case-sensitive):

1. `bloat-guide-infographic-1-three-types.png`
2. `bloat-guide-infographic-2-fodmap-journey.png`
3. `bloat-guide-infographic-3-food-grid.png`

### Step 3: Upload to Lovable

In Lovable:
1. Navigate to the file explorer
2. Go to `/public/assets/images/` directory
3. Upload all 3 renamed image files

### Step 4: Verify

1. Refresh your app
2. Open the Bloating Guide (button on Insights page)
3. Scroll through the guide
4. All 3 infographics should now display:
   - **Image 1**: Under "What Exactly is Bloating?" section
   - **Image 2**: Under "The Food Culprits (FODMAPs)" → "What Happens Step-by-Step"
   - **Image 3**: Under "The Food Culprits (FODMAPs)" → "Common High-FODMAP Foods"

---

## Alternative: Generate New Images

If you can't find the original Gemini images, you can:

1. Use any AI image generator (Midjourney, DALL-E, Gemini, etc.)
2. Generate infographics based on the descriptions in `/public/assets/images/README.md`
3. Save them with the correct filenames
4. Upload to `/public/assets/images/`

---

## Image Requirements

- **Format**: PNG (preferred) or JPG
- **Recommended size**: 1200px wide (will scale responsively)
- **Optimization**: Compress for web (use tools like TinyPNG)

---

## What The Images Will Show

### Image 1: 3 Types of Bloating
- Gas Bubble Effect (gas trapped in intestines)
- Traffic Jam (slow motility)
- Overactive Alarm System (sensitive gut nerves)

### Image 2: FODMAP Journey
- Digestive system diagram showing:
  1. Eating high-FODMAP food
  2. Small intestine failing to absorb
  3. Large intestine fermenting → gas production
  4. Resulting bloating

### Image 3: High-FODMAP Foods Grid
Visual grid showing:
- **Fruits**: apples, pears, mangoes, watermelon, peaches, plums
- **Vegetables**: onions, garlic, asparagus, cauliflower, mushrooms, snow peas
- **Grains**: wheat, rye, barley
- **Legumes**: beans, lentils, chickpeas
- **Dairy**: milk, yogurt, soft cheeses
- **Sweeteners**: honey, high-fructose corn syrup

---

## Technical Details

- Images are loaded from `/assets/images/` (served from `/public` directory in Vite)
- Each image has an `onError` handler that hides it gracefully if not found
- Images use lazy loading for performance
- Full alt text provided for accessibility
