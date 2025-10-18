/**
 * Somnio Similarity Service
 * 
 * Simple but effective dream similarity calculation using:
 * 1. Tag matching (primary metric)
 * 2. Emotion similarity
 * 3. Keyword extraction from title and description
 * 4. Word overlap in descriptions
 */

class SimilarityService {
  constructor() {
    // Common words to ignore when extracting keywords
    this.stopWords = new Set([
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
      'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
      'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
      'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
      'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
      'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ]);

    // Minimum similarity threshold for creating relationships
    this.minSimilarity = 0.2; // 20% similarity minimum
  }

  /**
   * Extract keywords from text (title + description)
   * Removes stop words and extracts meaningful words
   */
  extractKeywords(text) {
    if (!text) return [];

    // Convert to lowercase, remove special characters, split into words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));

    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return unique words sorted by frequency
    return Object.keys(wordCount)
      .sort((a, b) => wordCount[b] - wordCount[a])
      .slice(0, 20); // Top 20 keywords
  }

  /**
   * Calculate Jaccard similarity between two sets
   * (intersection size / union size)
   */
  jaccardSimilarity(set1, set2) {
    if (!set1.length && !set2.length) return 0;
    
    const s1 = new Set(set1);
    const s2 = new Set(set2);
    
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate emotion similarity
   * Same emotion = 1.0, related emotions = 0.5, different = 0.0
   */
  emotionSimilarity(emotion1, emotion2) {
    if (emotion1 === emotion2) return 1.0;

    // Define emotion groups (related emotions)
    const emotionGroups = {
      positive: ['happy', 'excited', 'peaceful', 'curious'],
      negative: ['anxious', 'sad', 'fearful', 'confused'],
      neutral: ['neutral']
    };

    // Find which group each emotion belongs to
    let group1 = null;
    let group2 = null;

    for (const [group, emotions] of Object.entries(emotionGroups)) {
      if (emotions.includes(emotion1)) group1 = group;
      if (emotions.includes(emotion2)) group2 = group;
    }

    // If in same group, partial similarity
    if (group1 && group1 === group2) return 0.5;

    // Different groups
    return 0.0;
  }

  /**
   * Calculate overall similarity between two dreams
   * Returns a score between 0.0 and 1.0
   */
  calculateSimilarity(dream1, dream2) {
    // Don't compare a dream with itself
    if (dream1.id === dream2.id) return 0;

    // Extract data
    const tags1 = Array.isArray(dream1.tags) ? dream1.tags : [];
    const tags2 = Array.isArray(dream2.tags) ? dream2.tags : [];
    
    const text1 = `${dream1.title || ''} ${dream1.description || ''}`;
    const text2 = `${dream2.title || ''} ${dream2.description || ''}`;
    
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);

    // Calculate component similarities
    const tagSimilarity = this.jaccardSimilarity(tags1, tags2);
    const keywordSimilarity = this.jaccardSimilarity(keywords1, keywords2);
    const emotionSim = this.emotionSimilarity(dream1.emotion, dream2.emotion);

    // Weighted combination
    // Tags are most important (50%), keywords next (35%), emotion last (15%)
    const overallSimilarity = 
      (tagSimilarity * 0.50) +
      (keywordSimilarity * 0.35) +
      (emotionSim * 0.15);

    return overallSimilarity;
  }

  /**
   * Find similar dreams for a given dream
   * Returns array of { dreamId, similarity, sharedThemes }
   */
  findSimilarDreams(targetDream, allDreams, minSimilarity = null) {
    const threshold = minSimilarity || this.minSimilarity;
    const similarities = [];

    for (const dream of allDreams) {
      // Skip the target dream itself
      if (dream.id === targetDream.id) continue;

      // Calculate similarity
      const similarity = this.calculateSimilarity(targetDream, dream);

      // Only include if above threshold
      if (similarity >= threshold) {
        // Find shared tags (themes)
        const tags1 = Array.isArray(targetDream.tags) ? targetDream.tags : [];
        const tags2 = Array.isArray(dream.tags) ? dream.tags : [];
        const sharedThemes = tags1.filter(tag => tags2.includes(tag));

        similarities.push({
          dreamId: dream.id,
          similarity: Math.round(similarity * 1000) / 1000, // Round to 3 decimals
          sharedThemes
        });
      }
    }

    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities;
  }

  /**
   * Get explanation of why two dreams are similar
   * (for debugging or showing to users)
   */
  getSimilarityExplanation(dream1, dream2) {
    const tags1 = Array.isArray(dream1.tags) ? dream1.tags : [];
    const tags2 = Array.isArray(dream2.tags) ? dream2.tags : [];
    
    const text1 = `${dream1.title || ''} ${dream1.description || ''}`;
    const text2 = `${dream2.title || ''} ${dream2.description || ''}`;
    
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);

    const sharedTags = tags1.filter(tag => tags2.includes(tag));
    const sharedKeywords = keywords1.filter(kw => keywords2.includes(kw));
    const sameEmotion = dream1.emotion === dream2.emotion;

    return {
      sharedTags,
      sharedKeywords: sharedKeywords.slice(0, 5), // Top 5
      sameEmotion,
      emotionMatch: this.emotionSimilarity(dream1.emotion, dream2.emotion)
    };
  }
}

module.exports = new SimilarityService();
