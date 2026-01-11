# Stomach Animation Videos

Place your custom stomach animation videos in this directory with the following names:

## Required Video Files

1. **sad.mp4** - Played when health score is less than 41 (poor health)
2. **moderate.mp4** - Played when health score is between 41-69 (moderate health)
3. **happy.mp4** - Played when health score is 70 or above (excellent health)

## Video Specifications

- **Format**: MP4 (H.264 codec recommended for best browser compatibility)
- **Recommended Size**: 300x300 pixels (or any square aspect ratio)
- **Length**: Any duration (videos will loop automatically)
- **Audio**: Not required (videos are muted by default)

## How It Works

The AnimatedStomachCharacter component automatically selects the appropriate video based on the user's health score:

- **Score < 41**: Shows `sad.mp4`
- **Score 41-69**: Shows `moderate.mp4`
- **Score ≥ 70**: Shows `happy.mp4`

Videos will autoplay and loop continuously.
