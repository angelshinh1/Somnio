// ============================================================================
// Somnio Neo4j Database Schema Setup
// ============================================================================
// Run these commands in Neo4j Browser or via cypher-shell
// Database: neo4j (Aura default database)
// ============================================================================

// ============================================================================
// 1. CREATE CONSTRAINTS (Primary Keys)
// ============================================================================

CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT user_email_unique IF NOT EXISTS  
FOR (u:User) REQUIRE u.email IS UNIQUE;

CREATE CONSTRAINT user_username_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.username IS UNIQUE;

CREATE CONSTRAINT dream_id_unique IF NOT EXISTS
FOR (d:Dream) REQUIRE d.id IS UNIQUE;

// ============================================================================
// 2. CREATE INDEXES (Performance)
// ============================================================================

CREATE INDEX user_email_index IF NOT EXISTS
FOR (u:User) ON (u.email);

CREATE INDEX dream_user_id_index IF NOT EXISTS
FOR (d:Dream) ON (d.userId);

CREATE INDEX dream_date_index IF NOT EXISTS
FOR (d:Dream) ON (d.date);

CREATE INDEX dream_is_public_index IF NOT EXISTS
FOR (d:Dream) ON (d.isPublic);

CREATE INDEX dream_emotion_index IF NOT EXISTS
FOR (d:Dream) ON (d.emotion);

// ============================================================================
// 3. CLEAR EXISTING DATA (Optional - uncomment to reset)
// ============================================================================

// MATCH (n) DETACH DELETE n;

// ============================================================================
// 4. CREATE USERS
// ============================================================================
// Password for all users: VyrVQPK3m@79DfD

CREATE (u1:User {
  id: 'user_alice_001',
  username: 'alice_dreamer',
  email: 'alice@somnio.app',
  passwordHash: '$2b$10$TrARDcllGGhstLelPkVKOOMZuZk1laTYBQdg2cWV1OGoPepscPiku',
  createdAt: datetime(),
  theme: 'dark',
  publicProfile: true,
  emailNotifications: true
});

CREATE (u2:User {
  id: 'user_bob_002',
  username: 'bob_nightowl',
  email: 'bob@somnio.app',
  passwordHash: '$2b$10$TrARDcllGGhstLelPkVKOOMZuZk1laTYBQdg2cWV1OGoPepscPiku',
  createdAt: datetime(),
  theme: 'dark',
  publicProfile: true,
  emailNotifications: true
});

CREATE (u3:User {
  id: 'user_carol_003',
  username: 'carol_stargazer',
  email: 'carol@somnio.app',
  passwordHash: '$2b$10$TrARDcllGGhstLelPkVKOOMZuZk1laTYBQdg2cWV1OGoPepscPiku',
  createdAt: datetime(),
  theme: 'light',
  publicProfile: true,
  emailNotifications: false
});

CREATE (u4:User {
  id: 'user_david_004',
  username: 'david_explorer',
  email: 'david@somnio.app',
  passwordHash: '$2b$10$TrARDcllGGhstLelPkVKOOMZuZk1laTYBQdg2cWV1OGoPepscPiku',
  createdAt: datetime(),
  theme: 'dark',
  publicProfile: true,
  emailNotifications: true
});

CREATE (u5:User {
  id: 'user_emma_005',
  username: 'emma_wanderer',
  email: 'emma@somnio.app',
  passwordHash: '$2b$10$TrARDcllGGhstLelPkVKOOMZuZk1laTYBQdg2cWV1OGoPepscPiku',
  createdAt: datetime(),
  theme: 'dark',
  publicProfile: true,
  emailNotifications: true
});

// ============================================================================
// 5. CREATE DREAMS
// ============================================================================

// Alice's Dreams
CREATE (d1:Dream {
  id: 'dream_alice_001',
  title: 'Flying Over Mountains',
  description: 'I was soaring high above snow-capped mountains, feeling completely free and weightless. The wind was rushing past my face and I could see eagles flying alongside me. The peaks glowed golden in the sunset.',
  date: date('2024-10-15'),
  userId: 'user_alice_001',
  tags: ['flying', 'mountains', 'freedom', 'nature', 'eagles', 'sunset'],
  emotion: 'happy',
  vividness: 9,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: true,
  recurring: false
});

