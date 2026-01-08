import Register from "../models/Register.js";
import jwt from "jsonwebtoken";

/* ===========================
   GENERATE JWT
=========================== */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

/* ===========================
   REGISTER USER
=========================== */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, companyName } = req.body;

    const userExists = await Register.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }
    const plainPassword = password;

    // Set status to Inactive for Agency role, Active for others
    const status = role === "Agency" ? "Inactive" : "Active";

    const user = await Register.create({
      name,
      email,
      phone,
      password,
      plainPassword,
      role,
      companyName,
      status
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   LOGIN USER
=========================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Register.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if user is an Agency and verify their status
    if (user.role === "Agency" && user.status !== "Active") {
      const msg =
        user.status === "Suspended"
          ? "Your account is suspended. Please contact admin."
          : `Your agency account is ${user.status}. Please wait for admin approval.`;

      return res.status(403).json({
        success: false,
        message: msg,
        status: user.status,
        role: user.role
      });
    }

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET LOGGED-IN PROFILE
=========================== */
export const getProfile = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET ALL USERS (ADMIN)
=========================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await Register.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   UPDATE USER STATUS
=========================== */
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await Register.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   DELETE USER
=========================== */
export const deleteUser = async (req, res) => {
  try {
    const user = await Register.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
