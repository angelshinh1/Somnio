# DreamSync - Project Guidelines

## Project Overview

**DreamSync** is a collaborative dream journal platform that allows users to log their dreams and discover connections with others who've had similar dream experiences. Using natural language processing and graph database technology, the platform analyzes dream content, identifies patterns, and visualizes dream relationships in an interactive 3D network.

### Core Value Proposition
- Log and track personal dreams over time
- Discover similar dreams from other users using AI-powered analysis
- Visualize dream connections in an immersive 3D graph
- Identify patterns and trends in dream content
- Build a collective dream database

---

## Technology Stack

### Frontend
- **next.js** - UI framework
- **Three.js** - WebGL 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Visual effects and post-processing
- **Recharts** - 2D charts for statistics
- **Axios** - HTTP client
- **React Router** - Navigation
- **Tailwind CSS** - Styling

### Backend (Node.js)
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **Neo4j JavaScript Driver** - Graph database connection
- **Axios** - HTTP client for calling Python service
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **bcrypt** - Password hashing
- **jsonwebtoken** - Authentication

### NLP Service (Python)
- **Flask** - Lightweight web framework
- **sentence-transformers** - Generate dream embeddings
- **numpy** - Numerical computations
- **scikit-learn** - Cosine similarity calculations
- **flask-cors** - CORS handling

### Database
- **Neo4j** - Graph database for storing dreams and relationships

### Development Tools
- **Vite** - Frontend build tool
- **nodemon** - Auto-restart Node.js server
- **Postman** - API testing

---

## Repository Structure

```
dreamsync/
├── frontend/                      # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── dreams/
│   │   │   │   ├── DreamForm.jsx
│   │   │   │   ├── DreamList.jsx
│   │   │   │   ├── DreamCard.jsx
│   │   │   │   └── DreamDetails.jsx
│   │   │   ├── visualization/
│   │   │   │   ├── DreamScene3D.jsx        # Main 3D scene
│   │   │   │   ├── DreamNode.jsx           # Individual dream sphere
│   │   │   │   ├── DreamConnections.jsx    # Lines between dreams
│   │   │   │   ├── CameraControls.jsx      # Orbit controls
│   │   │   │   ├── Lighting.jsx            # Scene lighting
│   │   │   │   └── Effects.jsx             # Post-processing effects
│   │   │   ├── stats/
│   │   │   │   ├── DreamStats.jsx
│   │   │   │   └── PatternCharts.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── common/
│   │   │       ├── Loading.jsx
│   │   │       └── ErrorBoundary.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DreamNetwork.jsx            # 3D visualization page
│   │   │   ├── MyDreams.jsx
│   │   │   └── Explore.jsx
│   │   ├── services/
│   │   │   ├── api.js                      # Axios instance
│   │   │   ├── authService.js
│   │   │   └── dreamService.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useDreams.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
│
├── backend/                       # Node.js/Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js               # Neo4j connection
│   │   │   └── config.js                 # App configuration
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── dreamController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── dreamRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Dream.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── services/
│   │   │   ├── nlpService.js             # Calls Python NLP service
│   │   │   ├── dreamService.js
│   │   │   └── graphService.js           # Neo4j queries
│   │   └── utils/
│   │       ├── logger.js
│   │       └── helpers.js
│   ├── server.js                          # Entry point
│   ├── package.json
│   └── .env
│
├── nlp-service/                   # Python Flask NLP microservice
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes.py                     # Flask routes
│   │   ├── nlp_processor.py              # NLP logic
│   │   └── config.py
│   ├── models/
│   │   └── embeddings/                   # Cached models
│   ├── requirements.txt
│   ├── run.py                            # Entry point
│   └── .env
│
├── docs/                          # Documentation
│   ├── API.md                            # API documentation
│   ├── SETUP.md                          # Setup instructions
│   ├── ARCHITECTURE.md                   # System architecture
│   └── CONTRIBUTING.md
│
├── scripts/                       # Utility scripts
│   ├── setup-neo4j.cypher               # Neo4j schema setup
│   └── seed-data.js                     # Sample data
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Dream Journal│  │ 3D Network   │  │ Statistics│ │
│  │              │  │ Visualization│  │           │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Auth         │  │ Dream CRUD   │  │ Graph     │ │
│  │ Controller   │  │ Controller   │  │ Service   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────┬────────────────────┬───────────────────────┘
          │                    │
          │                    └──────────────┐
          │ HTTP                              │
          ▼                                   ▼
┌─────────────────────┐          ┌─────────────────────┐
│  Python NLP Service │          │      Neo4j DB       │
│  ┌───────────────┐  │          │  ┌───────────────┐ │
│  │ Sentence      │  │          │  │ Dream Nodes   │ │
│  │ Transformers  │  │          │  │ User Nodes    │ │
│  │ Embeddings    │  │          │  │ SIMILAR_TO    │ │
│  └───────────────┘  │          │  │ relationships │ │
└─────────────────────┘          └─────────────────────┘
```

### Data Flow

1. **Dream Submission:**
   ```
   User → React Form → Backend API → Python NLP Service
                                   → Generate Embedding
                                   ↓
                              Backend API → Neo4j
                                         → Store Dream + Embedding
                                         → Calculate Similarities
                                         → Create Relationships
   ```

2. **3D Visualization:**
   ```
   User → Request Network → Backend API → Neo4j
                                       → Query Dreams + Relationships
                                       ↓
                                  React Three Fiber
                                       → Render 3D Scene
                                       → Position Nodes
                                       → Draw Connections
   ```

---

## Database Schema (Neo4j)

### Node Types

**User Node:**
```cypher
(:User {
  id: string,
  username: string,
  email: string,
  passwordHash: string,
  createdAt: datetime,
  settings: map
})
```

**Dream Node:**
```cypher
(:Dream {
  id: string,
  title: string,
  description: string,
  date: date,
  userId: string,
  tags: [string],
  emotion: string,
  embedding: [float],  // 384-dimensional vector
  createdAt: datetime,
  isPublic: boolean
})
```

### Relationship Types

**POSTED:**
```cypher
(:User)-[:POSTED {timestamp: datetime}]->(:Dream)
```

**SIMILAR_TO:**
```cypher
(:Dream)-[:SIMILAR_TO {
  similarity: float,  // 0.0 to 1.0
  calculatedAt: datetime
}]->(:Dream)
```

### Indexes
```cypher
CREATE INDEX user_id FOR (u:User) ON (u.id);
CREATE INDEX dream_id FOR (d:Dream) ON (d.id);
CREATE INDEX dream_user FOR (d:Dream) ON (d.userId);
CREATE INDEX dream_date FOR (d:Dream) ON (d.date);
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Dreams
- `POST /api/dreams` - Create new dream
- `GET /api/dreams` - Get all dreams (with filters)
- `GET /api/dreams/:id` - Get specific dream
- `PUT /api/dreams/:id` - Update dream
- `DELETE /api/dreams/:id` - Delete dream
- `GET /api/dreams/user/:userId` - Get user's dreams
- `GET /api/dreams/:id/similar` - Get similar dreams

### Network
- `GET /api/network/graph` - Get dream network data
- `GET /api/network/stats` - Get network statistics

### NLP Service (Internal)
- `POST /nlp/analyze` - Analyze dream text
- `POST /nlp/similarity` - Calculate similarity between dreams

---

## 3D Visualization Architecture

### Scene Components

**1. Dream Nodes (Spheres)**
- Size: Based on number of connections
- Color: Based on emotion/category
  - Red: Nightmares
  - Blue: Sad dreams
  - Yellow: Happy dreams
  - Purple: Surreal/weird
  - Green: Neutral
- Opacity: Public vs private
- Glow: Hover/selection state

**2. Connections (Lines)**
- Width: Based on similarity strength
- Opacity: Based on similarity strength
- Animated pulse effect
- Color gradient between connected nodes

**3. Camera System**
- Orbit controls (rotate, zoom, pan)
- Auto-rotation toggle
- Smooth transitions to selected nodes
- Reset view button

**4. Interaction**
- Click node → Show dream details
- Hover → Highlight node + connections
- Double-click → Focus on node cluster
- Search → Highlight matching dreams
- Timeline slider → Show temporal evolution

**5. Performance Optimizations**
- Level of Detail (LOD) for distant nodes
- Frustum culling
- Instanced rendering for similar objects
- Lazy loading for large networks

---

## NLP Processing Pipeline

### 1. Dream Analysis
```python
Input: Dream text
    ↓