CREATE (d2:Dream {
  id: 'dream_alice_002',
  title: 'Crystal Cave Discovery',
  description: 'I discovered a hidden cave filled with glowing crystals of every color. Each crystal hummed with a different musical note, creating an ethereal symphony. I felt like I had found a sacred place.',
  date: date('2024-10-16'),
  userId: 'user_alice_001',
  tags: ['cave', 'crystals', 'music', 'discovery', 'magical', 'glowing'],
  emotion: 'curious',
  vividness: 8,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: false,
  recurring: false
});

// Bob's Dreams
CREATE (d3:Dream {
  id: 'dream_bob_001',
  title: 'Endless Ocean',
  description: 'I was floating in a calm, crystal-clear ocean that seemed to stretch infinitely in all directions. I felt completely at peace, watching colorful fish swim beneath me in the turquoise waters.',
  date: date('2024-10-14'),
  userId: 'user_bob_002',
  tags: ['ocean', 'water', 'peace', 'infinite', 'floating', 'fish'],
  emotion: 'peaceful',
  vividness: 7,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: true,
  recurring: false
});

CREATE (d4:Dream {
  id: 'dream_bob_002',
  title: 'Underground Library',
  description: 'I wandered through an enormous underground library with shelves that reached into darkness. Ancient books whispered their stories as I passed. A mysterious librarian guided me to a book with my name on it.',
  date: date('2024-10-17'),
  userId: 'user_bob_002',
  tags: ['library', 'books', 'underground', 'ancient', 'mystery', 'knowledge'],
  emotion: 'curious',
  vividness: 8,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: false,
  recurring: false
});

// Carol's Dreams
CREATE (d5:Dream {
  id: 'dream_carol_001',
  title: 'Garden of Floating Flowers',
  description: 'I walked through a garden where flowers floated in mid-air, their petals shimmering with rainbow colors. Each flower played a gentle melody when I touched it. The air smelled like honey and vanilla.',
  date: date('2024-10-13'),
  userId: 'user_carol_003',
  tags: ['garden', 'flowers', 'floating', 'music', 'colorful', 'peaceful'],
  emotion: 'happy',
  vividness: 9,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: false,
  recurring: true
});

CREATE (d6:Dream {
  id: 'dream_carol_002',
  title: 'City in the Clouds',
  description: 'I explored a magnificent city built on clouds, with marble bridges connecting floating islands. The architecture was impossible yet beautiful. People flew between buildings with wings made of light.',
  date: date('2024-10-16'),
  userId: 'user_carol_003',
  tags: ['city', 'clouds', 'flying', 'architecture', 'magical', 'floating'],
  emotion: 'excited',
  vividness: 10,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: true,
  recurring: false
});

// David's Dreams
CREATE (d7:Dream {
  id: 'dream_david_001',
  title: 'Desert of Glass',
  description: 'I walked across an endless desert where the sand was made of colorful glass shards that chimed in the wind. The sunset turned everything into a kaleidoscope of colors. I felt both alone and connected to everything.',
  date: date('2024-10-15'),
  userId: 'user_david_004',
  tags: ['desert', 'glass', 'colors', 'sunset', 'solitude', 'beauty'],
  emotion: 'peaceful',
  vividness: 8,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: false,
  recurring: false
});

CREATE (d8:Dream {
  id: 'dream_david_002',
  title: 'Time Spiral Staircase',
  description: 'I climbed a spiral staircase that existed outside of time. Each step showed me a different moment from history or possible futures. The higher I climbed, the more I understood about the nature of reality.',
  date: date('2024-10-17'),
  userId: 'user_david_004',
  tags: ['time', 'staircase', 'spiral', 'history', 'future', 'philosophy'],
  emotion: 'confused',
  vividness: 7,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: true,
  recurring: false
});

