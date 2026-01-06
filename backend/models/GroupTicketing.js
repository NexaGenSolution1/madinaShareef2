import mongoose from "mongoose";

/* ===========================
   FLIGHT SUB-SCHEMA
=========================== */
const FlightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  flightNo: { type: String, required: true },

  depDateTime: { type: Date, required: true },
  arrDateTime: { type: Date, required: true },

  sectorFrom: { type: String, required: true },
  sectorTo: { type: String, required: true },

  baggage: String,
  meal: String
}, { _id: false });

/* ===========================
   PASSENGER COUNT
=========================== */
const PassengerSchema = new mongoose.Schema({
  adults: { type: Number, default: 0 },
  children: { type: Number, default: 0 },
  infants: { type: Number, default: 0 }
}, { _id: false });

/* ===========================
   PRICE BREAKDOWN
=========================== */
const PriceSchema = new mongoose.Schema({
  currency: { type: String, default: "SAR" },
  adultPrice: { type: Number, default: 0 },
  childPrice: { type: Number, default: 0 },
  infantPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

/* ===========================
   PAYMENT SUB-SCHEMA
=========================== */
const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ["Cash", "Bank", "Online"],
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Refunded"],
    default: "Pending"
  },
  paymentDate: Date
}, { timestamps: true });

/* ===========================
   MAIN GROUP TICKETING
=========================== */
const GroupTicketingSchema = new mongoose.Schema(
{
  voucher_id: {
    type: String,
    required: true,
    unique: true
  },

  groupBookingId: {
    type: String,
    required: true,
    unique: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",
    required: true
  },

  groupType: {
    type: String,
    enum: ["Hajj", "Umrah"],
    required: true
  },

  flights: [FlightSchema],

  passengers: PassengerSchema,

  price: PriceSchema,

  payments: [PaymentSchema],

  seatCount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Pending", "Processing", "Cancelled", "Confirmed"],
    default: "Pending"
  }
},
{ timestamps: true }
);

/* ===========================
   AUTO CALCULATIONS
=========================== */
GroupTicketingSchema.pre("save", function (next) {
  const { adults = 0, children = 0, infants = 0 } = this.passengers || {};

  // infants do NOT occupy seats
  this.seatCount = adults + children;

  this.price.total =
    adults * this.price.adultPrice +
    children * this.price.childPrice +
    infants * this.price.infantPrice;

  next();
});

/* ===========================
   INDEXES
=========================== */
GroupTicketingSchema.index({ voucher_id: 1 });
GroupTicketingSchema.index({ groupBookingId: 1 });
GroupTicketingSchema.index({ status: 1 });

export default mongoose.model("GroupTicketing", GroupTicketingSchema);
