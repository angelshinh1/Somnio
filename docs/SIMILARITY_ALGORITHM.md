# Dream Similarity Algorithm Documentation

## Overview

DreamSync uses a **simple but effective tag-based similarity algorithm** that runs entirely in the Node.js backend. No external Python services or costly NLP APIs required! The algorithm automatically connects dreams based on:

1. **Tag Matching** (50% weight) - Direct overlap of user-defined tags
2. **Keyword Extraction** (35% weight) - Automatic extraction of important words from title and description
3. **Emotion Similarity** (15% weight) - Related emotional tones

## How It Works

### 1. Tag Matching (Primary Method)

Tags are the most important factor. When you create a dream with tags like `['flying', 'mountains', 'freedom']`, the algorithm:

- Compares your tags with all other public dreams' tags
- Uses **Jaccard similarity**: `intersection size / union size`
- Example:
  - Dream A: `['flying', 'mountains', 'freedom']` (3 tags)
  - Dream B: `['flying', 'clouds', 'freedom']` (3 tags)
  - Shared: `['flying', 'freedom']` (2 tags)
  - Union: `['flying', 'mountains', 'freedom', 'clouds']` (4 tags)
  - Tag similarity: 2/4 = **50%**

### 2. Keyword Extraction (Automatic Enhancement)

Even if users don't add perfect tags, the system extracts keywords automatically:

- Removes common "stop words" (the, a, an, is, was, etc.)
- Extracts meaningful words from title + description
- Focuses on nouns, verbs, and descriptive words
- Example: "Flying Over Mountains" → `['flying', 'mountains', 'soaring', 'high', 'snow', ...]`

This helps catch similarities even when users use different tags but describe similar experiences.

### 3. Emotion Matching

Dreams with related emotions get a slight boost:

- **Same emotion**: +1.0 (e.g., both "happy")
- **Related emotion group**: +0.5 (e.g., "happy" and "excited" are both positive)
- **Different emotion group**: +0.0 (e.g., "happy" and "anxious")

Emotion groups:
- **Positive**: happy, excited, peaceful, curious
- **Negative**: anxious, sad, fearful, confused
- **Neutral**: neutral

### 4. Overall Similarity Score

The final score combines all three factors:

```javascript
similarity = (tagSimilarity × 0.50) + (keywordSimilarity × 0.35) + (emotionSimilarity × 0.15)
```

**Similarity Thresholds:**
- **70-100%**: Very similar dreams (rare but meaningful)
- **40-69%**: Moderately similar dreams (good matches)
- **20-39%**: Somewhat similar dreams (weak connections)
- **0-19%**: Different dreams (no connection created)

**Default minimum**: 20% (only creates relationships above this)

## Automatic Similarity Calculation

### When Creating a Dream

