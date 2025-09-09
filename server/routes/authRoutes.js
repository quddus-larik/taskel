const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const { checkNotAuthenticated } = require('../middleware/authMiddleware');
const pool = require("../config/db");
const router = express.Router();

// Register with optional invite
router.post('/register', checkNotAuthenticated, async (req, res) => {
  const { name, email, password, team_id, owner_id } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 chars' });

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    let joinedTeam = false;

    // If invited (team_id + owner_id provided), validate team and insert membership
    if (team_id && owner_id) {
      const teamCheck = await pool.query(
        `SELECT id FROM teams WHERE id = $1 AND owner_id = $2`,
        [team_id, owner_id]
      );

      if (teamCheck.rows.length > 0) {
        await pool.query(
          `INSERT INTO memberships (user_id, team_id, role)
           VALUES ($1, $2, 'member')
           ON CONFLICT (user_id, team_id) DO NOTHING`,
          [newUser.id, team_id]
        );
        joinedTeam = true;
      }
    }

    res.status(201).json({
      message: 'User registered',
      user: newUser,
      joinedTeam,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Login
router.post('/api/login', checkNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ error: 'Internal error' });
    if (!user) return res.status(401).json({ error: info.message || 'Invalid credentials' });

    req.logIn(user, err => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

// Logout
router.delete('/logout', (req, res) => {
  req.logOut(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
