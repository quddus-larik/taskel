const express = require("express");
const Team = require("../models/Team");
const Membership = require("../models/Membership");
const { checkAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// Create team
router.post("/", checkAuthenticated, async (req, res) => {
  const { name, description } = req.body;
  const team = await Team.create({ name, description, owner_id: req.user.id });
  await Membership.addUser(req.user.id, team.id, "admin");
  res.json(team);
});

// Get user teams
router.get("/", checkAuthenticated, async (req, res) => {
  const teams = await Team.getUserTeams(req.user.id);
  res.json(teams);
});

// Get team members
router.get("/:id/members", checkAuthenticated, async (req, res) => {
  const members = await Membership.getTeamMembers(req.params.id);
  res.json(members);
});

module.exports = router;
