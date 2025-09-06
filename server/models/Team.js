const pool = require("../config/db");

const Team = {
  async create({ name, description, owner_id }) {
    const res = await pool.query(
      `INSERT INTO teams (name, description, owner_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, owner_id]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await pool.query("SELECT * FROM teams WHERE id=$1", [id]);
    return res.rows[0];
  },

  async getUserTeams(userId) {
    const res = await pool.query(
      `SELECT t.* FROM teams t
       JOIN memberships m ON t.id = m.team_id
       WHERE m.user_id=$1`,
      [userId]
    );
    return res.rows;
  },
};

module.exports = Team;
