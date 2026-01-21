import Booking from '../models/Booking.js';
import GroupTicketing from '../models/GroupTicketing.js';
// import { startBookingTimer, cancelBookingTimer } from '../utils/bookingTimer.js';
import {
    startBookingTimer,
    cancelBookingTimer,
    hasBookingTimer,
    getBookingRemainingTime
} from '../utils/bookingTimer.js';


// Create a new booking
const createBooking = async (req, res) => {
    try {
        const {
            groupId,
            groupType,
            airline,
            sector,
            pnr,
            contactPersonName,
            adultsCount,
            childrenCount,
            infantsCount,
            totalPassengers,
            pricing,
            passengers,
            flights,
            departureDate,
            arrivalDate
        } = req.body;

        // Validate passenger count matches passenger details
        if (passengers.length !== totalPassengers) {
            return res.status(400).json({
                success: false,
                message: 'Passenger count does not match passenger details'
            });
        }

        // Validate pricing totals
        const calculatedTotal = pricing.adultTotal + pricing.childTotal + pricing.infantTotal;
        if (Math.abs(calculatedTotal - pricing.grandTotal) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Price calculation mismatch'
            });
        }

        // Create new booking
        const booking = new Booking({
            groupId,
            groupType,
            airline,
            sector,
            pnr,
            contactPersonName,
            adultsCount,
            childrenCount,
            infantsCount,
            totalPassengers,
            pricing,
            passengers,
            flights,
            departureDate,
            arrivalDate,
            userId: req.user._id,
            status: 'on hold'
        });

        await booking.save();

        // Start 2-hours timer for automatic cancellation
        startBookingTimer(booking._id.toString());

        // Update GroupTicketing totalSeats - subtract only adults + children (ignore infants)
        const seatsToReduce = adultsCount + childrenCount;
        await GroupTicketing.updateOne(
            { _id: groupId },
            { $inc: { totalSeats: -seatsToReduce } }
        );

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get all bookings (with filters and pagination)
const getAllBookings = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            sector,
            airline,
            fromDate,
            // toDate,
            search
        } = req.query;

        const query = {};

        // Apply filters
        if (status) {
            query.status = status;
        }

        if (sector) {
            query.sector = sector;
        }

        if (airline) {
            query['airline.name'] = airline;
        }

        // if (fromDate || toDate) {
        if (fromDate) {
            query.departureDate = {};
            if (fromDate) {
                query.departureDate.$gte = new Date(fromDate);
            }
            // if (toDate) {
            //     query.departureDate.$lte = new Date(toDate);
            // }
        }

        if (search) {
            query.$or = [
                { bookingReference: { $regex: search, $options: 'i' } },
                { contactPersonName: { $regex: search, $options: 'i' } },
                { pnr: { $regex: search, $options: 'i' } }
            ];
        }

        // If not admin, filter by user
        if (req.user.role !== 'Admin') {
            query.userId = req.user._id;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email agencyCode companyName');

        const total = await Booking.countDocuments(query);

        bookings.forEach((booking) => {
            if (
                (booking.status === 'on hold' || booking.status === 'pending') &&
                !hasBookingTimer(booking._id.toString())
            ) {
                startBookingTimer(booking._id.toString());
            }
        });

        const data = bookings.map(b => ({
            ...b.toObject(),
            remainingTime:
                b.status === 'on hold' || b.status === 'pending'
                    ? getBookingRemainingTime(b.createdAt)
                    : null
        }));

        res.json({
            success: true,
            data: data,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBookings: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// Get booking by ID
const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id).populate('userId', 'name email agencyCode companyName');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user has permission to view this booking
        const bookingUserId = booking.userId._id ? booking.userId._id.toString() : booking.userId.toString();
        console.log('Authorization check:', {
            userRole: req.user.role,
            bookingUserId,
            requestUserId: req.user._id.toString(),
            isMatch: bookingUserId === req.user._id.toString()
        });

        if (req.user.role !== 'Admin' && bookingUserId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        if (
            (booking.status === 'on hold' || booking.status === 'pending') &&
            !hasBookingTimer(booking._id.toString())
        ) {
            startBookingTimer(booking._id.toString());
        }


        // res.json({
        //     success: true,
        //     data: booking
        // });

        res.json({
            success: true,
            data: booking,
            remainingTime:
                booking.status === 'on hold' || booking.status === 'pending'
                    ? getBookingRemainingTime(booking.createdAt)
                    : null
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
};

// Get booking by reference
const getBookingByReference = async (req, res, next) => {
    try {
        const { reference } = req.params;

        const booking = await Booking.findOne({ bookingReference: reference })
            .populate('userId', 'name email agencyCode companyName');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user has permission to view this booking
        const bookingUserId = booking.userId._id ? booking.userId._id.toString() : booking.userId.toString();
        if (req.user.role !== 'Admin' && bookingUserId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        // res.json({
        //     success: true,
        //     data: booking
        // });

        if (
            (booking.status === 'on hold' || booking.status === 'pending') &&
            !hasBookingTimer(booking._id.toString())
        ) {
            startBookingTimer(booking._id.toString());
        }


        res.json({
            success: true,
            data: booking,
            remainingTime:
                booking.status === 'on hold' || booking.status === 'pending'
                    ? getBookingRemainingTime(booking.createdAt)
                    : null
        });

    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
};

// Update booking status
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Only admin can update booking status
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update booking status'
            });
        }

        // Cancel timer if booking is being confirmed or cancelled
        if (status !== 'on hold' && status !== 'pending') {
            cancelBookingTimer(id);
        }

        booking.status = status;
        if (notes) {
            booking.notes = notes;
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking',
            error: error.message
        });
    }
};

