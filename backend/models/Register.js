import mongoose from "mongoose";
import bcrypt from "bcrypt";

const RegisterSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // IMPORTANT: hide password by default
  },

  role: {
    type: String,
    enum: ["Admin", "Agent", "SubAgent", "User"],
    default: "User"
  },

  companyName: {
    type: String
  },

  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active"
  },

  lastLogin: {
    type: Date
  }
},
{ timestamps: true }
);

/* ===========================
   PASSWORD HASHING
=========================== */
RegisterSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ===========================
   PASSWORD COMPARE METHOD
=========================== */
RegisterSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ===========================
   INDEXES
=========================== */
RegisterSchema.index({ email: 1 });
RegisterSchema.index({ role: 1 });

export default mongoose.model("Register", RegisterSchema);
