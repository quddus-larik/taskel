const express = require("express");
const router = express.Router();

const { checkNotAuthenticated } = require("../middleware/authMiddleware");

// Status check route
router.get("/auth/status", checkNotAuthenticated, (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated()
      ? { id: req.user.id, name: req.user.name, email: req.user.email }
      : null,
  });
});

module.exports = router;
