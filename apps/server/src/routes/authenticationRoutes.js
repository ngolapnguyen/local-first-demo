const express = require("express");
const router = express.Router();

const authController = require("../controllers/authenticationController");

router.get("/auth/google", authController.signIn);
router.get("/auth/google/callback", authController.signInCallback);
// Route if something goes wrong
router.get("/login-failure", authController.signInFailure);
router.post("/logout", authController.signOut);
router.get("/check-auth-status", authController.checkAuthStatus);

module.exports = router;
