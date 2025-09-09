const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const teamRoutes = require("./teamRoutes");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.use(authRoutes);
router.use("/api",userRoutes);
router.use("/api/teams", teamRoutes);
router.use("/api/tasks", taskRoutes);
router.use("/api/smpt/invite", taskRoutes);

module.exports = router;
