// ============================================================================
// DreamSync Neo4j Database Schema Setup
// ============================================================================
// Run these commands in Neo4j Browser or via cypher-shell

// ============================================================================
// 1. CREATE CONSTRAINTS (Primary Keys)
// ============================================================================

// User constraints
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT user_email_unique IF NOT EXISTS  
FOR (u:User) REQUIRE u.email IS UNIQUE;

CREATE CONSTRAINT user_username_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.username IS UNIQUE;

// Dream constraints
CREATE CONSTRAINT dream_id_unique IF NOT EXISTS
FOR (d:Dream) REQUIRE d.id IS UNIQUE;

// ============================================================================
// 2. CREATE INDEXES (Performance)
// ============================================================================

// User indexes
CREATE INDEX user_email_index IF NOT EXISTS
FOR (u:User) ON (u.email);

CREATE INDEX user_created_at_index IF NOT EXISTS
FOR (u:User) ON (u.createdAt);

// Dream indexes  
CREATE INDEX dream_user_id_index IF NOT EXISTS
FOR (d:Dream) ON (d.userId);

CREATE INDEX dream_date_index IF NOT EXISTS
FOR (d:Dream) ON (d.date);

CREATE INDEX dream_created_at_index IF NOT EXISTS
FOR (d:Dream) ON (d.createdAt);

CREATE INDEX dream_is_public_index IF NOT EXISTS
FOR (d:Dream) ON (d.isPublic);

CREATE INDEX dream_emotion_index IF NOT EXISTS
FOR (d:Dream) ON (d.emotion);

// Composite index for common queries
CREATE INDEX dream_user_date_index IF NOT EXISTS
FOR (d:Dream) ON (d.userId, d.date);

CREATE INDEX dream_public_date_index IF NOT EXISTS
FOR (d:Dream) ON (d.isPublic, d.date);

// ============================================================================
// 3. SAMPLE DATA CREATION (Optional - for testing)
// ============================================================================

// Create sample users
CREATE (u1:User {
  id: 'user_1',
  username: 'dreamweaver',
  email: 'dreamer@example.com',
  passwordHash: '$2b$10$sample_hash_here',
  createdAt: datetime(),
  theme: 'dark',
  publicProfile: true,
  emailNotifications: true
});

CREATE (u2:User {
  id: 'user_2', 
  username: 'nightowl',
  email: 'night@example.com',
  passwordHash: '$2b$10$another_sample_hash',
  createdAt: datetime()
});

// Create sample dreams
CREATE (d1:Dream {
  id: 'dream_1',
  title: 'Flying Over Mountains',
  description: 'I was soaring high above snow-capped mountains, feeling completely free and weightless. The wind was rushing past my face and I could see eagles flying alongside me.',
  date: date('2024-01-15'),
  userId: 'user_1',
  tags: ['flying', 'mountains', 'freedom', 'nature'],
  emotion: 'happy',
  embedding: [0.1, 0.2, 0.3], // Placeholder - real embeddings are 384 dimensions
  createdAt: datetime(),
  isPublic: true,
  lucidDream: false,
  recurring: false
});

CREATE (d2:Dream {
  id: 'dream_2',
  title: 'Endless Ocean',
  description: 'I was floating in a calm, crystal-clear ocean that seemed to stretch infinitely in all directions. I felt completely at peace.',
  date: date('2024-01-16'),
  userId: 'user_2', 
  tags: ['water', 'peace', 'infinite', 'floating'],
  emotion: 'peaceful',
  embedding: [0.15, 0.25, 0.35], // Placeholder
  createdAt: datetime(),
  isPublic: true,
  lucidDream: true,
  recurring: false
});

// Create relationships
MATCH (u1:User {id: 'user_1'}), (d1:Dream {id: 'dream_1'})
CREATE (u1)-[:POSTED {timestamp: datetime()}]->(d1);

MATCH (u2:User {id: 'user_2'}), (d2:Dream {id: 'dream_2'}) 
CREATE (u2)-[:POSTED {timestamp: datetime()}]->(d2);

MATCH (d1:Dream {id: 'dream_1'}), (d2:Dream {id: 'dream_2'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.75,
  calculatedAt: datetime(),
  sharedThemes: ['freedom', 'nature', 'peaceful']
}]->(d2);

// ============================================================================
// 4. USEFUL QUERIES FOR DEVELOPMENT
// ============================================================================

// Get all users and their dream count
// MATCH (u:User)
// OPTIONAL MATCH (u)-[:POSTED]->(d:Dream)
// RETURN u.username, u.email, count(d) as dreamCount
// ORDER BY dreamCount DESC;

// Get all dreams with their similarities
// MATCH (d1:Dream)-[s:SIMILAR_TO]->(d2:Dream)
// RETURN d1.title, d2.title, s.similarity
// ORDER BY s.similarity DESC;

// Get dreams by emotion
// MATCH (d:Dream {emotion: 'happy'})
// RETURN d.title, d.description, d.date
// ORDER BY d.date DESC;

// Get public dreams for network visualization
// MATCH (d:Dream {isPublic: true})
// OPTIONAL MATCH (d)-[s:SIMILAR_TO]-(d2:Dream)
// RETURN d, collect(s) as relationships, collect(d2) as connectedDreams;

// ============================================================================
// 5. CLEANUP COMMANDS (Use with caution!)
// ============================================================================

// Delete all data (for development reset)
// MATCH (n) DETACH DELETE n;

// Delete only relationships
// MATCH ()-[r]-() DELETE r;

// ============================================================================
// 6. SCHEMA VALIDATION QUERIES
// ============================================================================

// Check constraints
// CALL db.constraints();

// Check indexes  
// CALL db.indexes();

// Show schema
// CALL db.schema.visualization();