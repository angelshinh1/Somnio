# Somnio Database Schema Documentation

## Node Types

### User Node
```cypher
(:User {
  id: string,              // UUID - Primary key
  username: string,        // Unique username
  email: string,           // Unique email address  
  passwordHash: string,    // bcrypt hashed password
  createdAt: datetime,     // Account creation timestamp
  lastLogin: datetime,     // Last login timestamp (optional)
  settings: map {          // User preferences
    theme: string,         // 'light' | 'dark'
    publicProfile: boolean, // Profile visibility
    emailNotifications: boolean,
    dreamVisibility: string // 'public' | 'private' | 'anonymous'
  },
  avatar: string,          // Avatar URL (optional)
  bio: string             // User bio (optional)
})
```

### Dream Node
```cypher
(:Dream {
  id: string,              // UUID - Primary key
  title: string,           // Dream title
  description: string,     // Full dream description
  date: date,             // Date the dream occurred
  userId: string,         // Foreign key to User
  tags: [string],         // User-defined tags
  emotion: string,        // 'happy' | 'sad' | 'fearful' | 'angry' | 'peaceful' | 'confused' | 'excited' | 'neutral'
  embedding: [float],     // 384-dimensional vector from sentence-transformers
  createdAt: datetime,    // When dream was logged
  updatedAt: datetime,    // Last modification (optional)
  isPublic: boolean,      // Public visibility
  lucidDream: boolean,    // Was this a lucid dream?
  recurring: boolean,     // Is this a recurring dream?
  vividness: integer,     // Scale 1-10
  sleepQuality: integer,  // Scale 1-10 (optional)
  mood: string,          // Mood when waking up (optional)
  location: string,      // Where the dream took place (optional)
  characters: [string]   // People/entities in the dream (optional)
})
```

## Relationship Types

### POSTED
```cypher
(:User)-[:POSTED {
  timestamp: datetime      // When the dream was posted
}]->(:Dream)
```

### SIMILAR_TO
```cypher
(:Dream)-[:SIMILAR_TO {
  similarity: float,       // Cosine similarity score (0.0 - 1.0)
  calculatedAt: datetime,  // When similarity was calculated
  sharedThemes: [string],  // Common themes/tags (optional)
  algorithm: string        // 'sentence-transformer' (for future ML models)
}]->(:Dream)
```

### Future Relationships

### TAGGED_AS (Future)
```cypher
(:Dream)-[:TAGGED_AS {
  confidence: float        // AI confidence in tag assignment
}]->(:Tag)
```

### FOLLOWS (Future - Social Features)
```cypher
(:User)-[:FOLLOWS {
  since: datetime
}]->(:User)
```

### LIKED (Future - Dream Reactions)
```cypher
(:User)-[:LIKED {
  timestamp: datetime
}]->(:Dream)
```

## Indexes and Constraints

### Constraints (Uniqueness)
- `user_id_unique`: Ensures User.id is unique
- `user_email_unique`: Ensures User.email is unique
- `user_username_unique`: Ensures User.username is unique
- `dream_id_unique`: Ensures Dream.id is unique

### Indexes (Performance)
- `user_email_index`: Fast user lookup by email (login)
- `user_created_at_index`: User registration analytics
- `dream_user_id_index`: User's dreams lookup
- `dream_date_index`: Dreams by date
- `dream_created_at_index`: Recent dreams
- `dream_is_public_index`: Public dreams filtering
- `dream_emotion_index`: Dreams by emotion
- `dream_user_date_index`: Composite index for user's dreams by date
- `dream_public_date_index`: Composite index for public dreams timeline

## Common Query Patterns

### 1. User Authentication
```cypher
// Login
MATCH (u:User {email: $email})
RETURN u.id, u.passwordHash, u.username

// Get user profile
MATCH (u:User {id: $userId})
RETURN u
```

