# Somnio NLP Service Architecture

## Overview
The NLP service is the intelligent core of Somnio that transforms raw dream text into meaningful connections between users' dream experiences.

## Core Functionality

### 1. Text Preprocessing
```python
def preprocess_dream_text(text):
    """
    Clean and prepare dream text for analysis
    """
    # Remove special characters but keep emotional punctuation
    # Convert to lowercase
    # Handle common dream-specific terms
    # Remove excessive whitespace
    # Preserve sentence structure for better embeddings
```

### 2. Dream Embedding Generation
```python
from sentence_transformers import SentenceTransformer

class DreamEmbedder:
    def __init__(self):
        # Load pre-trained model optimized for semantic similarity
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        # Alternative models to consider:
        # - 'all-mpnet-base-v2' (higher quality, slower)
        # - 'paraphrase-multilingual-MiniLM-L12-v2' (multilingual)
    
    def generate_embedding(self, dream_text):
        """
        Convert dream text to 384-dimensional vector
        Returns: numpy array of shape (384,)
        """
        # Preprocess text
        cleaned_text = self.preprocess_dream_text(dream_text)
        
        # Generate embedding
        embedding = self.model.encode(cleaned_text)
        
        return embedding.tolist()  # Convert to list for JSON serialization
```

### 3. Similarity Calculation Engine
```python
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class SimilarityCalculator:
    def __init__(self, threshold=0.7):
        self.similarity_threshold = threshold
    
    def calculate_similarity(self, embedding1, embedding2):
        """
        Calculate cosine similarity between two dream embeddings
        Returns: float between 0.0 and 1.0
        """
        # Reshape for sklearn
        emb1 = np.array(embedding1).reshape(1, -1)
        emb2 = np.array(embedding2).reshape(1, -1)
        
        # Calculate cosine similarity
        similarity = cosine_similarity(emb1, emb2)[0][0]
        return float(similarity)
    
    def find_similar_dreams(self, new_dream_embedding, existing_dreams):
        """
        Find all dreams similar to the new dream
        Returns: List of (dream_id, similarity_score) tuples
        """
        similar_dreams = []
        
        for dream_id, dream_embedding in existing_dreams:
            similarity = self.calculate_similarity(
                new_dream_embedding, 
                dream_embedding
            )
            
            if similarity >= self.similarity_threshold:
                similar_dreams.append((dream_id, similarity))
        
        # Sort by similarity (highest first)
        return sorted(similar_dreams, key=lambda x: x[1], reverse=True)
```

### 4. Emotion Classification (Future Enhancement)
```python
from transformers import pipeline

class EmotionClassifier:
    def __init__(self):
        # Use pre-trained emotion classification model
        self.classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base"
        )
    
    def classify_emotion(self, dream_text):
        """
        Classify the primary emotion in a dream
        Returns: emotion label and confidence score
        """
        results = self.classifier(dream_text)
        
        # Map to our emotion categories
        emotion_mapping = {
            'joy': 'happy',
            'sadness': 'sad', 
            'anger': 'angry',
            'fear': 'fearful',
            'surprise': 'excited',
            'disgust': 'confused'
        }
        
        primary_emotion = results[0]['label'].lower()
        confidence = results[0]['score']
        
        mapped_emotion = emotion_mapping.get(primary_emotion, 'neutral')
        
        return mapped_emotion, confidence
```

### 5. Theme and Tag Extraction (Future Enhancement)
```python
import spacy
from collections import Counter

class ThemeExtractor:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        
        # Common dream themes and their keywords
        self.theme_keywords = {
            'flying': ['fly', 'flying', 'soar', 'airborne', 'float', 'levitate'],
            'falling': ['fall', 'falling', 'drop', 'plummet', 'tumble'],
            'water': ['water', 'ocean', 'sea', 'river', 'lake', 'swimming', 'drowning'],
            'chase': ['chase', 'chased', 'running', 'escape', 'pursue', 'hunt'],
            'school': ['school', 'classroom', 'exam', 'test', 'teacher', 'student'],
            'animals': ['dog', 'cat', 'bird', 'snake', 'lion', 'elephant', 'animal'],
            'death': ['death', 'dead', 'dying', 'funeral', 'grave', 'ghost'],
            'family': ['mother', 'father', 'mom', 'dad', 'sister', 'brother', 'family'],
            'house': ['house', 'home', 'room', 'door', 'window', 'building'],
            'car': ['car', 'driving', 'vehicle', 'road', 'highway', 'traffic']
        }
    
    def extract_themes(self, dream_text):
        """
        Extract common dream themes from text
        Returns: List of detected themes with confidence scores
        """
        doc = self.nlp(dream_text.lower())
        
        # Extract nouns and verbs
        important_words = [token.lemma_ for token in doc 
                          if token.pos_ in ['NOUN', 'VERB'] and not token.is_stop]
        
        # Count theme matches
        theme_scores = {}
        for theme, keywords in self.theme_keywords.items():
            matches = sum(1 for word in important_words if word in keywords)
            if matches > 0:
                theme_scores[theme] = matches / len(keywords)
        
        # Return sorted themes
        return sorted(theme_scores.items(), key=lambda x: x[1], reverse=True)
```

