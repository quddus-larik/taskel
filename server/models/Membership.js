const pool = require("../config/db");

const Membership = {
  // Add a user to a team
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

  // Remove a user from a team
  async removeUser(userId, teamId) {
    const res = await pool.query(
      `DELETE FROM memberships
       WHERE user_id=$1 AND team_id=$2
       RETURNING *`,
      [userId, teamId]
    );
    return res.rows[0];
  },

  // Get all members of a team
  async getTeamMembers(teamId) {
    const res = await pool.query(
      `SELECT u.id, u.username, u.email, m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.team_id=$1`,
      [teamId]
    );
    return res.rows;
  },

  // Get all teams a user belongs to
  async getUserTeams(userId) {
    const res = await pool.query(
      `SELECT t.id, t.name, t.description, t.owner_id
       FROM memberships m
       JOIN teams t ON m.team_id = t.id
       WHERE m.user_id=$1`,
      [userId]
    );
    return res.rows;
  },
};

module.exports = Membership;
