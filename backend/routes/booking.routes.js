import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getUserBookings,
  getBookingStatistics
} from '../controllers/booking.controller.js';

const router = express.Router();

// Create a new booking
router.post('/create', createBooking);

// Get all bookings (with optional filters)
router.get('/all', getAllBookings);

// Get booking statistics
router.get('/statistics', getBookingStatistics);

// Get bookings by user ID
router.get('/user/:userId', getUserBookings);

// Get booking by ID
router.get('/:id', getBookingById);

// Update booking status
router.put('/status/:id', updateBookingStatus);

// Delete booking
router.delete('/:id', deleteBooking);

export default router;
