import express from "express";
import {
  createGroupTicketing,
  getAllGroupTicketings,
  getGroupTicketingById,
  updateGroupTicketing,
  deleteGroupTicketing
} from "../controllers/groupTicketing.controller.js";

const router = express.Router();

/* ===========================
   GROUP TICKETING ROUTES
=========================== */

router.post("/", createGroupTicketing);

router.get("/", getAllGroupTicketings);

router.get("/:id", getGroupTicketingById);

router.put("/:id", updateGroupTicketing);

router.delete("/:id", deleteGroupTicketing);

export default router;
