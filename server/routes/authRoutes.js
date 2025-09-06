const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const { checkNotAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', checkNotAuthenticated, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 chars' });

  const existingUser = await User.findByEmail(email);
  if (existingUser) return res.status(400).json({ error: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({ message: 'User registered', user: newUser });
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
