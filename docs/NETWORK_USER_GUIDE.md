# DreamSync Network Page - Quick Guide

## 🎯 Overview

The **Network** page is a 3D visualization that shows your dreams and how they connect to similar dreams from other users.

## 🗺️ Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  "Dream Network" | "Explore connections..."      [Back]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Legend]                              [Network Stats] │
│  ● Your Dreams                         Your Dreams: 5  │
│  ● Similar Dreams                      Connections: 12 │
│  ─ Connection                          Similar: 8      │
│                                                         │
│                                                         │
│                  ╔═══════════╗                          │
│              ●───║   3D      ║───●                      │
│          ●───────║  NETWORK  ║───────●                  │
│              ●───║   SPACE   ║───●                      │
│                  ╚═══════════╝                          │
│                                                         │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │ 💭 Dream Info Card (on hover)                 │    │
│  │ [Your Dream] [Peaceful]                       │    │
│  │ "Flying Over Mountains"                       │    │
│  │ I was soaring high above snow-capped...      │    │
│  │ #flying #mountains #freedom                   │    │
│  │ ✨ Lucid  Vividness: 8/10      View Details → │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Dream Orb Anatomy

```
        ✨ (Lucid Dream Indicator - Golden Sparkle)
         │
         ▼
      ╭─────╮
     ╱       ╲     ◄─── Glow Layer (Soft outer glow)
    │    ●    │    ◄─── Main Orb (Emotion-colored)
     ╲       ╱
      ╰─────╯
         │
         ▼
        🔄 (Recurring Dream - Orange Ring)

Colors:
● Cyan (Your dreams)
● Green (Happy)
● Yellow (Anxious)
● Blue (Peaceful)
● Purple (Confused)
● Orange (Excited)
● Gray (Sad)
● Teal (Curious)
● Red (Fearful)
```

## 🖱️ Controls

### Mouse Controls:
- **Hover over orb** → See dream info card at bottom
- **Click orb** → Navigate to dream details page
- **Left-click + Drag** → Rotate camera view
- **Right-click + Drag** → Pan camera
- **Scroll Wheel** → Zoom in/out
- **Auto-rotation** → Scene slowly rotates automatically

### Keyboard (via OrbitControls):
- **Arrow Keys** → Pan view
- **+ / -** → Zoom in/out
- **Home** → Reset view

## 🔍 What to Look For

### 1. **Clusters**
Dreams with similar emotions/themes tend to cluster together visually.

### 2. **Connection Density**
More lines = more similarities found between dreams.

### 3. **Special Dreams**
- **Larger orbs** = Your own dreams (easier to spot)
- **Sparkles** = Lucid dreams (you were aware you were dreaming)
- **Rings** = Recurring dreams (you've had this dream before)

### 4. **Connection Strength**
- **Brighter lines** = Higher similarity score
- **Animated shimmer** = Active connections

## 📊 Network Stats Explained

**Your Dreams**: Number of dreams you've logged
**Connections**: Total number of similarity relationships found
**Similar Dreams**: Dreams from other users that match yours

## 🎭 Emotion Color Guide

Each dream's orb color reflects its dominant emotion:

| Emotion   | Color  | Meaning                           |
|-----------|--------|-----------------------------------|
| Happy     | Green  | Joy, contentment, positive        |
| Anxious   | Yellow | Worry, stress, unease             |
| Peaceful  | Blue   | Calm, serene, tranquil            |
| Confused  | Purple | Bewildered, uncertain, puzzled    |
| Excited   | Orange | Energetic, enthusiastic, eager    |
| Sad       | Gray   | Melancholy, down, sorrowful       |
| Curious   | Teal   | Inquisitive, wondering, exploring |
| Fearful   | Red    | Scared, frightened, anxious       |
| Neutral   | Gray   | No strong emotion                 |

## 💡 Tips for Best Experience

1. **Take your time** - Let the scene load fully (starfield appears first)
2. **Rotate slowly** - Gentle rotations reveal patterns
3. **Zoom in** - Get close to see the glow effects and details
4. **Zoom out** - See the big picture and overall network structure
5. **Hover over clusters** - Groups of similar dreams often share themes
6. **Check timestamps** - Recent dreams appear just as dreams from years ago

## 🌟 Hidden Details

- **Starfield depth** - Stars parallax as you rotate
- **Bezier curves** - Connections arc through 3D space
- **Multiple glow layers** - Orbs have 2-3 layers of glow
- **Gentle floating** - Each orb bobs slightly on its own rhythm
- **Pulsing connections** - Lines slowly pulse brighter/dimmer

## 🚧 Troubleshooting

**Nothing appears?**
- Wait 2-3 seconds for Three.js to load
- Check console for errors (F12)
- Ensure you're logged in

**Low FPS/Laggy?**
- Close other browser tabs
- Try zooming out (fewer details to render)
- Reduce browser window size

**Can't click dreams?**
- Make sure you're clicking the orb, not the space around it
- Try zooming in closer

**Info card won't dismiss?**
- Click the X button in top-right of card
- Or hover over another dream to replace it

## 🎓 Understanding Your Network

### Dense Networks
Many connections = Your dreams have common themes with others
- Suggests universal human experiences
- Good for discovering community patterns

### Sparse Networks
Few connections = Your dreams are unique
- Suggests highly personal dream content
- Opportunity to share and connect with specific users

### Emotion Patterns
- **All one color?** Your dreams may have a dominant emotional theme
- **Rainbow mix?** Rich emotional variety in your dream life
- **Clusters by color?** Similar experiences group together

---

**Enjoy exploring your Dream Network!** 🌙✨

Navigate to: `/network` while logged in
