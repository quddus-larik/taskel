const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const teamRoutes = require("./teamRoutes");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.use(authRoutes);
router.use("/api",userRoutes);
router.use("/teams", teamRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;
