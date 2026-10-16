import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// ==============================
// REGISTER
// POST /api/auth/register
// ==============================

router.post("/register", registerUser);


// ==============================
// LOGIN
// POST /api/auth/login
// ==============================

router.post("/login", loginUser);


// ==============================
// CURRENT USER
// GET /api/auth/me
// PUT /api/auth/me           (name, phone)
// PUT /api/auth/me/password  (currentPassword, newPassword)
// ==============================

router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateProfile);
router.put("/me/password", protect, changePassword);


export default router;
