const express = require("express");
const router = express.Router();
const pool = require("../config/db")
const { checkNotAuthenticated, checkAuthenticated } = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
require('dotenv').config()


// Status check route
router.get("/auth/status", checkNotAuthenticated, (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated()
      ? { id: req.user.id, name: req.user.name, email: req.user.email }
      : null,
  });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.get("/users/email/:email", checkAuthenticated, async (req, res) => {
  try {
    const { email } = req.params;
    const { team_id, owner_id } = req.query; // optional params

    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );

    // If not found, send invite email
    if (result.rows.length === 0) {
      try {
        const inviteUrl = `http://localhost:5173/signup?email=${encodeURIComponent(
          email
        )}${team_id ? `&team_id=${team_id}` : ""}${
          owner_id ? `&owner_id=${owner_id}` : ""
        }`;

        await transporter.sendMail({
          from: `"Taskel App" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "You're invited to join Taskel Team 🎉",
          text: `Hello! You have been invited to join Taskel Team. Sign up here: ${inviteUrl}`,
          html: `<p>Hello!</p><p>You have been invited to join Taskel.</p><p><a href="${inviteUrl}">Click here to sign up</a></p>`,
        });

        return res.status(404).json({
          success: false,
          error: "User not found, invitation sent on mail",
          inviteUrl,
        });
      } catch (mailErr) {
        console.error("❌ Email error:", mailErr);
        return res
          .status(500)
          .json({ success: false, error: "User not found & email failed" });
      }
    }

    // User exists
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


module.exports = router;
