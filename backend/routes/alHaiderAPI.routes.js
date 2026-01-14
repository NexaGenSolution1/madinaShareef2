import express from "express";
import {
    getAvailableBookingsByGroup,
    getAirlines
} from "../controllers/al-haider.controller.js";
import { alHaiderAuthMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();

// Get available bookings by group type
router.get("/available-bookings-by-group", (req, res) => {
    alHaiderAuthMiddleware(req, res, (error) => {
        if (error) {
            return res.status(401).json({
                success: false,
                message: "Failed to authenticate with Al-Haider API"
            });
        }
        getAvailableBookingsByGroup(req, res);
    });
});

router.get("/get-airlines", (req, res) => {
    alHaiderAuthMiddleware(req, res, (error) => {
        if (error) {
            return res.status(401).json({
                success: false,
                message: "Failed to authenticate with Al-Haider API"
            });
        }
        getAirlines(req, res);
    });
});

export default router;