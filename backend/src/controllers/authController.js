const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const graphService = require('../services/graphService');
const config = require('../config/config');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({ 
          error: 'Username, email, and password are required' 
        });
      }

      // Check if user already exists
      const existingUser = await graphService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists' 
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        username,
        email,
        passwordHash
      };

      const newUser = await graphService.createUser(userData);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Return user data (without password hash)
      const { passwordHash: _, ...userResponse } = newUser;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // Find user
      const user = await graphService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Return user data (without password hash)
      const { passwordHash: _, ...userResponse } = user;

      res.json({
        message: 'Login successful',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get current user profile
  me: async (req, res) => {
    try {
      const user = await graphService.findUserById(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user data (without password hash)
      const { passwordHash: _, ...userResponse } = user;
      
      res.json({ user: userResponse });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Logout (optional - mainly for clearing client-side token)
  logout: (req, res) => {
    res.json({ message: 'Logout successful' });
  }
};

module.exports = authController;