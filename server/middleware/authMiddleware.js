function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  // Instead of hard error, give structured JSON
  return res.status(401).json({
    authenticated: false,
    message: "Not authenticated",
  });
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Send the user data so frontend can redirect
    return res.status(200).json({
      authenticated: true,
      message: "Already authenticated",
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  }
  next();
}

module.exports = { checkAuthenticated, checkNotAuthenticated };
