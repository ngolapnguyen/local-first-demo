exports.isLoggedIn = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    return res
      .status(401)
      .json({ message: "You do not have permission to log in" });
  }
};
