const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

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
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
