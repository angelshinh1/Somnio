const { neo4j } = require('../config/config');
const driver = require('../config/database');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();


class GraphService {
  constructor() {
    this.driver = driver;
  }

  async runQuery(query, params = {}) {
    const session = this.driver.session({ database: process.env.NEO4J_DB });
    try {
      const result = await session.run(query, params);
      return result;
    } finally {
      await session.close();
    }
  }

  // User operations
  async createUser(userData) {
    const query = `
      CREATE (u:User {
        id: $id,
        username: $username,
        email: $email,
        passwordHash: $passwordHash,
        createdAt: datetime(),
        theme: $theme,
        publicProfile: $publicProfile,
        emailNotifications: $emailNotifications
      })
      RETURN u
    `;
    
    const params = {
      id: uuidv4(),
      ...userData,
      theme: userData.theme || 'dark',
      publicProfile: userData.publicProfile !== undefined ? userData.publicProfile : true,
      emailNotifications: userData.emailNotifications !== undefined ? userData.emailNotifications : true
    };

    const result = await this.runQuery(query, params);
    return result.records[0]?.get('u').properties;
  }

  async findUserByEmail(email) {
    const query = 'MATCH (u:User {email: $email}) RETURN u';
    const result = await this.runQuery(query, { email });
    return result.records[0]?.get('u').properties;
  }

  async findUserById(id) {
    const query = 'MATCH (u:User {id: $id}) RETURN u';
    const result = await this.runQuery(query, { id });
    return result.records[0]?.get('u').properties;
  }

  // Dream operations
  async createDream(dreamData) {
    const query = `
      CREATE (d:Dream {
        id: $id,
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
      RETURN d
    `;

    const params = {
      id: uuidv4(),
      ...dreamData,
      isPublic: dreamData.isPublic !== undefined ? dreamData.isPublic : true,
      lucidDream: dreamData.lucidDream || false,
      recurring: dreamData.recurring || false
    };

    const result = await this.runQuery(query, params);

    // Create relationship to user, with error handling if user node is missing
    const relationshipQuery = `
      MATCH (u:User {id: $userId}), (d:Dream {id: $dreamId})
      CREATE (u)-[:POSTED {timestamp: datetime()}]->(d)
      RETURN u, d
    `;
    try {
      const relResult = await this.runQuery(relationshipQuery, {
        userId: dreamData.userId,
        dreamId: params.id
      });
      if (!relResult.records.length) {
        console.error(`POSTED relationship not created: User ${dreamData.userId} or Dream ${params.id} not found.`);
      }
    } catch (err) {
      console.error('Error creating POSTED relationship:', err);
    }

    return result.records[0]?.get('d').properties;
  }

  async getUserDreams(userId) {
    const query = `
        MATCH (u:User {id: $userId})-[:POSTED]->(d:Dream)
        RETURN d
        ORDER BY d.createdAt DESC
    `;
    
    const result = await this.runQuery(query, { userId });
    return result.records.map(record => {
      const properties = record.get('d').properties;
      return {
        ...properties,
        date: properties.date ? properties.date.toString() : null,
        createdAt: properties.createdAt ? properties.createdAt.toString() : null,
        updatedAt: properties.updatedAt ? properties.updatedAt.toString() : null
      };
    });
  }

  async getPublicDreams() {
    const query = `
        MATCH (d:Dream {isPublic: true})
        RETURN d
        ORDER BY d.createdAt DESC
    `;

    const result = await this.runQuery(query, {});
    return result.records.map(record => {
      const properties = record.get('d').properties;
      return {
        ...properties,
        date: properties.date ? properties.date.toString() : null,
        createdAt: properties.createdAt ? properties.createdAt.toString() : null,
        updatedAt: properties.updatedAt ? properties.updatedAt.toString() : null
      };
    });
  }

  async getDreamById(dreamId) {
    const query = 'MATCH (d:Dream {id: $dreamId}) RETURN d';
    const result = await this.runQuery(query, { dreamId });
    const properties = result.records[0]?.get('d').properties;
    if (!properties) return null;
    return {
      ...properties,
      date: properties.date ? properties.date.toString() : null,
      createdAt: properties.createdAt ? properties.createdAt.toString() : null,
      updatedAt: properties.updatedAt ? properties.updatedAt.toString() : null
    };
  }

  async updateDream(dreamId, updates) {
    const setClause = Object.keys(updates)
      .map(key => `d.${key} = $${key}`)
      .join(', ');
    
    const query = `
      MATCH (d:Dream {id: $dreamId})
      SET ${setClause}, d.updatedAt = datetime()
      RETURN d
    `;

    const params = { dreamId, ...updates };
    const result = await this.runQuery(query, params);
    const properties = result.records[0]?.get('d').properties;
    if (!properties) return null;
    return {
      ...properties,
      date: properties.date ? properties.date.toString() : null,
      createdAt: properties.createdAt ? properties.createdAt.toString() : null,
      updatedAt: properties.updatedAt ? properties.updatedAt.toString() : null
    };
  }

  async deleteDream(dreamId) {
    const query = `
      MATCH (d:Dream {id: $dreamId})
      DETACH DELETE d
    `;
    
    await this.runQuery(query, { dreamId });
    return true;
  }

  // Similarity operations
  async createSimilarityRelationship(dream1Id, dream2Id, similarity, sharedThemes = []) {
    const query = `
      MATCH (d1:Dream {id: $dream1Id}), (d2:Dream {id: $dream2Id})
      CREATE (d1)-[:SIMILAR_TO {
        similarity: $similarity,
        calculatedAt: datetime(),
        sharedThemes: $sharedThemes
      }]->(d2)
    `;

    await this.runQuery(query, { dream1Id, dream2Id, similarity, sharedThemes });
  }

