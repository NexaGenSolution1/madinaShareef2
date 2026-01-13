import mongoose from "mongoose";

/* ===========================
   FLIGHT SUB-SCHEMA
=========================== */
const FlightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  flightNo: { type: String, required: true },

  depDate: { type: Date, required: true },
  depTime: { type: String, required: true },
  arrDate: { type: Date, required: true },
  arrTime: { type: String, required: true },

  sectorFrom: { type: String, required: true },
  sectorTo: { type: String, required: true },
  fromTerminal: { type: String },
  toTerminal: { type: String },
  
  flightClass: { type: String },
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
  // Buying Prices
  buyingCurrency: { type: String, default: "SAR" },
  buyingAdultPrice: { type: Number, default: 0 },
  buyingChildPrice: { type: Number, default: 0 },
  buyingInfantPrice: { type: Number, default: 0 },
  
  // Selling Prices B2B
  sellingCurrencyB2B: { type: String, default: "SAR" },
  sellingAdultPriceB2B: { type: Number, default: 0 },
  sellingChildPriceB2B: { type: Number, default: 0 },
  sellingInfantPriceB2B: { type: Number, default: 0 },
  
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

  evoucherAccount: { type: String },
  sector: { type: String },
  type: { type: String },
  
  airline: { type: String },
  groupCategory: { type: String },
  groupName: { type: String },
  showSeat: { type: Boolean, default: false },

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
  
  pnr: { type: String },
  contactPersonPhone: { type: String },
  contactPersonEmail: { type: String },
  internalStatus: { type: String, default: "Public" },

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

  // Calculate total based on selling prices (B2B)
  this.price.total =
    adults * (this.price.sellingAdultPriceB2B || 0) +
    children * (this.price.sellingChildPriceB2B || 0) +
    infants * (this.price.sellingInfantPriceB2B || 0);

  next();
});

/* ===========================
   INDEXES
=========================== */
GroupTicketingSchema.index({ voucher_id: 1 });
GroupTicketingSchema.index({ groupBookingId: 1 });
GroupTicketingSchema.index({ status: 1 });

export default mongoose.model("GroupTicketing", GroupTicketingSchema);
