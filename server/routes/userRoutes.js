const express = require("express");
const router = express.Router();
const pool = require("../config/db")
const { checkNotAuthenticated, checkAuthenticated } = require("../middleware/authMiddleware");

// Status check route
router.get("/auth/status", checkNotAuthenticated, (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated()
      ? { id: req.user.id, name: req.user.name, email: req.user.email }
      : null,
  });
});

router.get("/users/email/:email", checkAuthenticated, async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );
    console.log(result,"working")
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