## API Endpoints

### 1. Dream Analysis Endpoint
```python
@app.route('/analyze', methods=['POST'])
def analyze_dream():
    """
    Analyze a dream and return embedding + metadata
    
    Request:
    {
        "dream_text": "I was flying over mountains...",
        "include_emotion": true,
        "include_themes": true
    }
    
    Response:
    {
        "embedding": [0.1, 0.2, ...], // 384 dimensions
        "emotion": {
            "label": "happy",
            "confidence": 0.85
        },
        "themes": [
            {"theme": "flying", "score": 0.8},
            {"theme": "nature", "score": 0.6}
        ],
        "processing_time": 0.234
    }
    """
```

### 2. Similarity Calculation Endpoint
```python
@app.route('/similarity', methods=['POST'])
def calculate_similarity():
    """
    Calculate similarity between dreams
    
    Request:
    {
        "dream_embedding": [0.1, 0.2, ...],
        "compare_against": [
            {
                "dream_id": "dream_123",
                "embedding": [0.15, 0.25, ...]
            }
        ],
        "threshold": 0.7
    }
    
    Response:
    {
        "similarities": [
            {
                "dream_id": "dream_123", 
                "similarity": 0.85
            }
        ],
        "processing_time": 0.045
    }
    """
```

### 3. Batch Processing Endpoint
```python
@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Process multiple dreams in batch for efficiency
    Used when calculating similarities for existing dreams
    """
```

## Performance Optimization

### 1. Model Caching
- Load sentence transformer model once at startup
- Keep model in memory for fast inference
- Use GPU acceleration if available

### 2. Embedding Storage
- Store embeddings as compressed arrays
- Use efficient serialization (pickle/numpy)
- Cache frequently accessed embeddings

### 3. Similarity Search Optimization
- Use approximate nearest neighbor search for large datasets
- Consider FAISS library for vector similarity
- Implement similarity caching for popular dreams

### 4. Async Processing
```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

class AsyncNLPProcessor:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def process_dream_async(self, dream_text):
        """Process dream in background thread"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            self.embedder.generate_embedding, 
            dream_text
        )
```

## Integration with Backend

### 1. Dream Submission Flow
```
1. User submits dream via React form
2. Backend receives dream data
3. Backend calls NLP service /analyze endpoint
4. NLP service returns embedding + metadata
5. Backend stores dream in Neo4j with embedding
6. Backend calls NLP service /similarity endpoint
7. NLP service finds similar dreams
8. Backend creates SIMILAR_TO relationships in Neo4j
9. Backend returns success to frontend
```

### 2. Background Processing
```python
# In backend (Node.js)
async function processDreamSimilarities(dreamId) {
    // Get new dream embedding
    const dream = await Dream.findById(dreamId);
    
    // Get all existing dreams for comparison
    const existingDreams = await Dream.getAllWithEmbeddings();
    
    // Call NLP service
    const similarities = await nlpService.calculateSimilarities(
        dream.embedding,
        existingDreams
    );
    
    // Create relationships in Neo4j
    for (const similarity of similarities) {
        await createSimilarityRelationship(
            dreamId, 
            similarity.dreamId, 
            similarity.score
        );
    }
}
```

## Error Handling & Monitoring

### 1. Graceful Degradation
- If NLP service is down, store dreams without similarity analysis
- Queue similarity calculations for later processing
- Provide fallback search using keyword matching

### 2. Performance Monitoring
- Track embedding generation time
- Monitor similarity calculation performance
- Alert if processing time exceeds thresholds

### 3. Quality Metrics
- Track similarity distribution
- Monitor for embedding quality issues
- A/B test different similarity thresholds

## Deployment Considerations

### 1. Resource Requirements
- **CPU**: 2+ cores for parallel processing
- **RAM**: 4GB+ (model loading + embeddings)
- **Storage**: 2GB+ for models and caches
- **GPU**: Optional but recommended for large datasets

### 2. Scaling Strategies
- Horizontal scaling with load balancer
- Separate embedding generation from similarity calculation
- Use message queues for async processing
- Consider specialized vector databases (Pinecone, Weaviate)

This NLP service is the "magic" that makes Somnio work - it's what allows two strangers to discover they had nearly identical dreams about flying over mountains or being chased through endless corridors.