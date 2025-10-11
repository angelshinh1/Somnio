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
        success: true,
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
        success: true,
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

      // Return user data (without password hash and reset tokens)
      const { 
        passwordHash: _, 
        resetToken: __, 
        resetTokenExpires: ___, 
        ...userResponse 
      } = user;
      
      res.json({ 
        success: true,
        user: userResponse 
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Logout (optional - mainly for clearing client-side token)
  logout: (req, res) => {
    res.json({ 
      success: true,
      message: 'Logout successful' 
    });
  },

  // Change password for authenticated user
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'Current password and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'New password must be at least 6 characters long' 
        });
      }

      // Get current user
      const user = await graphService.findUserById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ 
          error: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      const query = `
        MATCH (u:User {id: $userId})
        SET u.passwordHash = $passwordHash, u.updatedAt = datetime()
        RETURN u
      `;

      await graphService.runQuery(query, { 
        userId: req.userId, 
        passwordHash: newPasswordHash 
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Request password reset (generates reset token)
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;

      // Validation
      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required' 
        });
      }

      // Find user
      const user = await graphService.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Generate reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      // Store reset token in database with expiration
      const query = `
        MATCH (u:User {id: $userId})
        SET u.resetToken = $resetToken, 
            u.resetTokenExpires = datetime() + duration('PT1H'),
            u.updatedAt = datetime()
        RETURN u
      `;

      await graphService.runQuery(query, { 
        userId: user.id, 
        resetToken 
      });

      // TODO: Send email with reset link
      // For now, return the token (in production, you'd email this)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        // Remove this in production - only for development
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Reset password using reset token
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Validation
      if (!token || !newPassword) {
        return res.status(400).json({ 
          error: 'Reset token and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'New password must be at least 6 characters long' 
        });
      }

      // Verify and decode reset token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwtSecret);
        if (decoded.purpose !== 'password-reset') {
          throw new Error('Invalid token purpose');
        }
      } catch (error) {
        return res.status(401).json({ 
          error: 'Invalid or expired reset token' 
        });
      }

      // Find user and check if reset token is valid
      const query = `
        MATCH (u:User {id: $userId})
        WHERE u.resetToken = $token 
        AND u.resetTokenExpires > datetime()
        RETURN u
      `;

      const result = await graphService.runQuery(query, { 
        userId: decoded.userId, 
        token 
      });

      if (result.records.length === 0) {
        return res.status(401).json({ 
          error: 'Invalid or expired reset token' 
        });
      }

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      const updateQuery = `
        MATCH (u:User {id: $userId})
        SET u.passwordHash = $passwordHash,
            u.resetToken = null,
            u.resetTokenExpires = null,
            u.updatedAt = datetime()
        RETURN u
      `;

      await graphService.runQuery(updateQuery, { 
        userId: decoded.userId, 
        passwordHash 
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update user profile (non-password fields)
  updateProfile: async (req, res) => {
    try {
      const { username, theme, publicProfile, emailNotifications } = req.body;
      
      // Build update object with only provided fields
      const updates = {};
      if (username !== undefined) updates.username = username;
      if (theme !== undefined) updates.theme = theme;
      if (publicProfile !== undefined) updates.publicProfile = publicProfile;
      if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          error: 'At least one field must be provided for update' 
        });
      }

      // Check if username is being updated and if it's unique
      if (updates.username) {
        const existingUser = await graphService.runQuery(
          'MATCH (u:User {username: $username}) WHERE u.id <> $userId RETURN u',
          { username: updates.username, userId: req.userId }
        );
        
        if (existingUser.records.length > 0) {
          return res.status(409).json({ 
            error: 'Username already taken' 
          });
        }
      }

      // Update user profile
      const setClause = Object.keys(updates)
        .map(key => `u.${key} = $${key}`)
        .join(', ');

      const query = `
        MATCH (u:User {id: $userId})
        SET ${setClause}, u.updatedAt = datetime()
        RETURN u
      `;

      const result = await graphService.runQuery(query, { 
        userId: req.userId, 
        ...updates 
      });

      if (result.records.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return updated user data (without password hash)
      const user = result.records[0].get('u').properties;
      const { 
        passwordHash: _, 
        resetToken: __, 
        resetTokenExpires: ___, 
        ...userResponse 
      } = user;
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...userResponse,
          createdAt: userResponse.createdAt ? userResponse.createdAt.toString() : null,
          updatedAt: userResponse.updatedAt ? userResponse.updatedAt.toString() : null
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete user account (soft delete - keep dreams but anonymize)
  deleteAccount: async (req, res) => {
    try {
      const { password } = req.body;

      // Validation
      if (!password) {
        return res.status(400).json({ 
          error: 'Current password is required to delete account' 
        });
      }

      // Get current user
      const user = await graphService.findUserById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Incorrect password' 
        });
      }

      // Soft delete: anonymize user data but keep dreams
      const query = `
        MATCH (u:User {id: $userId})
        SET u.username = 'deleted_user_' + u.id,
            u.email = 'deleted_' + u.id + '@deleted.com',
            u.passwordHash = 'DELETED',
            u.deletedAt = datetime(),
            u.updatedAt = datetime()
        RETURN u
      `;

      await graphService.runQuery(query, { userId: req.userId });

      res.json({
        success: true,
        message: 'Account deleted successfully. Your dreams have been preserved anonymously.'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = authController;