import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
   getUserById,
  updateUserStatus,
   updateUserProfile,
  deleteUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  changeUserPassword,
  sendUserCredentials
} from "../controllers/auth.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ===========================
   AUTH ROUTES
=========================== */

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getProfile);

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);

router.put("/users/:id", protect, adminOnly, updateUserProfile);

router.patch("/users/:id/status", protect, adminOnly, updateUserStatus);

router.delete("/users/:id", protect, adminOnly, deleteUser);

/* ===========================
   PASSWORD MANAGEMENT ROUTES
=========================== */

// Change password for logged-in user
router.post("/change-password", protect, changePassword);

// Request password reset (forgot password)
router.post("/forgot-password", requestPasswordReset);

// Reset password with token
router.post("/reset-password", resetPassword);

// Admin: Change user/agency password
router.post("/admin/change-user-password", protect, adminOnly, changeUserPassword);

// Admin: Send credentials to user
router.post("/users/:userId/send-credentials", protect, adminOnly, sendUserCredentials);

export default router;
