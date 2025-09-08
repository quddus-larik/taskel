const express = require("express");
const Team = require("../models/Team");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const pool = require("../config/db")
const router = express.Router();

// Get single team
router.get("/:id", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Get team members
    const members = await Team.getMembers(id);

    res.json({ ...team, members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all teams for a user
router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const teams = await Team.getUserTeams(req.user.id);
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/details", checkAuthenticated, async (req, res) => {
  try {
    const teamId = req.params.id;
    const team = await Team.getTeamDetails(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    console.error("❌ Error in /:id/details:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



// Create team
router.post("/", checkAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner_id: req.user.id, // owner comes from logged-in user
    });

    // Optionally, add owner as member
    await Team.addMember(team.id, req.user.id, "owner");

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update team
router.put("/update/:id", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedTeam = await Team.update(id, { name, description });

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete/:id", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body; // admin email passed in body

    if (!email) {
      return res.status(400).json({ message: "Admin email is required" });
    }

    // 1️⃣ Get team
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // 2️⃣ Get user by email
    const userResult = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // 3️⃣ Check if user is team owner/admin
    if (team.owner_id !== userId) {
      return res.status(403).json({ message: "Only the team admin can delete this team" });
    }

    // 4️⃣ Delete team
    const deletedTeam = await Team.delete(id);

    res.json({ message: "Team deleted successfully", team: deletedTeam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/:id/members", checkAuthenticated, async (req, res) => {
  try {
    const { email, role } = req.body;
    const teamId = req.params.id;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // 1️⃣ Find user by email
    const userResult = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userId = userResult.rows[0].id;

    // 2️⃣ Add to memberships
    const member = await Team.addMember(teamId, userId, role || "member");

    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add member" });
  }
});



// Remove member from team
router.delete("/:id/members/:userId", checkAuthenticated, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const removedMember = await Team.removeMember(id, userId);

    if (!removedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member removed successfully", member: removedMember });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