1. User creates a new dream via `POST /api/dreams`
2. Dream is saved to Neo4j database
3. **Background process** (doesn't slow down the response):
   - Fetches all other public dreams
   - Calculates similarity with each one
   - Creates `SIMILAR_TO` relationships for matches ≥ 30%
4. User gets immediate response, similarities calculated in background

### When Updating a Dream

1. User updates a dream via `PUT /api/dreams/:dreamId`
2. If significant fields changed (title, description, tags, emotion):
   - **Background process**:
     - Deletes old `SIMILAR_TO` relationships for this dream
     - Recalculates similarities
     - Creates new relationships

## Performance Optimization

### Why This Approach is Fast

1. **Simple calculations**: No matrix multiplications or neural networks
2. **Runs in Node.js**: No need to call external Python services
3. **Background processing**: Uses `setImmediate()` so API responds instantly
4. **Batch operations**: Creates multiple relationships in single database query
5. **Smart caching**: Only recalculates when content actually changes

### Scalability

- **Small databases** (< 1000 dreams): Instant calculations
- **Medium databases** (1000-10000 dreams): 1-5 seconds per dream (background)
- **Large databases** (> 10000 dreams): Can run full recalculation during maintenance

## API Endpoints

### 1. Automatic (Built-in)

Dream similarities are calculated automatically on:
- `POST /api/dreams` - Creates dream + calculates similarities
- `PUT /api/dreams/:dreamId` - Updates dream + recalculates if needed

### 2. Manual Recalculation

For initial setup or maintenance:

```bash
POST /api/similarity/recalculate?minSimilarity=0.2
```

**Response:**
```json
{
  "success": true,
  "message": "Similarity recalculation completed successfully",
  "processed": 150,
  "relationshipsCreated": 487
}
```

**Query Parameters:**
- `minSimilarity` (optional): Threshold 0.0-1.0 (default: 0.2)

**Use cases:**
- Initial database setup
- After importing many dreams at once
- After changing the similarity algorithm
- Maintenance/cleanup

## Database Schema

### SIMILAR_TO Relationship

```cypher
(:Dream)-[:SIMILAR_TO {
  similarity: float,           // 0.0 - 1.0
  calculatedAt: datetime,      // When calculated
  sharedThemes: [string]       // Tags that both dreams share
}]->(:Dream)
```

**Example:**
```cypher
(dream1:Dream {id: "abc123", title: "Flying Over Mountains", tags: ["flying", "mountains"]})
-[:SIMILAR_TO {
  similarity: 0.45,
  calculatedAt: datetime("2024-01-15T10:30:00"),
  sharedThemes: ["flying", "freedom"]
}]->
(dream2:Dream {id: "def456", title: "Soaring Above Clouds", tags: ["flying", "clouds"]})
```

## Example Scenarios

### Scenario 1: Two Flying Dreams

**Dream A:**
- Title: "Flying Over Mountains"
- Tags: `['flying', 'mountains', 'freedom', 'nature']`
- Emotion: happy

**Dream B:**
- Title: "Soaring Above the Clouds"
- Tags: `['flying', 'clouds', 'freedom', 'sky']`
- Emotion: excited

**Result:**
- Tag similarity: 2/6 = 33.3% (shared: flying, freedom)
- Keyword similarity: ~40% (flying, soaring, feeling, wind)
- Emotion similarity: 50% (both positive emotions)
- **Overall: ~38%** ✅ Connection created!

### Scenario 2: Flying vs Ocean

**Dream A:**
- Title: "Flying Over Mountains"
- Tags: `['flying', 'mountains', 'freedom']`
- Emotion: happy

**Dream C:**
- Title: "Swimming in Deep Ocean"
- Tags: `['ocean', 'water', 'underwater']`
- Emotion: anxious

**Result:**
- Tag similarity: 0% (no shared tags)
- Keyword similarity: 0% (different vocabulary)
- Emotion similarity: 0% (different emotion groups)
- **Overall: 0%** ❌ No connection

### Scenario 3: Flying vs Mountain Climbing

**Dream A:**
- Title: "Flying Over Mountains"
- Tags: `['flying', 'mountains', 'freedom', 'nature']`
- Emotion: happy

**Dream D:**
- Title: "Climbing a Mountain"
- Tags: `['mountains', 'hiking', 'nature', 'adventure']`
- Emotion: peaceful

**Result:**
- Tag similarity: 2/6 = 33.3% (shared: mountains, nature)
- Keyword similarity: ~10% (mountains shared)
- Emotion similarity: 50% (both positive)
- **Overall: ~26%** ✅ Connection created (above 20% threshold)

## Advantages of This Approach

### ✅ Pros

1. **Simple to understand**: Users know tags drive connections
2. **No external dependencies**: Runs entirely in Node.js backend
3. **Fast**: Calculations complete in milliseconds
4. **Cheap**: No API costs, no GPU required
5. **Easy to host**: Deploy anywhere Node.js runs
6. **Transparent**: Clear why dreams are connected
7. **User-controlled**: Better tags = better connections
8. **Immediate**: Works from day one with any content

### ❓ Limitations

1. **Tag dependent**: Users must add good tags
2. **Language specific**: Works best in English
3. **No semantic understanding**: "automobile" ≠ "car"
4. **Simple keyword matching**: Not as sophisticated as embeddings

### 🔮 Future Enhancements (Optional)

If you want to improve it later without external services:

1. **Synonym support**: Map related words (car → automobile, happy → joyful)
2. **Phrase extraction**: Detect multi-word phrases ("flying car")
3. **Tag suggestions**: Suggest tags based on description
4. **Temporal patterns**: Connect dreams from similar dates/times
5. **User preferences**: Learn which connections users like

## Testing

Run the test script to see it in action:

```bash
cd backend
node test-similarity.js
```

This demonstrates:
- Similarity calculations between different dream types
- Keyword extraction
- Explanation generation
- Finding similar dreams with threshold filtering

## Configuration

Default settings in `src/services/similarityService.js`:

```javascript
this.minSimilarity = 0.2;  // 20% minimum threshold
```

**Weights (in calculateSimilarity method):**
```javascript
const overallSimilarity = 
  (tagSimilarity * 0.50) +      // 50% weight on tags
  (keywordSimilarity * 0.35) +  // 35% weight on keywords
  (emotionSim * 0.15);          // 15% weight on emotion
```

You can adjust these values to tune the algorithm's behavior.

## Best Practices

### For Users

1. **Add specific tags**: "flying", "mountains" better than "dream", "weird"
2. **Use 3-7 tags per dream**: Not too few, not too many
3. **Be consistent**: Use same tags for recurring themes
4. **Use emotion field**: Helps group similar feelings

### For Developers

1. **Monitor performance**: Check logs for calculation times
2. **Adjust threshold**: If too many/few connections, change `minSimilarity` (currently 20%)
3. **Run recalculation**: After major imports or algorithm changes
4. **Index optimization**: Ensure Neo4j has proper indexes on Dream.isPublic

## Conclusion

This similarity algorithm strikes a perfect balance between:
- **Simplicity**: Easy to understand and maintain
- **Effectiveness**: Creates meaningful connections
- **Performance**: Fast enough for real-time use
- **Cost**: Zero external service costs
- **Deployability**: Works anywhere Node.js runs

Perfect for a self-hosted dream journal that you can deploy on any platform without worrying about expensive NLP APIs or Python service infrastructure!
