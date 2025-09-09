const pool = require('../config/db');

async function initTables() {
  
  // Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS taskel_tastesouth.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions
  await pool.query(`
    CREATE TABLE IF NOT EXISTS taskel_tastesouth.user_sessions (
      sid VARCHAR NOT NULL,
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      PRIMARY KEY (sid)
    );
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON taskel_tastesouth.user_sessions(expire);
  `);

  // Teams
  await pool.query(`
    CREATE TABLE IF NOT EXISTS taskel_tastesouth.teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      owner_id INT NOT NULL REFERENCES taskel_tastesouth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Memberships
  await pool.query(`
    CREATE TABLE IF NOT EXISTS taskel_tastesouth.memberships (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES taskel_tastesouth.users(id) ON DELETE CASCADE,
      team_id INT NOT NULL REFERENCES taskel_tastesouth.teams(id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, team_id)
    );
  `);

  // Tasks
  await pool.query(`
    CREATE TABLE IF NOT EXISTS taskel_tastesouth.tasks (
      id SERIAL PRIMARY KEY,
      team_id INT NOT NULL REFERENCES taskel_tastesouth.teams(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
      priority VARCHAR(50) DEFAULT 'normal',
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Task Assignees
  await pool.query(`
    CREATE TABLE IF NOT EXISTS taskel_tastesouth.task_assignees (
      task_id INT NOT NULL REFERENCES taskel_tastesouth.tasks(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES taskel_tastesouth.users(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, user_id)
    );
  `);

  console.log('✅ Database initialized');
}

module.exports = { initTables };
