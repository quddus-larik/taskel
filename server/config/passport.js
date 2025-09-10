const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
const pool = require("../config/db")
function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findByEmail(email);
      if (!user) return done(null, false, { message: 'No user with that email' });

      const isValid = await bcrypt.compare(password, user.password);
      return isValid ? done(null, user) : done(null, false, { message: 'Password incorrect' });
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => {
    done(null, user.id)
    console.log("Serializing user:", user) 
  });
  
  
  passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user id:", id);  // must appear in logs
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

}

module.exports = initialize;
