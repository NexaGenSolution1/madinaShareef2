import Booking from "../models/Booking.js";
import GroupTicketing from "../models/GroupTicketing.js";

/* ===========================
   CREATE BOOKING
=========================== */
export const createBooking = async (req, res) => {
  try {
    const {
      groupTicketingId,
      userId,
      contactPersonName,
      adults,
      children,
      infants,
      passengers,
      pricing
    } = req.body;

    // Validate required fields
    if (!groupTicketingId || !userId || !contactPersonName || !passengers || !pricing) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Fetch group ticketing details
    const groupTicketing = await GroupTicketing.findById(groupTicketingId);
    if (!groupTicketing) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    // Calculate total seats
    const totalSeats = (adults || 0) + (children || 0) + (infants || 0);

    // Check if enough seats are available
    if (groupTicketing.available_no_of_pax < totalSeats) {
      return res.status(400).json({
        success: false,
        message: `Not enough seats available. Only ${groupTicketing.available_no_of_pax} seats remaining.`
      });
    }

    // Validate passengers count matches total seats
    if (passengers.length !== totalSeats) {
      return res.status(400).json({
        success: false,
        message: "Number of passengers must match total seats"
      });
    }

    // Create booking
    const booking = new Booking({
      groupTicketing: groupTicketingId,
      createdBy: userId,
      contactPersonName,
      seatDetails: {
        adults: adults || 0,
        children: children || 0,
        infants: infants || 0,
        totalSeats
      },
      passengers,
      pricing,
      flightInfo: {
        airline: groupTicketing.airline_name,
        sector: groupTicketing.sector,
        departureDate: groupTicketing.dept_date
      }
    });

    await booking.save();

    // Update available seats in group ticketing
    groupTicketing.available_no_of_pax -= totalSeats;
    await groupTicketing.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message
    });
  }
};

/* ===========================
   GET ALL BOOKINGS
=========================== */
export const getAllBookings = async (req, res) => {
  try {
    const { status, userId } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by user if provided
    if (userId) {
      query.createdBy = userId;
    }

    const bookings = await Booking.find(query)
      .populate('groupTicketing', 'airline_name sector dept_date')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
};

/* ===========================
   GET BOOKING BY ID
=========================== */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('groupTicketing')
      .populate('createdBy', 'name email')
      .populate('confirmedBy', 'name email')
      .populate('cancelledBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message
    });
  }
};

/* ===========================
   UPDATE BOOKING STATUS
=========================== */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId, reason } = req.body;

    // Validate status
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, confirmed, or cancelled"
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Update based on status
    if (status === 'confirmed') {
      await booking.confirmBooking(userId);
    } else if (status === 'cancelled') {
      // Restore seats to group ticketing
      const groupTicketing = await GroupTicketing.findById(booking.groupTicketing);
      if (groupTicketing) {
        groupTicketing.available_no_of_pax += booking.seatDetails.totalSeats;
        await groupTicketing.save();
      }
      await booking.cancelBooking(userId, reason);
    } else {
      booking.status = status;
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message
    });
  }
};

/* ===========================
   DELETE BOOKING
=========================== */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Restore seats if booking is not cancelled
    if (booking.status !== 'cancelled') {
      const groupTicketing = await GroupTicketing.findById(booking.groupTicketing);
      if (groupTicketing) {
        groupTicketing.available_no_of_pax += booking.seatDetails.totalSeats;
        await groupTicketing.save();
      }
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message
    });
  }
};

/* ===========================
   GET USER BOOKINGS
=========================== */
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ createdBy: userId })
      .populate('groupTicketing', 'airline_name sector dept_date')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message
    });
  }
};

/* ===========================
   GET BOOKING STATISTICS
=========================== */
export const getBookingStatistics = async (req, res) => {
  try {
    const { userId } = req.query;
    
    let matchQuery = {};
    if (userId) {
      matchQuery.createdBy = mongoose.Types.ObjectId(userId);
    }

    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSeats: { $sum: '$seatDetails.totalSeats' },
          totalRevenue: { $sum: '$pricing.grandTotal' }
        }
      }
    ]);

    const formattedStats = {
      pending: { count: 0, totalSeats: 0, totalRevenue: 0 },
      confirmed: { count: 0, totalSeats: 0, totalRevenue: 0 },
      cancelled: { count: 0, totalSeats: 0, totalRevenue: 0 }
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = {
        count: stat.count,
        totalSeats: stat.totalSeats,
        totalRevenue: stat.totalRevenue
      };
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error("Error fetching booking statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking statistics",
      error: error.message
    });
  }
};