// Emma's Dreams
CREATE (d9:Dream {
  id: 'dream_emma_001',
  title: 'Forest of Whispers',
  description: 'I wandered through a mystical forest where the trees whispered ancient secrets. Bioluminescent mushrooms lit my path, and I could understand the language of the forest creatures around me.',
  date: date('2024-10-14'),
  userId: 'user_emma_005',
  tags: ['forest', 'mystical', 'whispers', 'mushrooms', 'creatures', 'nature'],
  emotion: 'curious',
  vividness: 9,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: false,
  recurring: true
});

CREATE (d10:Dream {
  id: 'dream_emma_002',
  title: 'Painting Reality',
  description: 'I had a magical paintbrush that could paint objects into existence. I created mountains, rivers, and entire ecosystems with each stroke. Everything I painted became real and alive.',
  date: date('2024-10-16'),
  userId: 'user_emma_005',
  tags: ['painting', 'creation', 'magic', 'art', 'reality', 'power'],
  emotion: 'excited',
  vividness: 10,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: true,
  recurring: false
});

CREATE (d11:Dream {
  id: 'dream_emma_003',
  title: 'Underwater Metropolis',
  description: 'I explored a thriving city deep underwater, protected by a shimmering dome. Buildings made of coral and glass housed people who could breathe water. Whales swam overhead like buses in the sky.',
  date: date('2024-10-18'),
  userId: 'user_emma_005',
  tags: ['underwater', 'city', 'ocean', 'coral', 'whales', 'architecture'],
  emotion: 'peaceful',
  vividness: 8,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: false,
  recurring: false
});

CREATE (d12:Dream {
  id: 'dream_alice_003',
  title: 'Starlight Meadow',
  description: 'I lay in a meadow at night where the grass glowed with starlight. Constellations came down from the sky to dance around me. I felt connected to the universe in a profound way.',
  date: date('2024-10-18'),
  userId: 'user_alice_001',
  tags: ['meadow', 'stars', 'night', 'constellations', 'peace', 'cosmic'],
  emotion: 'peaceful',
  vividness: 9,
  createdAt: datetime(),
  isPublic: true,
  lucidDream: true,
  recurring: false
});

// ============================================================================
// 6. CREATE RELATIONSHIPS - USER POSTED DREAMS
// ============================================================================

