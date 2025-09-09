const pool = require('../config/db');

const Task = {
  async create({ title, description, team_id, due_date, priority, assigned_to = [] }) {
    // Insert into tasks table (no assigned_to here!)
    const res = await pool.query(
      `INSERT INTO tasks (title, description, team_id, due_date, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, team_id, due_date, priority]
    );
    const task = res.rows[0];

    // Insert assigned users into task_assignees
    if (assigned_to && assigned_to.length > 0) {
      const values = assigned_to.map(userId => `(${task.id}, ${userId})`).join(',');
      await pool.query(`INSERT INTO task_assignees (task_id, user_id) VALUES ${values}`);
    }

    return task;
  },

  async findByTeam(teamId) {
    const res = await pool.query(
      `SELECT t.*, 
              json_agg(ta.user_id) AS assignees
       FROM tasks t
       LEFT JOIN task_assignees ta ON t.id = ta.task_id
       WHERE t.team_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [teamId]
    );
    return res.rows;
  },

  async findByUser(userId) {
    const res = await pool.query(
      `SELECT t.*
       FROM tasks t
       JOIN task_assignees ta ON t.id = ta.task_id
       WHERE ta.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query(
      `SELECT t.*, json_agg(ta.user_id) AS assignees
       FROM tasks t
       LEFT JOIN task_assignees ta ON t.id = ta.task_id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    );
    return res.rows[0];
  },

  async update(id, { title, description, due_date, priority, status, assigned_to }) {
    const res = await pool.query(
      `UPDATE tasks
       SET title=$1, description=$2, due_date=$3, priority=$4, status=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [title, description, due_date, priority, status, id]
    );
    const task = res.rows[0];

    if (!task) return null;

    // Update assignees if provided
    if (assigned_to) {
      await pool.query(`DELETE FROM task_assignees WHERE task_id=$1`, [id]);
      if (assigned_to.length > 0) {
        const values = assigned_to.map(userId => `(${id}, ${userId})`).join(',');
        await pool.query(`INSERT INTO task_assignees (task_id, user_id) VALUES ${values}`);
      }
    }

    return task;
  },

  async updateStatus(id, status) {
    const res = await pool.query(
      `UPDATE tasks SET status=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  },

  async assignUser(taskId, userId) {
    await pool.query(
      `INSERT INTO task_assignees (task_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [taskId, userId]
    );
    return this.findById(taskId);
  },

  async unassignUser(taskId, userId) {
    await pool.query(
      `DELETE FROM task_assignees WHERE task_id=$1 AND user_id=$2`,
      [taskId, userId]
    );
    return this.findById(taskId);
  },

  async delete(id) {
    const res = await pool.query(`DELETE FROM tasks WHERE id=$1 RETURNING *`, [id]);
    return res.rows[0];
  }
};

module.exports = Task;