### 2. Dream Operations
```cypher
// Create dream
CREATE (d:Dream {
  id: $dreamId,
  title: $title,
  description: $description,
  date: date($date),
  userId: $userId,
  tags: $tags,
  emotion: $emotion,
  embedding: $embedding,
  createdAt: datetime(),
  isPublic: $isPublic,
  lucidDream: $lucidDream,
  recurring: $recurring
})

// Get user's dreams
MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream)
RETURN d
ORDER BY d.date DESC

// Get public dreams for exploration
MATCH (d:Dream {isPublic: true})
RETURN d
ORDER BY d.createdAt DESC
LIMIT 50
```

### 3. Similarity Operations
```cypher
// Find similar dreams for a specific dream
MATCH (d:Dream {id: $dreamId})-[s:SIMILAR_TO]-(similar:Dream)
WHERE similar.isPublic = true OR similar.userId = $currentUserId
RETURN similar, s.similarity
ORDER BY s.similarity DESC
LIMIT 10

// Create similarity relationship
MATCH (d1:Dream {id: $dream1Id}), (d2:Dream {id: $dream2Id})
CREATE (d1)-[:SIMILAR_TO {
  similarity: $similarity,
  calculatedAt: datetime(),
  algorithm: 'sentence-transformer'
}]->(d2)
```

### 4. Network Visualization Queries
```cypher
// Get full dream network for 3D visualization
MATCH (d:Dream {isPublic: true})
OPTIONAL MATCH (d)-[s:SIMILAR_TO]-(connected:Dream {isPublic: true})
WHERE s.similarity >= $minSimilarity
RETURN {
  id: d.id,
  title: d.title,
  emotion: d.emotion,
  tags: d.tags,
  x: rand() * 100,  // Will be calculated by frontend
  y: rand() * 100,
  z: rand() * 100
} as node,
collect({
  target: connected.id,
  similarity: s.similarity
}) as connections

// Get dream clusters (connected components)
MATCH path = (start:Dream {isPublic: true})-[:SIMILAR_TO*1..3]-(end:Dream {isPublic: true})
WHERE start.id < end.id
RETURN nodes(path)
```

### 5. Analytics Queries
```cypher
// User dream statistics
MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream)
RETURN {
  totalDreams: count(d),
  emotionBreakdown: collect(d.emotion),
  averageVividness: avg(d.vividness),
  lucidDreamCount: size([dream IN collect(d) WHERE dream.lucidDream = true]),
  recurringDreamCount: size([dream IN collect(d) WHERE dream.recurring = true])
}

// Global platform statistics
MATCH (d:Dream)
RETURN {
  totalDreams: count(d),
  publicDreams: size([dream IN collect(d) WHERE dream.isPublic = true]),
  emotionStats: 
    reduce(emotions = {}, emotion IN collect(d.emotion) | 
      emotions + {[emotion]: coalesce(emotions[emotion], 0) + 1}
    )
}
```

## Data Validation Rules

### User Data
- `email`: Must be valid email format
- `username`: 3-20 characters, alphanumeric + underscore
- `passwordHash`: bcrypt hash format

### Dream Data
- `title`: 1-100 characters
- `description`: 1-5000 characters  
- `emotion`: Must be from predefined list
- `vividness`: 1-10 integer
- `embedding`: Exactly 384 float values
- `tags`: Max 10 tags, each 1-30 characters

### Similarity Data
- `similarity`: Float between 0.0 and 1.0
- Only create relationships where similarity >= 0.7

## Performance Considerations

### Query Optimization
- Always use indexes for WHERE clauses
- Limit result sets appropriately
- Use OPTIONAL MATCH for nullable relationships
- Consider pagination for large result sets

### Memory Management
- Embeddings are large (384 floats ≈ 1.5KB each)
- Consider archiving old dreams
- Monitor memory usage with many similarity relationships

### Scaling Strategies
- Partition by date for large datasets  
- Consider read replicas for analytics
- Cache frequently accessed dreams
- Batch similarity calculations