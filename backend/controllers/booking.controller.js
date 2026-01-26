import Booking from "../models/Booking.js";
import GroupTicketing from "../models/GroupTicketing.js";

const HOLD_DURATION = 2 * 60 * 60 * 1000; // 2 hours

/* =========================================================
   CREATE BOOKING
========================================================= */
export const createBooking = async (req, res) => {
  try {
    const {
      groupId, groupType, airline, sector, pnr, contactPersonName,
      adultsCount, childrenCount, infantsCount, totalPassengers,
      pricing, passengers, flights, departureDate, arrivalDate
    } = req.body;

    if (passengers.length !== totalPassengers)
      return res.status(400).json({ success: false, message: "Passenger mismatch" });

    const calculatedTotal =
      pricing.adultTotal + pricing.childTotal + pricing.infantTotal;

    if (Math.abs(calculatedTotal - pricing.grandTotal) > 0.01)
      return res.status(400).json({ success: false, message: "Price mismatch" });

    const expiresAt = new Date(Date.now() + HOLD_DURATION);

    const booking = await Booking.create({
      groupId, groupType, airline, sector, pnr, contactPersonName,
      adultsCount, childrenCount, infantsCount, totalPassengers,
      pricing, passengers, flights, departureDate, arrivalDate,
      userId: req.user._id,
      status: "on hold",
      expiresAt
    });

    // Reduce seats (infants don't take seats)
    await GroupTicketing.updateOne(
      { _id: groupId },
      { $inc: { totalSeats: -(adultsCount + childrenCount) } }
    );

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create booking" });
  }
};

/* =========================================================
   GET ALL BOOKINGS
========================================================= */
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sector, airline, fromDate, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (sector) query.sector = sector;
    if (airline) query["airline.name"] = airline;
    if (fromDate) query.departureDate = { $gte: new Date(fromDate) };

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: "i" } },
        { contactPersonName: { $regex: search, $options: "i" } },
        { pnr: { $regex: search, $options: "i" } }
      ];
    }

    if (req.user.role !== "Admin") query.userId = req.user._id;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email agencyCode companyName");

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

/* =========================================================
   GET BOOKING BY ID
========================================================= */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "name email agencyCode companyName");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (req.user.role !== "Admin" && booking.userId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.json({ success: true, data: booking });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch booking" });
  }
};

/* =========================================================
   GET BOOKING BY REFERENCE
========================================================= */
export const getBookingByReference = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.reference })
      .populate("userId", "name email agencyCode companyName");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (req.user.role !== "Admin" && booking.userId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.json({ success: true, data: booking });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch booking" });
  }
};

/* =========================================================
   UPDATE BOOKING STATUS (ADMIN)
========================================================= */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const oldStatus = booking.status;
    const seats = booking.adultsCount + booking.childrenCount;
    let seatDiff = 0;

    if (status === "cancelled" && oldStatus !== "cancelled") seatDiff = seats;
    if (oldStatus === "cancelled" && status !== "cancelled") seatDiff = -seats;

    booking.status = status;
    booking.notes = notes ?? booking.notes;
    booking.expiresAt =
      status === "on hold" || status === "pending"
        ? new Date(Date.now() + HOLD_DURATION)
        : null;

    await booking.save();
    await GroupTicketing.updateOne({ _id: booking.groupId }, { $inc: { totalSeats: seatDiff } });

    res.json({ success: true, data: booking });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

/* =========================================================
   UPDATE BOOKING DETAILS
========================================================= */
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (!["on hold", "pending"].includes(booking.status))
      return res.status(400).json({ success: false, message: "Only on-hold bookings can be edited" });

    // if (booking.expiresAt && new Date() > booking.expiresAt) {
    //   booking.status = "cancelled";
    //   await booking.save();
    //   return res.status(400).json({ success: false, message: "Booking timer expired. It is cancelled now" });
    // }

    const oldSeats = booking.adultsCount + booking.childrenCount;
    Object.assign(booking, req.body);
    const newSeats = booking.adultsCount + booking.childrenCount;
    booking.expiresAt =
      req.body.status === "on hold" || req.body.status === "pending"
        ? new Date(Date.now() + HOLD_DURATION)
        : null;

    await booking.save();
    await GroupTicketing.updateOne(
      { _id: booking.groupId },
      { $inc: { totalSeats: oldSeats - newSeats } }
    );

    res.json({ success: true, data: booking });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
};

/* =========================================================
   CANCEL BOOKING
========================================================= */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.status === "cancelled")
      return res.status(400).json({ success: false, message: "Already cancelled" });

    const seats = booking.adultsCount + booking.childrenCount;

    booking.status = "cancelled";
    booking.expiresAt = null;
    await booking.save();

    await GroupTicketing.updateOne({ _id: booking.groupId }, { $inc: { totalSeats: seats } });

    res.json({ success: true, message: "Booking cancelled", data: booking });
  } catch {
    res.status(500).json({ success: false, message: "Failed to cancel booking" });
  }
};

/* =========================================================
   DELETE BOOKING (ADMIN ONLY)
========================================================= */
export const deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    // Restore seats if not already cancelled
    if (booking.status !== "cancelled") {
      const seats = booking.adultsCount + booking.childrenCount;
      await GroupTicketing.updateOne({ _id: booking.groupId }, { $inc: { totalSeats: seats } });
    }

    await booking.deleteOne();

    res.json({ success: true, message: "Booking deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete booking" });
  }
};

/* =========================================================
   BOOKING STATISTICS (ADMIN DASHBOARD)
========================================================= */
export const getBookingStatistics = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.grandTotal" }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch statistics" });
  }
};
