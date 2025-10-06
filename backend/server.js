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
// TEST ROUTES - Remove these after testing
// ============================================================================
const graphService = require('./src/services/graphService');

// Test 1: Create a test user
app.post('/api/test/create-user', async (req, res) => {
  try {
    const userData = {
      username: 'testuser',
      email: 'test@example.com', 
      passwordHash: 'hashedpassword123'
    };
    
    const user = await graphService.createUser(userData);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 2: Find user by email
app.get('/api/test/find-user/:email', async (req, res) => {
  try {
    const user = await graphService.findUserByEmail(req.params.email);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 3: Create a test dream
app.post('/api/test/create-dream', async (req, res) => {
  try {
    const dreamData = {
      title: 'Flying Dream',
      description: 'I was flying over the city',
      date: '2025-10-05',
      userId: 'user_1', // Use existing user ID from your Neo4j data
      tags: ['flying', 'city'],
      emotion: 'happy',
      embedding: [0.1, 0.2, 0.3] // Fake embedding for testing
    };
    
    const dream = await graphService.createDream(dreamData);
    res.json({ success: true, dream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 4: Get all public dreams
app.get('/api/test/public-dreams', async (req, res) => {
  try {
    const dreams = await graphService.getPublicDreams();
    res.json({ success: true, count: dreams.length, dreams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 5: Get user's dreams
app.get('/api/test/user-dreams/:userId', async (req, res) => {
  try {
    const dreams = await graphService.getUserDreams(req.params.userId);
    res.json({ success: true, count: dreams.length, dreams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 6: Create similarity relationship
app.post('/api/test/create-similarity', async (req, res) => {
  try {
    await graphService.createSimilarityRelationship('dream_1', 'dream_2', 0.85, ['flying']);
    res.json({ success: true, message: 'Similarity relationship created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 7: Get network data for visualization
app.get('/api/test/network-data', async (req, res) => {
  try {
    const networkData = await graphService.getNetworkData();
    res.json({ success: true, count: networkData.length, networkData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 8: Run raw cypher query
app.post('/api/test/raw-query', async (req, res) => {
  try {
    const { query, params } = req.body;
    const result = await graphService.runQuery(query, params || {});
    const data = result.records.map(record => record.toObject());
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 9: List all test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    message: 'DreamSync Test Endpoints',
    endpoints: [
      'POST /api/test/create-user - Create a test user',
      'GET /api/test/find-user/:email - Find user by email',
      'POST /api/test/create-dream - Create a test dream',
      'GET /api/test/public-dreams - Get all public dreams',
      'GET /api/test/user-dreams/:userId - Get user dreams',
      'POST /api/test/create-similarity - Create similarity relationship',
      'GET /api/test/network-data - Get network visualization data',
      'POST /api/test/raw-query - Run raw cypher query',
      'GET /api/test - Show this help'
    ]
  });
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
  console.log(`🚀 DreamSync backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
