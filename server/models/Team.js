const pool = require("../config/db");

const Team = {
  // Create a new team
  async create({ name, description, owner_id }) {
    const res = await pool.query(
      `INSERT INTO teams (name, description, owner_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, owner_id]
    );
    return res.rows[0];
  },

  // Find a team by ID
  async findById(id) {
    const res = await pool.query(`SELECT * FROM teams WHERE id=$1`, [id]);
    return res.rows[0];
  },

  // Get all teams
  async findAll() {
    const res = await pool.query(`SELECT * FROM teams`);
    return res.rows;
  },

  // Get all teams a user is part of
  async getUserTeams(userId) {
    const res = await pool.query(
      `SELECT t.* 
       FROM teams t
       JOIN memberships m ON t.id = m.team_id
       WHERE m.user_id=$1`,
      [userId]
    );
    return res.rows;
  },

  // Update team details
  async update(id, { name, description }) {
    const res = await pool.query(
      `UPDATE teams
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, description]
    );
    return res.rows[0];
  },

  // Delete a team
  async delete(id) {
    const res = await pool.query(
      `DELETE FROM teams WHERE id=$1 RETURNING *`,
      [id]
    );
    return res.rows[0];
  },

  // Add a member to the team (insert into memberships table)
  async addMember(teamId, userId, role = "member") {
    // Check if user exists
    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      throw new Error("User does not exist");
    }

    // Check if user already in team
    const existing = await pool.query(
      "SELECT * FROM memberships WHERE user_id=$1 AND team_id=$2",
      [userId, teamId]
    );
    if (existing.rows.length > 0) {
      return { message: "User is already a member" };
    }

    // Insert membership
    const res = await pool.query(
      `INSERT INTO memberships (user_id, team_id, role)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (
         SELECT 1 FROM memberships WHERE user_id=$1 AND team_id=$2
       )
       RETURNING *`,
      [userId, teamId, role]
    );
    return res.rows[0];
  },

  // Remove a member
  async removeMember(teamId, userId) {
    const res = await pool.query(
      `DELETE FROM memberships 
       WHERE team_id=$1 AND user_id=$2
       RETURNING *`,
      [teamId, userId]
    );
    return res.rows[0];
  },

  // Get members of a team
  async getMembers(teamId) {
    const res = await pool.query(
      `SELECT u.id, u.name, u.email, m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.team_id=$1`,
      [teamId]
    );
    return res.rows;
  },

  // Get team details with tasks + assignees
  async getTeamDetails(teamId) {
    // Team info
    const teamRes = await pool.query(
      "SELECT id, name, description, owner_id FROM teams WHERE id=$1",
      [teamId]
    );
    if (teamRes.rows.length === 0) return null;
    const team = teamRes.rows[0];

    // Members
    const membersRes = await pool.query(
      `SELECT u.id, u.name, u.email, m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.team_id=$1`,
      [teamId]
    );
    const members = membersRes.rows;

    // Tasks with assignees
    const tasksRes = await pool.query(
      `SELECT t.id, t.title, t.description, t.priority, t.status, t.due_date,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email
                  )
                ) FILTER (WHERE u.id IS NOT NULL), '[]'
              ) AS assigned_users
       FROM tasks t
       LEFT JOIN task_assignees ta ON t.id = ta.task_id
       LEFT JOIN users u ON ta.user_id = u.id
       WHERE t.team_id = $1
       GROUP BY t.id`,
      [teamId]
    );
    const tasks = tasksRes.rows;

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      members,
      tasks,
    };
  },
};

module.exports = Team;
