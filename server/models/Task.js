const pool = require("../config/db");

const Task = {
  async create({ title, description, team_id, assigned_to, created_by, due_date }) {
    const res = await pool.query(
      `INSERT INTO tasks (title, description, team_id, assigned_to, created_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, team_id, assigned_to, created_by, due_date]
    );
    return res.rows[0];
  },

  async findByTeam(teamId) {
    const res = await pool.query("SELECT * FROM tasks WHERE team_id=$1", [teamId]);
    return res.rows;
  },

  async updateStatus(id, status) {
    const res = await pool.query(
      `UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  },
};

module.exports = Task;
