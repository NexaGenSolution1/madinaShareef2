import mongoose from "mongoose";

/* ===========================
   PASSENGER SUB-SCHEMA
=========================== */
const PassengerSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['Adult', 'Child', 'Infant']
  },
  title: { 
    type: String, 
    required: true 
  },
  givenName: { 
    type: String, 
    required: true 
  },
  surName: { 
    type: String, 
    required: true 
  },
  passport: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: String, 
    required: true 
  },
  passportExpiry: { 
    type: String, 
    required: true 
  }
}, { _id: false });

/* ===========================
   SEAT DETAILS SUB-SCHEMA
=========================== */
const SeatDetailsSchema = new mongoose.Schema({
  adults: { 
    type: Number, 
    required: true,
    min: 0 
  },
  children: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  infants: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  totalSeats: { 
    type: Number, 
    required: true 
  }
}, { _id: false });

/* ===========================
   PRICING SUB-SCHEMA
=========================== */
const PricingSchema = new mongoose.Schema({
  adultPrice: { 
    type: Number, 
    required: true 
  },
  childPrice: { 
    type: Number, 
    default: 0 
  },
  infantPrice: { 
    type: Number, 
    default: 0 
  },
  adultTotal: { 
    type: Number, 
    required: true 
  },
  childTotal: { 
    type: Number, 
    default: 0 
  },
  infantTotal: { 
    type: Number, 
    default: 0 
  },
  grandTotal: { 
    type: Number, 
    required: true 
  }
}, { _id: false });

/* ===========================
   BOOKING SCHEMA
=========================== */
const BookingSchema = new mongoose.Schema({
  // Reference to Group Ticketing
  groupTicketing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupTicketing',
    required: true
  },

  // User who created the booking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },

  // Contact Information
  contactPersonName: {
    type: String,
    required: true
  },

  // Seat Details
  seatDetails: {
    type: SeatDetailsSchema,
    required: true
  },

  // Passengers
  passengers: {
    type: [PassengerSchema],
    required: true,
    validate: {
      validator: function(passengers) {
        return passengers.length === this.seatDetails.totalSeats;
      },
      message: 'Number of passengers must match total seats'
    }
  },

  // Pricing Information
  pricing: {
    type: PricingSchema,
    required: true
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
    required: true
  },

  // Flight Information (duplicated for easy access)
  flightInfo: {
    airline: String,
    sector: String,
    departureDate: Date
  },

  // Metadata
  bookingReference: {
    type: String,
    unique: true,
    sparse: true
  },

  // Cancellation Details
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register'
  },

  // Confirmation Details
  confirmedAt: Date,
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register'
  }

}, { 
  timestamps: true 
});

/* ===========================
   INDEXES
=========================== */
BookingSchema.index({ groupTicketing: 1 });
BookingSchema.index({ createdBy: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingReference: 1 });

/* ===========================
   PRE-SAVE HOOK: Generate Booking Reference
=========================== */
BookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.bookingReference = `BK${timestamp}${random}`;
  }
  next();
});

/* ===========================
   METHODS
=========================== */

// Confirm booking
BookingSchema.methods.confirmBooking = function(userId) {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  this.confirmedBy = userId;
  return this.save();
};

// Cancel booking
BookingSchema.methods.cancelBooking = function(userId, reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  if (reason) {
    this.cancellationReason = reason;
  }
  return this.save();
};

/* ===========================
   EXPORT
=========================== */
const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
