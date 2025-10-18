require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./src/config/config');

// Import routes
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
console.log('📝 Registering routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Routes registered successfully');

const driver = require('./src/config/database');

app.get('/api/health', async (req, res) => {
  try {
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    res.json({ status: 'Neo4j connection successful!' });
  } catch (err) {
    res.status(500).json({ error: 'Neo4j connection failed', details: err.message });
  }
});

// ============================================================================
// API ROUTES
// ============================================================================
const graphService = require('./src/services/graphService');
const similarityService = require('./src/services/similarityService');

// Dreams Routes

/**
 * GET /api/dreams/public
 * Description: Get all public dreams
 * Parameters: None
 * Response: { success: true, count: number, dreams: Dream[] }
 */
app.get('/api/dreams/public', async (req, res) => {
  try {
    const dreams = await graphService.getPublicDreams();
    res.json({ success: true, count: dreams.length, dreams });
  } catch (error) {
    console.error('Error fetching public dreams:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/network/public
 * Description: Get the public network of all connected dreams
 * Response: { success: true, nodes: Dream[], links: Link[] }
 */
app.get('/api/network/public', async (req, res) => {
  try {
    const networkData = await graphService.getPublicNetwork();
    res.json({ 
      success: true, 
      nodeCount: networkData.nodes.length,
      linkCount: networkData.links.length,
      ...networkData 
    });
  } catch (error) {
    console.error('Error fetching public network:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dreams/user/:userId
 * Description: Get all dreams for a specific user
 * URL Parameters: 
 *   - userId (string): The ID of the user
 * Response: { success: true, count: number, dreams: Dream[] }
 */
app.get('/api/dreams/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const dreams = await graphService.getUserDreams(userId);
    res.json({ success: true, count: dreams.length, dreams });
  } catch (error) {
    console.error('Error fetching user dreams:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dreams/:dreamId
 * Description: Get a specific dream by its ID
 * URL Parameters:
 *   - dreamId (string): The ID of the dream
 * Response: { success: true, dream: Dream }
 */
app.get('/api/dreams/:dreamId', async (req, res) => {
  try {
    const { dreamId } = req.params;
    const dream = await graphService.getDreamById(dreamId);
    if (!dream) {
      return res.status(404).json({ error: 'Dream not found' });
    }
    res.json({ success: true, dream });
  } catch (error) {
    console.error('Error fetching dream:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/dreams
 * Description: Create a new dream
 * Request Body (JSON):
 *   - title (string, required): The title of the dream
 *   - description (string, required): Detailed description of the dream
 *   - userId (string, required): ID of the user creating the dream
 *   - date (string, optional): Date of the dream (YYYY-MM-DD format, defaults to today)
 *   - tags (array, optional): Array of tag strings (defaults to [])
 *   - emotion (string, optional): Emotional tone of the dream (defaults to 'neutral')
 *   - embedding (array, optional): Vector embedding for similarity matching (defaults to [])
 *   - isPublic (boolean, optional): Whether the dream is public (defaults to true)
 *   - lucidDream (boolean, optional): Whether it was a lucid dream (defaults to false)
 *   - recurring (boolean, optional): Whether it's a recurring dream (defaults to false)
 * Response: { success: true, dream: Dream }
 */
app.post('/api/dreams', async (req, res) => {
  try {
    const { title, description, date, userId, tags, emotion, embedding, isPublic, lucidDream, recurring } = req.body;
    
    // Validation
    if (!title || !description || !userId) {
      return res.status(400).json({ error: 'Title, description, and userId are required' });
    }
    
    const dreamData = {
      title,
      description,
      date: date || new Date().toISOString().split('T')[0], // Default to today
      userId,
      tags: tags || [],
      emotion: emotion || 'neutral',
      embedding: embedding || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      lucidDream: lucidDream || false,
      recurring: recurring || false
    };
    
    const dream = await graphService.createDream(dreamData);
    
    // Calculate similarities with other public dreams (async, don't wait)
    // Only if this dream is public
    if (dream.isPublic) {
      // Run similarity calculation in background
      setImmediate(async () => {
        try {
          console.log(`🔍 Calculating similarities for dream: ${dream.id}`);
          
          // Get all other public dreams
          const allDreams = await graphService.getAllPublicDreamsForSimilarity();
          
          // Find similar dreams
          const similarDreams = similarityService.findSimilarDreams(dream, allDreams, 0.2);
          
          console.log(`✨ Found ${similarDreams.length} similar dreams for dream: ${dream.id}`);
          
          // Create relationships
          if (similarDreams.length > 0) {
            const relationships = similarDreams.map(sim => ({
              dream1Id: dream.id,
              dream2Id: sim.dreamId,
              similarity: sim.similarity,
              sharedThemes: sim.sharedThemes
            }));
            
            await graphService.createSimilarityRelationshipsBatch(relationships);
            console.log(`✅ Created ${relationships.length} similarity relationships`);
          }
        } catch (error) {
          console.error('Error calculating similarities:', error);
        }
      });
    }
    
    res.status(201).json({ success: true, dream });
  } catch (error) {
    console.error('Error creating dream:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/dreams/:dreamId
 * Description: Update an existing dream
 * URL Parameters:
 *   - dreamId (string): The ID of the dream to update
 * Request Body (JSON) - Any combination of:
 *   - title (string): Updated title
 *   - description (string): Updated description
 *   - date (string): Updated date (YYYY-MM-DD format)
 *   - tags (array): Updated array of tag strings
 *   - emotion (string): Updated emotional tone
 *   - embedding (array): Updated vector embedding
 *   - isPublic (boolean): Updated public visibility
 *   - lucidDream (boolean): Updated lucid dream status
 *   - recurring (boolean): Updated recurring status
 * Response: { success: true, dream: Dream }
 */
app.put('/api/dreams/:dreamId', async (req, res) => {
  try {
    const { dreamId } = req.params;
    const updates = req.body;
    
    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
    
    const updatedDream = await graphService.updateDream(dreamId, updates);
    if (!updatedDream) {
      return res.status(404).json({ error: 'Dream not found' });
    }
    
    // Recalculate similarities if dream is public and significant fields changed
    const significantFields = ['title', 'description', 'tags', 'emotion'];
    const hasSignificantChanges = significantFields.some(field => updates.hasOwnProperty(field));
    
    if (updatedDream.isPublic && hasSignificantChanges) {
      // Run similarity recalculation in background
      setImmediate(async () => {
        try {
          console.log(`🔄 Recalculating similarities for updated dream: ${dreamId}`);
          
          // Clear existing similarity relationships
          await graphService.clearSimilarityRelationships(dreamId);
          
          // Get all other public dreams
          const allDreams = await graphService.getAllPublicDreamsForSimilarity();
          
          // Find similar dreams
          const similarDreams = similarityService.findSimilarDreams(updatedDream, allDreams, 0.2);
          
          console.log(`✨ Found ${similarDreams.length} similar dreams for updated dream: ${dreamId}`);
          
          // Create new relationships
          if (similarDreams.length > 0) {
            const relationships = similarDreams.map(sim => ({
              dream1Id: dreamId,
              dream2Id: sim.dreamId,
              similarity: sim.similarity,
              sharedThemes: sim.sharedThemes
            }));
            
            await graphService.createSimilarityRelationshipsBatch(relationships);
            console.log(`✅ Created ${relationships.length} similarity relationships`);
          }
        } catch (error) {
          console.error('Error recalculating similarities:', error);
        }
      });
    }
    
    res.json({ success: true, dream: updatedDream });
  } catch (error) {
    console.error('Error updating dream:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/dreams/:dreamId
 * Description: Delete a dream and all its relationships
 * URL Parameters:
 *   - dreamId (string): The ID of the dream to delete
 * Response: { success: true, message: string }
 */
app.delete('/api/dreams/:dreamId', async (req, res) => {
  try {
    const { dreamId } = req.params;
    await graphService.deleteDream(dreamId);
    res.json({ success: true, message: 'Dream deleted successfully' });
  } catch (error) {
    console.error('Error deleting dream:', error);
    res.status(500).json({ error: error.message });
  }
});

// Users Routes

/**
 * POST /api/users
 * Description: Create a new user (alternative to auth/register for direct user creation)
 * Request Body (JSON):
 *   - username (string, required): Unique username
 *   - email (string, required): User's email address
 *   - passwordHash (string, required): Pre-hashed password
 *   - theme (string, optional): UI theme preference (defaults to 'dark')
 *   - publicProfile (boolean, optional): Whether profile is public (defaults to true)
 *   - emailNotifications (boolean, optional): Email notification preference (defaults to true)
 * Response: { success: true, user: User }
 */
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, passwordHash, theme, publicProfile, emailNotifications } = req.body;
    
    // Validation
    if (!username || !email || !passwordHash) {
      return res.status(400).json({ error: 'Username, email, and passwordHash are required' });
    }
    
    // Check if user already exists
    const existingUser = await graphService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    const userData = {
      username,
      email,
      passwordHash,
      theme,
      publicProfile,
      emailNotifications
    };
    
    const user = await graphService.createUser(userData);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users
 * Description: Get all users (with optional filtering)
 * Query Parameters:
 *   - limit (number, optional): Maximum number of users to return (defaults to 50)
 *   - publicOnly (boolean, optional): Only return users with public profiles (defaults to false)
 * Response: { success: true, count: number, users: User[] }
 */
app.get('/api/users', async (req, res) => {
  try {
    const { limit = 50, publicOnly = false } = req.query;
    
    let query = 'MATCH (u:User)';
    if (publicOnly === 'true') {
      query += ' WHERE u.publicProfile = true';
    }
    query += ' RETURN u ORDER BY u.createdAt DESC';
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }
    
    const result = await graphService.runQuery(query);
    const users = result.records.map(record => {
      const properties = record.get('u').properties;
      return {
        ...properties,
        createdAt: properties.createdAt ? properties.createdAt.toString() : null
      };
    });
    
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/email/:email
 * Description: Find a user by their email address
 * URL Parameters:
 *   - email (string): The email address of the user to find
 * Response: { success: true, user: User }
 */
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await graphService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error finding user by email:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/:userId
 * Description: Find a user by their ID
 * URL Parameters:
 *   - userId (string): The ID of the user to find
 * Response: { success: true, user: User }
 */
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await graphService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error finding user by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/users/:userId
 * Description: Update user profile information
 * URL Parameters:
 *   - userId (string): The ID of the user to update
 * Request Body (JSON) - Any combination of:
 *   - username (string): Updated username
 *   - email (string): Updated email address
 *   - theme (string): Updated theme preference
 *   - publicProfile (boolean): Updated public profile setting
 *   - emailNotifications (boolean): Updated email notification preference
 * Response: { success: true, user: User }
 */
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove undefined values and passwordHash for security
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || key === 'passwordHash') {
        delete updates[key];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid update fields provided' });
    }
    
    // Check if email is being updated and if it already exists
    if (updates.email) {
      const existingUser = await graphService.findUserByEmail(updates.email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'Email already in use by another user' });
      }
    }
    
    const setClause = Object.keys(updates)
      .map(key => `u.${key} = $${key}`)
      .join(', ');
    
    const query = `
      MATCH (u:User {id: $userId})
      SET ${setClause}, u.updatedAt = datetime()
      RETURN u
    `;
    
    const params = { userId, ...updates };
    const result = await graphService.runQuery(query, params);
    
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const properties = result.records[0].get('u').properties;
    const user = {
      ...properties,
      createdAt: properties.createdAt ? properties.createdAt.toString() : null,
      updatedAt: properties.updatedAt ? properties.updatedAt.toString() : null
    };
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/users/:userId
 * Description: Delete a user and all their dreams and relationships
 * URL Parameters:
 *   - userId (string): The ID of the user to delete
 * Response: { success: true, message: string }
 */
app.delete('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First check if user exists
    const user = await graphService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user and all related data
    const query = `
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[:POSTED]->(d:Dream)
      DETACH DELETE u, d
    `;
    
    await graphService.runQuery(query, { userId });
    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Similarity Routes

/**
 * POST /api/dreams/:dreamId/similarity
 * Description: Create a similarity relationship between two dreams
 * URL Parameters:
 *   - dreamId (string): The ID of the source dream
 * Request Body (JSON):
 *   - targetDreamId (string, required): The ID of the target dream to relate to
 *   - similarity (number, required): Similarity score between 0 and 1 (e.g., 0.85)
 *   - sharedThemes (array, optional): Array of shared theme strings (e.g., ["flying", "water"])
 * Response: { success: true, message: string }
 */
app.post('/api/dreams/:dreamId/similarity', async (req, res) => {
  try {
    const { dreamId } = req.params;
    const { targetDreamId, similarity, sharedThemes } = req.body;
    
    // Validation
    if (!targetDreamId || !similarity) {
      return res.status(400).json({ error: 'targetDreamId and similarity are required' });
    }
    
    if (similarity < 0 || similarity > 1) {
      return res.status(400).json({ error: 'Similarity must be between 0 and 1' });
    }
    
    await graphService.createSimilarityRelationship(dreamId, targetDreamId, similarity, sharedThemes || []);
    res.status(201).json({ success: true, message: 'Similarity relationship created' });
  } catch (error) {
    console.error('Error creating similarity relationship:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dreams/:dreamId/similar
 * Description: Get dreams similar to a specific dream
 * URL Parameters:
 *   - dreamId (string): The ID of the dream to find similarities for
 * Query Parameters:
 *   - minSimilarity (number, optional): Minimum similarity threshold (0-1, defaults to 0.7)
 * Response: { success: true, count: number, similarDreams: Array<{dream: Dream, similarity: number}> }
 */
app.get('/api/dreams/:dreamId/similar', async (req, res) => {
  try {
    const { dreamId } = req.params;
    const { minSimilarity } = req.query;
    
    const similarDreams = await graphService.getSimilarDreams(dreamId, parseFloat(minSimilarity) || 0.7);
    res.json({ success: true, count: similarDreams.length, similarDreams });
  } catch (error) {
    console.error('Error fetching similar dreams:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/network/data
 * Description: Get network visualization data for dream connections
 * Parameters: None
 * Response: { success: true, count: number, networkData: Array<{dream: Dream, connections: Array}> }
 */
app.get('/api/network/data', async (req, res) => {
  try {
    const networkData = await graphService.getNetworkData();
    res.json({ success: true, count: networkData.length, networkData });
  } catch (error) {
    console.error('Error fetching network data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Statistics and Analytics Routes

/**
 * GET /api/stats/overview
 * Description: Get overall platform statistics
 * Parameters: None
 * Response: { success: true, stats: { totalUsers, totalDreams, totalPublicDreams, totalConnections } }
 */
app.get('/api/stats/overview', async (req, res) => {
  try {
    const queries = [
      'MATCH (u:User) RETURN count(u) as totalUsers',
      'MATCH (d:Dream) RETURN count(d) as totalDreams',
      'MATCH (d:Dream {isPublic: true}) RETURN count(d) as totalPublicDreams',
      'MATCH ()-[r:SIMILAR_TO]-() RETURN count(r) as totalConnections'
    ];
    
    const results = await Promise.all(queries.map(query => graphService.runQuery(query)));
    
    const stats = {
      totalUsers: results[0].records[0]?.get('totalUsers').toNumber() || 0,
      totalDreams: results[1].records[0]?.get('totalDreams').toNumber() || 0,
      totalPublicDreams: results[2].records[0]?.get('totalPublicDreams').toNumber() || 0,
      totalConnections: results[3].records[0]?.get('totalConnections').toNumber() || 0
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/user/:userId
 * Description: Get statistics for a specific user
 * URL Parameters:
 *   - userId (string): The ID of the user
 * Response: { success: true, stats: { totalDreams, publicDreams, privateDreams, lucidDreams, recurringDreams } }
 */
app.get('/api/stats/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const queries = [
      'MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream) RETURN count(d) as totalDreams',
      'MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream {isPublic: true}) RETURN count(d) as publicDreams',
      'MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream {isPublic: false}) RETURN count(d) as privateDreams',
      'MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream {lucidDream: true}) RETURN count(d) as lucidDreams',
      'MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream {recurring: true}) RETURN count(d) as recurringDreams'
    ];
    
    const results = await Promise.all(queries.map(query => graphService.runQuery(query, { userId })));
    
    const stats = {
      totalDreams: results[0].records[0]?.get('totalDreams').toNumber() || 0,
      publicDreams: results[1].records[0]?.get('publicDreams').toNumber() || 0,
      privateDreams: results[2].records[0]?.get('privateDreams').toNumber() || 0,
      lucidDreams: results[3].records[0]?.get('lucidDreams').toNumber() || 0,
      recurringDreams: results[4].records[0]?.get('recurringDreams').toNumber() || 0
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search Routes

/**
 * GET /api/dreams/search
 * Description: Search dreams by title, description, tags, or emotion
 * Query Parameters:
 *   - q (string, required): Search query
 *   - tags (string, optional): Comma-separated tags to filter by
 *   - emotion (string, optional): Emotion to filter by
 *   - publicOnly (boolean, optional): Only search public dreams (defaults to true)
 *   - limit (number, optional): Maximum results to return (defaults to 20)
 * Response: { success: true, count: number, dreams: Dream[] }
 */
app.get('/api/dreams/search', async (req, res) => {
  try {
    const { q, tags, emotion, publicOnly = true, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    
    let whereConditions = [];
    let params = { searchTerm: `(?i).*${q}.*` };
    
    // Base search condition
    whereConditions.push('(d.title =~ $searchTerm OR d.description =~ $searchTerm)');
    
    // Add public filter
    if (publicOnly === 'true' || publicOnly === true) {
      whereConditions.push('d.isPublic = true');
    }
    
    // Add tags filter
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      whereConditions.push('ANY(tag IN $tags WHERE tag IN d.tags)');
      params.tags = tagList;
    }
    
    // Add emotion filter
    if (emotion) {
      whereConditions.push('d.emotion = $emotion');
      params.emotion = emotion;
    }
    
    const query = `
      MATCH (d:Dream)
      WHERE ${whereConditions.join(' AND ')}
      RETURN d
      ORDER BY d.createdAt DESC
      LIMIT ${parseInt(limit)}
    `;
    
    const result = await graphService.runQuery(query, params);
    const dreams = result.records.map(record => {
      const properties = record.get('d').properties;
      return {
        ...properties,
        date: properties.date ? properties.date.toString() : null,
        createdAt: properties.createdAt ? properties.createdAt.toString() : null,
        updatedAt: properties.updatedAt ? properties.updatedAt.toString() : null
      };
    });
    
    res.json({ success: true, count: dreams.length, dreams });
  } catch (error) {
    console.error('Error searching dreams:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dreams/tags
 * Description: Get all unique tags used in dreams
 * Query Parameters:
 *   - publicOnly (boolean, optional): Only include tags from public dreams (defaults to true)
 *   - limit (number, optional): Maximum number of tags to return (defaults to 100)
 * Response: { success: true, count: number, tags: Array<{tag: string, count: number}> }
 */
app.get('/api/dreams/tags', async (req, res) => {
  try {
    const { publicOnly = true, limit = 100 } = req.query;
    
    let query = 'MATCH (d:Dream)';
    if (publicOnly === 'true' || publicOnly === true) {
      query += ' WHERE d.isPublic = true';
    }
    query += `
      UNWIND d.tags as tag
      RETURN tag, count(tag) as count
      ORDER BY count DESC
      LIMIT ${parseInt(limit)}
    `;
    
    const result = await graphService.runQuery(query);
    const tags = result.records.map(record => ({
      tag: record.get('tag'),
      count: record.get('count').toNumber()
    }));
    
    res.json({ success: true, count: tags.length, tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/similarity/recalculate
 * Description: Recalculate similarity relationships for all public dreams
 * Query Parameters:
 *   - minSimilarity (number, optional): Minimum similarity threshold (0.0-1.0, defaults to 0.3)
 * Response: { success: true, message: string, processed: number, relationshipsCreated: number }
 * Note: This is a heavy operation and should be run sparingly (e.g., during maintenance)
 */
app.post('/api/similarity/recalculate', async (req, res) => {
  try {
    const { minSimilarity = 0.3 } = req.query;
    const threshold = parseFloat(minSimilarity);

    if (threshold < 0 || threshold > 1) {
      return res.status(400).json({ error: 'minSimilarity must be between 0.0 and 1.0' });
    }

    console.log('🔄 Starting full similarity recalculation...');

    // Get all public dreams
    const allDreams = await graphService.getAllPublicDreamsForSimilarity();
    console.log(`📊 Processing ${allDreams.length} public dreams`);

    let totalRelationships = 0;
    const allRelationships = [];

    // Calculate similarities for each dream
    for (let i = 0; i < allDreams.length; i++) {
      const dream = allDreams[i];
      
      // Find similar dreams (only process dreams after this one to avoid duplicates)
      const remainingDreams = allDreams.slice(i + 1);
      const similarDreams = similarityService.findSimilarDreams(dream, remainingDreams, threshold);

      // Add relationships
      for (const sim of similarDreams) {
        allRelationships.push({
          dream1Id: dream.id,
          dream2Id: sim.dreamId,
          similarity: sim.similarity,
          sharedThemes: sim.sharedThemes
        });
      }

      totalRelationships += similarDreams.length;

      if ((i + 1) % 10 === 0) {
        console.log(`✨ Processed ${i + 1}/${allDreams.length} dreams`);
      }
    }

    // Clear all existing similarity relationships
    console.log('🧹 Clearing old similarity relationships...');
    await graphService.runQuery('MATCH ()-[s:SIMILAR_TO]-() DELETE s');

    // Create all new relationships in batches
    console.log(`💾 Creating ${allRelationships.length} similarity relationships...`);
    if (allRelationships.length > 0) {
      // Process in batches of 100 to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < allRelationships.length; i += batchSize) {
        const batch = allRelationships.slice(i, i + batchSize);
        await graphService.createSimilarityRelationshipsBatch(batch);
        console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allRelationships.length / batchSize)} complete`);
      }
    }

    console.log('✅ Similarity recalculation complete!');

    res.json({
      success: true,
      message: 'Similarity recalculation completed successfully',
      processed: allDreams.length,
      relationshipsCreated: allRelationships.length
    });
  } catch (error) {
    console.error('Error recalculating similarities:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/query/raw
 * Description: Execute raw Neo4j Cypher queries (for debugging/admin use)
 * Request Body (JSON):
 *   - query (string, required): The Cypher query to execute
 *   - params (object, optional): Parameters for the query (defaults to {})
 * Response: { success: true, count: number, records: Array<Object> }
 * Note: In production, only read queries (starting with MATCH) are allowed
 */
app.post('/api/query/raw', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Basic security check - only allow read operations in production
    if (process.env.NODE_ENV === 'production' && !query.trim().toUpperCase().startsWith('MATCH')) {
      return res.status(403).json({ error: 'Only read queries allowed in production' });
    }
    
    const result = await graphService.runQuery(query, params || {});
    const records = result.records.map(record => record.toObject());
    
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    console.error('Error executing raw query:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Somnio backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
