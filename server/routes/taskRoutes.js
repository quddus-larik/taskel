const express = require("express");
const Task = require("../models/Task");
const { checkAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// Create task
router.post("/", checkAuthenticated, async (req, res) => {
  try {
    const { title, description, team_id, assigned_to, due_date, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      team_id,
      assigned_to,
      due_date,
      priority,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tasks for a team
router.get("/team/:teamId", checkAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.findByTeam(req.params.teamId);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tasks assigned to a user
router.get("/user/:userId", checkAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.findByUser(req.params.userId);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get task by ID
router.get("/:id", checkAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update task details
router.put("/:id", checkAuthenticated, async (req, res) => {
  try {
    const { title, description, assigned_to, due_date, priority, status } = req.body;

    const updatedTask = await Task.update(req.params.id, {
      title,
      description,
      assigned_to,
      due_date,
      priority,
      status,
    });

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update task status
router.patch("/:id/status", checkAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;

    const updatedTask = await Task.updateStatus(req.params.id, status);
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Assign task to a user
router.post("/:id/assign", checkAuthenticated, async (req, res) => {
  try {
    const { userId } = req.body;
    const updatedTask = await Task.assignUser(req.params.id, userId);
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unassign task
router.post("/:id/unassign", checkAuthenticated, async (req, res) => {
  try {
    const updatedTask = await Task.unassignUser(req.params.id);
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete task
router.delete("/:id", checkAuthenticated, async (req, res) => {
  try {
    const deletedTask = await Task.delete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted successfully", task: deletedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
