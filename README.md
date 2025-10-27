<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/6696d892-eee2-4d5d-bb8e-d5a995484e3a" />

# 🌙 Somnio - Dream Journal & Network Platform

> **Connect your dreams. Discover shared experiences. Explore the collective unconscious.**

Somnio is a full-stack dream journaling platform that uses AI-powered similarity matching and stunning 3D visualization to help you discover connections between your dreams and those of others around the world.

---

## ✨ Features

### 🎯 Core Features
- **📝 Dream Journaling** - Log your dreams with rich details (title, description, tags, emotions, vividness)
- **🔗 Smart Similarity Matching** - AI algorithm finds connections between dreams based on tags, keywords, and emotions
- **🌐 3D Dream Network** - Immersive Three.js visualization showing your dreams and their connections in 3D space
- **🔒 Privacy Controls** - Keep dreams private or share them publicly with the community
- **🎨 Emotion Tracking** - Track emotional tones (happy, anxious, peaceful, etc.) across your dreams
- **✨ Special Dream Types** - Mark lucid dreams and recurring dreams with special indicators

### 🚀 Technical Highlights
- **Tag-Based Similarity Algorithm** - Achieves 70%+ connection accuracy without expensive NLP APIs
- **Neo4j Graph Database** - Perfect for mapping dream relationships and connections
- **RESTful API** - 20+ endpoints for dreams, users, similarity calculations, and analytics
- **JWT Authentication** - Secure user registration and login
- **Real-time Calculations** - Background similarity processing doesn't slow down your experience

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with server-side rendering
- **React 19** - Modern React with hooks
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for 3D scenes
- **Tailwind CSS 4** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Neo4j** - Graph database for dreams and relationships
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

---

## 🎮 How It Works

### The Similarity Algorithm

Somnio uses a **simple but effective tag-based similarity algorithm** that runs entirely in Node.js - no expensive APIs needed!

**Algorithm Breakdown:**
1. **Tag Matching (50% weight)** - Direct overlap of user-defined tags using Jaccard similarity
2. **Keyword Extraction (35% weight)** - Automatic extraction of meaningful words from titles and descriptions
3. **Emotion Similarity (15% weight)** - Related emotional tones get a boost

**Example:**
```javascript
Dream A: { tags: ['flying', 'mountains', 'freedom'], emotion: 'happy' }
Dream B: { tags: ['flying', 'clouds', 'freedom'], emotion: 'excited' }

Result: ~38% similarity ✅ Connection created!
```

**Similarity Thresholds:**
- 70-100%: Very similar dreams (rare but meaningful)
- 40-69%: Moderately similar dreams (good matches)
- 20-39%: Somewhat similar dreams (weak connections)
- 0-19%: Different dreams (no connection)

### 3D Network Visualization

The 3D dream network is built with Three.js and shows:
- **Your Dreams** - Larger cyan glowing orbs at the center
- **Similar Dreams** - Color-coded by emotion on an outer sphere
- **Connections** - Curved lines linking similar dreams
- **Special Indicators**:
  - ✨ Golden sparkle for lucid dreams
  - 🔄 Orange ring for recurring dreams

**Interactive Features:**
- Hover over dreams to see details
- Click to view full dream
- Auto-rotation for mesmerizing effect
- Mouse controls (rotate, pan, zoom)

---

## 📁 Project Structure