// Update booking details (limited fields)
const updateBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { contactPersonName, notes, adultsCount, childrenCount, infantsCount, passengers, pricing } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'Admin' && booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }

        // Only allow updates if booking is on hold
        if (booking.status !== 'on hold' && booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only update bookings that are on hold'
            });
        }

        if (contactPersonName) {
            booking.contactPersonName = contactPersonName;
        }
        if (notes !== undefined) {
            booking.notes = notes;
        }
        if (adultsCount !== undefined) {
            booking.adultsCount = adultsCount;
        }
        if (childrenCount !== undefined) {
            booking.childrenCount = childrenCount;
        }
        if (infantsCount !== undefined) {
            booking.infantsCount = infantsCount;
        }
        if (passengers !== undefined) {
            booking.passengers = passengers;
            booking.totalPassengers = adultsCount + childrenCount + infantsCount;
        }
        if (pricing !== undefined) {
            booking.pricing = pricing;
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking',
            error: error.message
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'Admin' && booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Cannot cancel already cancelled bookings
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel ${booking.status} booking`
            });
        }

        // Cancel the timer
        cancelBookingTimer(id);

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
};

// Delete booking (admin only)
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Only admin can delete bookings
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete bookings'
            });
        }

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: error.message
        });
    }
};

// Get booking statistics (admin only)
const getBookingStatistics = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const totalBookings = await Booking.countDocuments();
        const onHoldBookings = await Booking.countDocuments({ status: 'on hold' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

        // Get total revenue from confirmed bookings
        const revenueData = await Booking.aggregate([
            {
                $match: {
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$pricing.grandTotal' }
                }
            }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Get bookings by sector
        const bookingsBySector = await Booking.aggregate([
            {
                $group: {
                    _id: '$sector',
                    count: { $sum: 1 },
                    revenue: { $sum: '$pricing.grandTotal' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalBookings,
                onHoldBookings,
                confirmedBookings,
                cancelledBookings,
                totalRevenue,
                bookingsBySector
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

export {
    createBooking,
    getAllBookings,
    getBookingById,
    getBookingByReference,
    updateBookingStatus,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getBookingStatistics
};
