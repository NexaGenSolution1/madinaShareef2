import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  updateUserStatus,
  deleteUser
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

router.patch("/users/:id/status", protect, adminOnly, updateUserStatus);

router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
