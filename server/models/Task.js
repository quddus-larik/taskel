const pool = require("../config/db");

const Task = {
  // Create a new task
  async create({ title, description, team_id, assigned_to = null, due_date = null, priority = "normal", status = "pending" }) {
    const res = await pool.query(
      `INSERT INTO tasks (title, description, team_id, assigned_to, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, team_id, assigned_to, status, priority, due_date]
    );
    return res.rows[0];
  },

  // Get a task by ID
  async findById(id) {
    const res = await pool.query(
      `SELECT * FROM tasks WHERE id=$1`,
      [id]
    );
    return res.rows[0];
  },

  // Get all tasks for a specific team
  async findByTeam(teamId) {
    const res = await pool.query(
      `SELECT * FROM tasks WHERE team_id=$1 ORDER BY due_date ASC`,
      [teamId]
    );
    return res.rows;
  },

  // Get all tasks assigned to a specific user
  async findByUser(userId) {
    const res = await pool.query(
      `SELECT * FROM tasks WHERE assigned_to=$1 ORDER BY due_date ASC`,
      [userId]
    );
    return res.rows;
  },

  // Update task status
  async updateStatus(id, status) {
    const res = await pool.query(
      `UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  },

  // Update task details
  async update(id, { title, description, assigned_to, due_date, priority, status }) {
    const res = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           assigned_to = COALESCE($4, assigned_to),
           due_date = COALESCE($5, due_date),
           priority = COALESCE($6, priority),
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, title, description, assigned_to, due_date, priority, status]
    );
    return res.rows[0];
  },

  // Delete a task
  async delete(id) {
    const res = await pool.query(
      `DELETE FROM tasks WHERE id=$1 RETURNING *`,
      [id]
    );
    return res.rows[0];
  },

  // Assign a task to a user
  async assignUser(id, userId) {
    const res = await pool.query(
      `UPDATE tasks SET assigned_to=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [userId, id]
    );
    return res.rows[0];
  },

  // Unassign a task
  async unassignUser(id) {
    const res = await pool.query(
      `UPDATE tasks SET assigned_to=NULL, updated_at=NOW() WHERE id=$1 RETURNING *`,
      [id]
    );
    return res.rows[0];
  },
};

module.exports = Task;