  async getSimilarDreams(dreamId, minSimilarity = 0.7) {
    const query = `
      MATCH (d:Dream {id: $dreamId})-[s:SIMILAR_TO]-(similar:Dream)
      WHERE s.similarity >= $minSimilarity AND similar.isPublic = true
      RETURN similar, s.similarity as similarity
      ORDER BY s.similarity DESC
    `;

    const result = await this.runQuery(query, { dreamId, minSimilarity });
    return result.records.map(record => ({
      dream: record.get('similar').properties,
      similarity: record.get('similarity')
    }));
  }

  // Network visualization data
  async getNetworkData() {
    const query = `
      MATCH (d:Dream {isPublic: true})
      OPTIONAL MATCH (d)-[s:SIMILAR_TO]-(connected:Dream {isPublic: true})
      WHERE s.similarity >= 0.7
      RETURN d, collect({
        targetId: connected.id,
        similarity: s.similarity
      }) as connections
    `;

    const result = await this.runQuery(query);
    return result.records.map(record => ({
      dream: record.get('d').properties,
      connections: record.get('connections').filter(conn => conn.targetId)
    }));
  }

  // Clear all SIMILAR_TO relationships for a specific dream
  async clearSimilarityRelationships(dreamId) {
    const query = `
      MATCH (d:Dream {id: $dreamId})-[s:SIMILAR_TO]-()
      DELETE s
    `;
    await this.runQuery(query, { dreamId });
  }

  // Get all public dreams for similarity calculation
  async getAllPublicDreamsForSimilarity() {
    const query = `
      MATCH (d:Dream)
      WHERE d.isPublic = true
      RETURN d
    `;
    const result = await this.runQuery(query);
    return result.records.map(record => {
      const properties = record.get('d').properties;
      return {
        ...properties,
        id: properties.id,
        date: properties.date ? properties.date.toString() : null,
        createdAt: properties.createdAt ? properties.createdAt.toString() : null
      };
    });
  }

  // Create multiple similarity relationships in a batch
  async createSimilarityRelationshipsBatch(relationships) {
    if (!relationships || relationships.length === 0) return;

    const query = `
      UNWIND $relationships as rel
      MATCH (d1:Dream {id: rel.dream1Id}), (d2:Dream {id: rel.dream2Id})
      MERGE (d1)-[:SIMILAR_TO {
        similarity: rel.similarity,
        calculatedAt: datetime(),
        sharedThemes: rel.sharedThemes
      }]->(d2)
    `;

    await this.runQuery(query, { relationships });
  }

  // Helper to convert Neo4j values to plain JavaScript values
  convertNeo4jValue(value) {
    if (value === null || value === undefined) return value;
    
    // Neo4j Integer to number
    if (value.toNumber) {
      return value.toNumber();
    }
    
    // Neo4j Date/DateTime to string
    if (value.toString && (value.year !== undefined || value.month !== undefined)) {
      return value.toString();
    }
    
    // Array - recursively convert elements
    if (Array.isArray(value)) {
      return value.map(v => this.convertNeo4jValue(v));
    }
    
    // Object - recursively convert properties
    if (typeof value === 'object' && value.constructor === Object) {
      const converted = {};
      for (const [key, val] of Object.entries(value)) {
        converted[key] = this.convertNeo4jValue(val);
      }
      return converted;
    }
    
    return value;
  }

  // Get the public network of all connected dreams
  async getPublicNetwork() {
    const query = `
      MATCH (d1:Dream)-[s:SIMILAR_TO]->(d2:Dream)
      WHERE d1.isPublic = true AND d2.isPublic = true
      RETURN d1, d2, s.similarity as similarity, s.sharedThemes as sharedThemes
    `;

    const result = await this.runQuery(query);
    
    // Build nodes and links
    const nodesMap = new Map();
    const links = [];

    result.records.forEach(record => {
      const dream1Raw = record.get('d1').properties;
      const dream2Raw = record.get('d2').properties;
      const similarity = this.convertNeo4jValue(record.get('similarity'));
      const sharedThemes = this.convertNeo4jValue(record.get('sharedThemes')) || [];

      // Convert Neo4j properties to plain JavaScript values
      const dream1 = {
        id: dream1Raw.id,
        title: dream1Raw.title,
        description: dream1Raw.description,
        emotion: dream1Raw.emotion,
        tags: this.convertNeo4jValue(dream1Raw.tags) || [],
        date: this.convertNeo4jValue(dream1Raw.date),
        vividness: this.convertNeo4jValue(dream1Raw.vividness),
        lucidDream: dream1Raw.lucidDream,
        recurring: dream1Raw.recurring
      };

      const dream2 = {
        id: dream2Raw.id,
        title: dream2Raw.title,
        description: dream2Raw.description,
        emotion: dream2Raw.emotion,
        tags: this.convertNeo4jValue(dream2Raw.tags) || [],
        date: this.convertNeo4jValue(dream2Raw.date),
        vividness: this.convertNeo4jValue(dream2Raw.vividness),
        lucidDream: dream2Raw.lucidDream,
        recurring: dream2Raw.recurring
      };

      // Add nodes to map
      if (!nodesMap.has(dream1.id)) {
        nodesMap.set(dream1.id, dream1);
      }

      if (!nodesMap.has(dream2.id)) {
        nodesMap.set(dream2.id, dream2);
      }

      // Add link
      links.push({
        source: dream1.id,
        target: dream2.id,
        similarity,
        sharedThemes
      });
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }
}

module.exports = new GraphService();