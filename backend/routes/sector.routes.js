import express from "express";
import {
  addSector,
  getSectors,
  getSectorsByGroup,
  getSectorById,
  updateSector,
  deleteSector
} from "../controllers/sector.controller.js";

const router = express.Router();

// Add new sector
router.post("/add", addSector);

// Get all sectors
router.get("/", getSectors);

// Get sectors by group type
router.get("/group/:groupType", getSectorsByGroup);

// Get single sector by ID
router.get("/:id", getSectorById);

// Update sector
router.put("/:id", updateSector);

// Delete sector
router.delete("/:id", deleteSector);

export default router;
