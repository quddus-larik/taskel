const express = require("express");
const pool = require("../config/db");
const { checkAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();


// Create task with assignees
router.post("/", checkAuthenticated, async (req, res) => {
  const { team_id, title, description, status, priority, due_date, assignees } = req.body;

  try {
    const taskResult = await pool.query(
      `INSERT INTO tasks (team_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [team_id, title, description, status, priority, due_date]
    );

    const task = taskResult.rows[0];

    if (assignees && assignees.length > 0) {
      const values = assignees.map(uid => `(${task.id}, ${uid})`).join(",");
      await pool.query(`INSERT INTO task_assignees (task_id, user_id) VALUES ${values}`);
    }

    res.json({ message: "Task created", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});


// Get task details with assignees
router.get("/:id/details", checkAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const taskResult = await pool.query(`SELECT * FROM tasks WHERE id=$1`, [id]);
    if (taskResult.rows.length === 0) return res.status(404).json({ error: "Task not found" });

    const assigneesResult = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM task_assignees ta
       JOIN users u ON ta.user_id = u.id
       WHERE ta.task_id=$1`,
      [id]
    );

    res.json({
      ...taskResult.rows[0],
      assignees: assigneesResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task details" });
  }
});


// Update task assignees
router.put("/:id/assignees", checkAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { assignees } = req.body;

  try {
    await pool.query(`DELETE FROM task_assignees WHERE task_id=$1`, [id]);

    if (assignees && assignees.length > 0) {
      const values = assignees.map(uid => `(${id}, ${uid})`).join(",");
      await pool.query(`INSERT INTO task_assignees (task_id, user_id) VALUES ${values}`);
    }

    res.json({ message: "Assignees updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update assignees" });
  }
});

// Toggle task completed status
router.put("/:id/status", checkAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body; // true or false
  const userId = req.user.id;

  try {
    // 1️⃣ Fetch the task
    const taskResult = await pool.query(`SELECT * FROM tasks WHERE id=$1`, [id]);
    if (taskResult.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    const task = taskResult.rows[0];

    // 2️⃣ Check if user is admin of the team
    const adminResult = await pool.query(
      `SELECT * FROM teams WHERE id=$1 AND owner_id=$2`,
      [task.team_id, userId]
    );
    const isAdmin = adminResult.rows.length > 0;

    // 3️⃣ Check if user is assigned to the task
    const assignedResult = await pool.query(
      `SELECT * FROM task_assignees WHERE task_id=$1 AND user_id=$2`,
      [id, userId]
    );
    const isAssigned = assignedResult.rows.length > 0;

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ error: "Not authorized to update this task" });
    }

    // 4️⃣ Update status
    const updatedResult = await pool.query(
      `UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *`,
      [completed ? "completed" : "pending", id]
    );

    // Return updated task with completed boolean for frontend convenience
    res.json({ ...updatedResult.rows[0], completed: completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task status" });
  }
});




// Delete task
router.delete("/:id", checkAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM task_assignees WHERE task_id=$1`, [id]);
    await pool.query(`DELETE FROM tasks WHERE id=$1`, [id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
