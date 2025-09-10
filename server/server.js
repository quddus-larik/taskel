require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/db');
const initializePassport = require('./config/passport');
const routes = require('./routes');
const { initTables } = require('./utils/dbInit');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

initializePassport(passport);


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());
app.use(
  session({
    store: new pgSession({ pool, tableName: "user_sessions" }),
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production", // true on Render
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// additional routes
app.use('/', routes);

// Start server
app.listen(PORT, async () => {
  await initTables();
  console.log(`Server running on http://localhost:${PORT}`);
});