Text Preprocessing
    ↓
Sentence Transformer (all-MiniLM-L6-v2)
    ↓
384-dimensional embedding vector
    ↓
Store in Neo4j
```

### 2. Similarity Calculation
```python
For each new dream:
    1. Get embedding vector
    2. Query all existing dreams
    3. Calculate cosine similarity
    4. Create relationships where similarity > 0.7
    5. Store similarity scores
```

### 3. Pattern Detection (Future)
- Identify common themes
- Tag extraction
- Emotion classification
- Temporal pattern analysis

---

## Development Workflow

### Setup Process
1. Install Neo4j Desktop/Community Edition
2. Clone repository
3. Set up Python virtual environment
4. Install Python dependencies
5. Install Node.js dependencies (backend)
6. Install Node.js dependencies (frontend)
7. Configure environment variables
8. Initialize Neo4j schema
9. Start services in order:
   - Neo4j
   - Python NLP service
   - Node.js backend
   - React frontend

### Running the Application

**Terminal 1 - Neo4j:**
```bash
# Start Neo4j (via Desktop or)
neo4j console
```

**Terminal 2 - Python NLP Service:**
```bash
cd nlp-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
# Runs on http://localhost:5001
```

**Terminal 3 - Node.js Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 4 - React Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Key Features Implementation

### 1. Dream Submission & Analysis
- User submits dream via form
- Text sent to NLP service for embedding
- Dream stored in Neo4j with embedding
- Similarities calculated asynchronously
- Relationships created for similar dreams

### 2. 3D Network Visualization
- Fetch dreams + relationships from Neo4j
- Position nodes using force-directed layout
- Render using Three.js via React Three Fiber
- Interactive controls for exploration
- Real-time updates when new dreams added

### 3. Dream Discovery
- Browse public dreams
- Filter by emotion, date, tags
- Search by keywords
- View similar dreams to yours
- Explore connected dream clusters

### 4. Personal Dashboard
- View your dream timeline
- Statistics: dream frequency, common themes
- Mood tracking over time
- Private journal entries

---

## Security Considerations

- JWT-based authentication
- Password hashing with bcrypt
- Environment variables for secrets
- CORS configuration
- Input validation and sanitization
- Rate limiting on API endpoints
- Privacy controls (public/private dreams)
- Anonymized dream sharing option

---

## Future Enhancements

### Phase 2
- User profiles and avatars
- Dream tagging system
- Comments and discussions
- Dream interpretation crowdsourcing
- Email notifications for similar dreams

### Phase 3
- Advanced pattern detection
- Temporal analysis (moon phases, seasons)
- Dream prediction algorithm
- Social features (follow users, share dreams)
- Mobile app (React Native)

### Phase 4
- Dream-to-image generation (Stable Diffusion)
- Audio dream journals
- Multilingual support
- VR dream exploration
- Machine learning for dream insights

---

## Performance Targets

- Page load: < 2 seconds
- 3D scene initialization: < 1 second
- Dream submission: < 500ms
- Similarity calculation: < 2 seconds
- Support 10,000+ dreams in network
- 60 FPS in 3D visualization
- Mobile responsive design

---

## Testing Strategy

- Unit tests: Jest for backend logic
- Integration tests: API endpoint testing
- E2E tests: Cypress for critical user flows
- 3D performance testing: FPS monitoring
- Load testing: Artillery for API stress testing
- Manual QA: Browser compatibility

---

## Deployment (Future)

### Simple Deployment Options:
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Heroku, Railway, or DigitalOcean
- **Neo4j**: Neo4j Aura (cloud)
- **Python Service**: PythonAnywhere or Heroku

### Environment Variables
- Neo4j credentials
- JWT secret
- API URLs
- CORS origins
- NLP service URL

---

## Contributing Guidelines

1. Fork the repository
2. Create feature branch
3. Make changes with clear commits
4. Write/update tests
5. Update documentation
6. Submit pull request
7. Code review process

---

## License

MIT License - Open source, free to use and modify

---

## Support & Community

- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for detailed guides
- Discord/Slack for real-time chat (future)

---

This project balances technical complexity with practical scope, making it an excellent portfolio piece that demonstrates:
- Full-stack development skills
- Graph database expertise
- NLP/ML integration
- 3D visualization capabilities
- Clean architecture and code organization
- Modern web development practices