const pool = require('../config/db');

const User = {
  async findByEmail(email) {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },

  async findById(id) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },

  async create({ name, email, password }) {
    const res = await pool.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
      [name, email, password]
    );
    return res.rows[0];
  },
};

module.exports = User;
