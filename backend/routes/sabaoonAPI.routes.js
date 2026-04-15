import express from "express";
import { getSabaoonGroups } from "../controllers/sabaoon.controller.js";

const router = express.Router();

router.get("/groups", getSabaoonGroups);

export default router;
