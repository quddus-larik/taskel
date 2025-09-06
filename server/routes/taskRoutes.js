const express = require("express");
const Task = require("../models/Task");
const { checkAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// Create task
router.post("/", checkAuthenticated, async (req, res) => {
  const { title, description, team_id, assigned_to, due_date } = req.body;
  const task = await Task.create({
    title,
    description,
    team_id,
    assigned_to,
    created_by: req.user.id,
    due_date,
  });
  res.json(task);
});

// Get tasks for a team
router.get("/team/:teamId", checkAuthenticated, async (req, res) => {
  const tasks = await Task.findByTeam(req.params.teamId);
  res.json(tasks);
});

// Update task status
router.patch("/:id/status", checkAuthenticated, async (req, res) => {
  const { status } = req.body;
  const updated = await Task.updateStatus(req.params.id, status);
  res.json(updated);
});

module.exports = router;
