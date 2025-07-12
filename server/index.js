const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { db, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, full_name, bio, location } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      `INSERT INTO users (username, email, password_hash, full_name, bio, location) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, full_name, bio || '', location || ''],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Username or email already exists' });
          }
          return res.status(500).json({ message: 'Registration failed' });
        }
        
        const token = jwt.sign(
          { userId: this.lastID, username, email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, email, full_name, bio, location }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      try {
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { userId: user.id, username: user.username, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            bio: user.bio,
            location: user.location
          }
        });
      } catch (error) {
        res.status(500).json({ message: 'Login failed' });
      }
    }
  );
});

// Skills Routes
app.get('/api/skills', (req, res) => {
  const { category, search } = req.query;
  let query = `
    SELECT s.*, u.username, u.full_name, u.location 
    FROM skills s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.available = 1
  `;
  const params = [];

  if (category) {
    query += ' AND s.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (s.skill_name LIKE ? OR s.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY s.created_at DESC';

  db.all(query, params, (err, skills) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch skills' });
    }
    res.json(skills);
  });
});

app.get('/api/skills/my', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, skills) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch your skills' });
      }
      res.json(skills);
    }
  );
});

app.post('/api/skills', authenticateToken, (req, res) => {
  const { skill_name, description, proficiency_level, category } = req.body;

  db.run(
    `INSERT INTO skills (user_id, skill_name, description, proficiency_level, category) 
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.userId, skill_name, description, proficiency_level, category],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to add skill' });
      }
      res.status(201).json({
        message: 'Skill added successfully',
        skill: {
          id: this.lastID,
          skill_name,
          description,
          proficiency_level,
          category
        }
      });
    }
  );
});

app.put('/api/skills/:id', authenticateToken, (req, res) => {
  const { skill_name, description, proficiency_level, category, available } = req.body;
  const skillId = req.params.id;

  db.run(
    `UPDATE skills 
     SET skill_name = ?, description = ?, proficiency_level = ?, category = ?, available = ?
     WHERE id = ? AND user_id = ?`,
    [skill_name, description, proficiency_level, category, available, skillId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update skill' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Skill not found or not authorized' });
      }
      res.json({ message: 'Skill updated successfully' });
    }
  );
});

app.delete('/api/skills/:id', authenticateToken, (req, res) => {
  const skillId = req.params.id;

  db.run(
    'DELETE FROM skills WHERE id = ? AND user_id = ?',
    [skillId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to delete skill' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Skill not found or not authorized' });
      }
      res.json({ message: 'Skill deleted successfully' });
    }
  );
});

// Skill Request Routes
app.post('/api/requests', authenticateToken, (req, res) => {
  const { skill_id, offered_skill, message } = req.body;

  // First, get the skill and its owner
  db.get(
    'SELECT s.*, u.username FROM skills s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
    [skill_id],
    (err, skill) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to process request' });
      }
      if (!skill) {
        return res.status(404).json({ message: 'Skill not found' });
      }
      if (skill.user_id === req.user.userId) {
        return res.status(400).json({ message: 'Cannot request your own skill' });
      }

      db.run(
        `INSERT INTO skill_requests (requester_id, skill_owner_id, skill_id, requested_skill, offered_skill, message) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.userId, skill.user_id, skill_id, skill.skill_name, offered_skill, message],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Failed to create request' });
          }
          res.status(201).json({
            message: 'Skill request sent successfully',
            request: {
              id: this.lastID,
              requested_skill: skill.skill_name,
              offered_skill,
              message
            }
          });
        }
      );
    }
  );
});

app.get('/api/requests/received', authenticateToken, (req, res) => {
  db.all(
    `SELECT sr.*, u.username as requester_username, u.full_name as requester_name
     FROM skill_requests sr 
     JOIN users u ON sr.requester_id = u.id 
     WHERE sr.skill_owner_id = ? 
     ORDER BY sr.created_at DESC`,
    [req.user.userId],
    (err, requests) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch received requests' });
      }
      res.json(requests);
    }
  );
});

app.get('/api/requests/sent', authenticateToken, (req, res) => {
  db.all(
    `SELECT sr.*, u.username as owner_username, u.full_name as owner_name
     FROM skill_requests sr 
     JOIN users u ON sr.skill_owner_id = u.id 
     WHERE sr.requester_id = ? 
     ORDER BY sr.created_at DESC`,
    [req.user.userId],
    (err, requests) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch sent requests' });
      }
      res.json(requests);
    }
  );
});

app.put('/api/requests/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const requestId = req.params.id;

  db.run(
    'UPDATE skill_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND skill_owner_id = ?',
    [status, requestId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update request status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Request not found or not authorized' });
      }
      res.json({ message: 'Request status updated successfully' });
    }
  );
});

// User Profile Routes
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, full_name, bio, location, created_at FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch profile' });
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    }
  );
});

app.put('/api/profile', authenticateToken, (req, res) => {
  const { full_name, bio, location } = req.body;

  db.run(
    'UPDATE users SET full_name = ?, bio = ?, location = ? WHERE id = ?',
    [full_name, bio, location, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Categories Route
app.get('/api/categories', (req, res) => {
  db.all(
    'SELECT DISTINCT category FROM skills WHERE category IS NOT NULL AND category != ""',
    (err, categories) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch categories' });
      }
      res.json(categories.map(cat => cat.category));
    }
  );
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });