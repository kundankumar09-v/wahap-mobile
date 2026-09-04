const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Sign up route
router.post("/signup", authController.signup);

// Sign in route
router.post("/signin", authController.signin);

// Get user by ID
router.get("/:id", authController.getUserById);

module.exports = router;
