const pool = require("../config/db");

const Membership = {
  async addUser(userId, teamId, role = "member") {
    const res = await pool.query(
      `INSERT INTO memberships (user_id, team_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, team_id) DO NOTHING
       RETURNING *`,
      [userId, teamId, role]
    );
    return res.rows[0];
  },

  async getTeamMembers(teamId) {
    const res = await pool.query(
      `SELECT u.id, u.name, u.email, m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.team_id=$1`,
      [teamId]
    );
    return res.rows;
  },
};

module.exports = Membership;
