const express = require("express");
const Team = require("../models/Team");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const pool = require("../config/db");
const router = express.Router();

// ✅ Get all tasks for a team (with assignees)
router.get("/:id/tasks", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure team exists
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Fetch tasks and join with assignees
    const tasksResult = await pool.query(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email
                  )
                ) FILTER (WHERE u.id IS NOT NULL), '[]'
              ) AS assignees
       FROM tasks t
       LEFT JOIN task_assignees ta ON t.id = ta.task_id
       LEFT JOIN users u ON ta.user_id = u.id
       WHERE t.team_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [id]
    );

    res.json(tasksResult.rows);
  } catch (err) {
    console.error("❌ Error in /:id/tasks:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// --- existing routes below ---

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

// Delete team
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

// Add member
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

router.put("/:teamId/tasks/:taskId/complete", checkAuthenticated, async (req, res) => {
  try {
    const { teamId, taskId } = req.params;
    const { completed } = req.body; // true or false
    const userEmail = req.user.email;

    // 1️⃣ Get logged-in user
    const userRes = await pool.query("SELECT id FROM users WHERE email=$1", [userEmail]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userRes.rows[0].id;

    // 2️⃣ Check if user is team admin/owner
    const teamRes = await pool.query(
      `SELECT t.owner_id, m.role
       FROM teams t
       LEFT JOIN memberships m ON m.team_id = t.id AND m.user_id = $1
       WHERE t.id = $2`,
      [userId, teamId]
    );

    if (teamRes.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const { owner_id, role } = teamRes.rows[0];
    const isAdmin = owner_id === userId || role === "admin";

    // 3️⃣ Check if user is assigned to the task
    const assigneeRes = await pool.query(
      "SELECT 1 FROM task_assignees WHERE task_id=$1 AND user_id=$2",
      [taskId, userId]
    );
    const isAssignee = assigneeRes.rows.length > 0;

    // 4️⃣ Permission check
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // 5️⃣ Update task completion
    const updatedTask = await pool.query(
      "UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [completed ? "done" : "pending", taskId]
    );

    res.json({ message: "Task status updated", task: updatedTask.rows[0] });
  } catch (err) {
    console.error("❌ Error updating task completion:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats/:id", checkAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const stats = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT m.user_id) AS total_members,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) AS pending_tasks
      FROM teams tm
      LEFT JOIN memberships m ON m.team_id = tm.id
      LEFT JOIN tasks t ON t.team_id = tm.id
      WHERE tm.owner_id = $1
    `,
      [userId]
    );

    const row = stats.rows[0];

    res.json({
      totalMembers: parseInt(row.total_members, 10) || 0,
      completedTasks: parseInt(row.completed_tasks, 10) || 0,
      pendingTasks: parseInt(row.pending_tasks, 10) || 0,
    });
  } catch (err) {
    console.error("Error fetching team stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