MATCH (u:User {id: 'user_alice_001'}), (d:Dream {id: 'dream_alice_001'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_alice_001'}), (d:Dream {id: 'dream_alice_002'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_alice_001'}), (d:Dream {id: 'dream_alice_003'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_bob_002'}), (d:Dream {id: 'dream_bob_001'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_bob_002'}), (d:Dream {id: 'dream_bob_002'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_carol_003'}), (d:Dream {id: 'dream_carol_001'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_carol_003'}), (d:Dream {id: 'dream_carol_002'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_david_004'}), (d:Dream {id: 'dream_david_001'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_david_004'}), (d:Dream {id: 'dream_david_002'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_emma_005'}), (d:Dream {id: 'dream_emma_001'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_emma_005'}), (d:Dream {id: 'dream_emma_002'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

MATCH (u:User {id: 'user_emma_005'}), (d:Dream {id: 'dream_emma_003'})
CREATE (u)-[:POSTED {timestamp: datetime()}]->(d);

// ============================================================================
// 7. CREATE SIMILARITY RELATIONSHIPS
// ============================================================================

// Flying dreams - Alice's flying and Carol's cloud city
MATCH (d1:Dream {id: 'dream_alice_001'}), (d2:Dream {id: 'dream_carol_002'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.78,
  calculatedAt: datetime(),
  sharedThemes: ['flying', 'clouds', 'freedom']
}]->(d2);

// Water/Ocean dreams - Bob's ocean and Emma's underwater city
MATCH (d1:Dream {id: 'dream_bob_001'}), (d2:Dream {id: 'dream_emma_003'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.82,
  calculatedAt: datetime(),
  sharedThemes: ['water', 'ocean', 'peaceful']
}]->(d2);

// Mystical/Magical dreams - Alice's crystal cave and Carol's floating garden
MATCH (d1:Dream {id: 'dream_alice_002'}), (d2:Dream {id: 'dream_carol_001'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.75,
  calculatedAt: datetime(),
  sharedThemes: ['magical', 'music', 'colorful']
}]->(d2);

// Discovery/Exploration dreams - Bob's library and David's time staircase
MATCH (d1:Dream {id: 'dream_bob_002'}), (d2:Dream {id: 'dream_david_002'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.70,
  calculatedAt: datetime(),
  sharedThemes: ['knowledge', 'mystery', 'discovery']
}]->(d2);

// Nature dreams - Alice's mountains and Emma's forest
MATCH (d1:Dream {id: 'dream_alice_001'}), (d2:Dream {id: 'dream_emma_001'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.65,
  calculatedAt: datetime(),
  sharedThemes: ['nature', 'mystical', 'freedom']
}]->(d2);

// Peaceful dreams - Alice's starlight meadow and Bob's ocean
MATCH (d1:Dream {id: 'dream_alice_003'}), (d2:Dream {id: 'dream_bob_001'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.80,
  calculatedAt: datetime(),
  sharedThemes: ['peaceful', 'cosmic', 'floating']
}]->(d2);

// Peaceful dreams - David's desert and Alice's starlight meadow
MATCH (d1:Dream {id: 'dream_david_001'}), (d2:Dream {id: 'dream_alice_003'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.73,
  calculatedAt: datetime(),
  sharedThemes: ['peaceful', 'colors', 'beauty']
}]->(d2);

// Creative/Art dreams - Emma's painting and Carol's floating garden
MATCH (d1:Dream {id: 'dream_emma_002'}), (d2:Dream {id: 'dream_carol_001'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.68,
  calculatedAt: datetime(),
  sharedThemes: ['creation', 'colorful', 'magical']
}]->(d2);

// Flying/Height dreams - Alice's mountains and Carol's cloud city
MATCH (d1:Dream {id: 'dream_alice_001'}), (d2:Dream {id: 'dream_carol_002'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.85,
  calculatedAt: datetime(),
  sharedThemes: ['flying', 'height', 'freedom', 'magical']
}]->(d2);

// Mystical nature - Emma's forest and Alice's crystal cave
MATCH (d1:Dream {id: 'dream_emma_001'}), (d2:Dream {id: 'dream_alice_002'})
CREATE (d1)-[:SIMILAR_TO {
  similarity: 0.71,
  calculatedAt: datetime(),
  sharedThemes: ['mystical', 'discovery', 'glowing']
}]->(d2);

// ============================================================================
// 8. VERIFICATION QUERIES
// ============================================================================

// Count all nodes
// MATCH (n) RETURN count(n) as totalNodes;

// Count users and dreams
// MATCH (u:User) RETURN count(u) as userCount;
// MATCH (d:Dream) RETURN count(d) as dreamCount;

// Count relationships
// MATCH ()-[r:SIMILAR_TO]->() RETURN count(r) as similarityCount;
// MATCH ()-[r:POSTED]->() RETURN count(r) as postedCount;

// Get all users with their dream counts
// MATCH (u:User)
// OPTIONAL MATCH (u)-[:POSTED]->(d:Dream)
// RETURN u.username, u.email, count(d) as dreamCount
// ORDER BY dreamCount DESC;

// Get all dream connections
// MATCH (d1:Dream)-[s:SIMILAR_TO]->(d2:Dream)
// RETURN d1.title, d2.title, s.similarity, s.sharedThemes
// ORDER BY s.similarity DESC;

// Get dreams by emotion
// MATCH (d:Dream)
// RETURN d.emotion, count(*) as count
// ORDER BY count DESC;

// Get network data for visualization
// MATCH (d:Dream {isPublic: true})
// OPTIONAL MATCH (d)-[s:SIMILAR_TO]-(d2:Dream)
// RETURN d, collect(s) as relationships, collect(d2) as connectedDreams;

// ============================================================================
// 9. SUMMARY
// ============================================================================
// Users: 5 (Alice, Bob, Carol, David, Emma)
// Dreams: 12 total (Alice: 3, Bob: 2, Carol: 2, David: 2, Emma: 3)
// Similarities: 10 connections
// All users password: VyrVQPK3m@79DfD
// Database: neo4j (Neo4j Aura default)
// ============================================================================