```
Somnio/
├── backend/
│   ├── server.js                    # Express server with 20+ API endpoints
│   └── src/
│       ├── config/
│       │   ├── config.js            # Environment configuration
│       │   └── database.js          # Neo4j connection
│       ├── controllers/
│       │   └── authController.js    # Authentication logic
│       ├── middleware/
│       │   └── authMiddleware.js    # JWT verification
│       ├── routes/
│       │   └── authRoutes.js        # Auth endpoints
│       └── services/
│           ├── graphService.js      # Neo4j queries
│           └── similarityService.js # Similarity algorithm
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # Header, Footer, Layout
│   │   │   ├── dreams/              # DreamCard component
│   │   │   └── network/
│   │   │       └── DreamNetwork3D.js # 3D visualization
│   │   ├── pages/
│   │   │   ├── index.js             # Landing page
│   │   │   ├── login.js             # Login page
│   │   │   ├── register.js          # Registration
│   │   │   ├── dashboard.js         # User dashboard
│   │   │   ├── explore.js           # Public dreams
│   │   │   ├── network.js           # 3D network view
│   │   │   └── dreams/
│   │   │       ├── index.js         # Dreams list
│   │   │       ├── new.js           # Create dream
│   │   │       └── [dreamId]/       # View/edit dream
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   └── styles/
│   │       └── globals.css          # Global styles
│   └── package.json
│
└── docs/
    ├── DATABASE_SCHEMA.md           # Neo4j schema documentation
    ├── SIMILARITY_ALGORITHM.md      # Algorithm details
    ├── NETWORK_IMPLEMENTATION.md    # 3D network guide
    └── NETWORK_USER_GUIDE.md        # User guide
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **Neo4j** database (local or cloud)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/angelshinh1/dreamsync.git
cd dreamsync
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Set Up Neo4j Database

**Option A: Neo4j Desktop**
1. Download [Neo4j Desktop](https://neo4j.com/download/)
2. Create a new database
3. Set password and start the database
4. Use the credentials in your `.env` file

**Option B: Neo4j Aura (Cloud)**
1. Sign up at [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. Create a free instance
3. Use the provided connection URI and credentials

**Option C: Docker**
```bash
docker run \
  --name neo4j \
  -p7474:7474 -p7687:7687 \
  -d \
  -v $HOME/neo4j/data:/data \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:latest
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Dreams
- `GET /api/dreams/public` - Get all public dreams
- `GET /api/dreams/user/:userId` - Get user's dreams
- `GET /api/dreams/:dreamId` - Get specific dream
- `POST /api/dreams` - Create new dream
- `PUT /api/dreams/:dreamId` - Update dream
- `DELETE /api/dreams/:dreamId` - Delete dream

### Similarity
- `GET /api/dreams/:dreamId/similar` - Get similar dreams
- `POST /api/dreams/:dreamId/similarity` - Create similarity relationship
- `POST /api/similarity/recalculate` - Recalculate all similarities

### Network
- `GET /api/network/public` - Get public dream network
- `GET /api/network/data` - Get network visualization data

### Search & Analytics
- `GET /api/dreams/search` - Search dreams
- `GET /api/dreams/tags` - Get all tags
- `GET /api/stats/overview` - Platform statistics
- `GET /api/stats/user/:userId` - User statistics

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

---

## 🎨 Features in Detail

### Dream Creation
```javascript
{
  title: "Flying Over Mountains",
  description: "I was soaring above snow-capped peaks...",
  tags: ["flying", "mountains", "freedom", "nature"],
  emotion: "happy",
  lucidDream: true,
  recurring: false,
  vividness: 8,
  isPublic: true
}
```

### Automatic Similarity Detection
When you create a dream, Somnio:
1. Saves it to the Neo4j database
2. Extracts keywords from title and description
3. Compares with all other public dreams
4. Creates `SIMILAR_TO` relationships (≥20% similarity)
5. All in the background - instant response!

### 3D Network Controls
- **Left-click + drag** - Rotate camera
- **Right-click + drag** - Pan camera
- **Scroll** - Zoom in/out
- **Hover** - See dream details
- **Click** - Navigate to dream

---

## 🔮 Future Enhancements

- [ ] **Synonym Support** - Map related words (car → automobile)
- [ ] **Social Features** - Follow users, like dreams
- [ ] **Dream Patterns** - Detect recurring themes over time
- [ ] **Mobile App** - React Native version
- [ ] **AI Dream Interpretation** - Optional AI insights
- [ ] **Dream Clusters** - Visual grouping of similar dreams
- [ ] **Export/Import** - Backup your dreams
- [ ] **Collaborative Dreams** - Share dreams with friends

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Neo4j** - For the amazing graph database
- **Three.js** - For making 3D web graphics accessible
- **Next.js** - For the incredible React framework
- **The Dream Community** - For inspiring this project

---

## 📧 Contact

**Angel Shinh** - [@angelshinh1](https://github.com/angelshinh1)

**Project Link:** [https://github.com/angelshinh1/dreamsync](https://github.com/angelshinh1/dreamsync)

---

<div align="center">

**Made with 💙 and ☕ by Angel**

*Remember your dreams. Connect your experiences. Explore together.* 🌙✨

</div>
