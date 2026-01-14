import Payment from "../models/Payment.js";
import { cloudinary } from "../config/cloudinary.js";

// Create new payment
export const createPayment = async (req, res) => {
  try {
    const { date, description, bankAccount, amount, status, remarks, user } = req.body;

    // Validate required fields
    if (!date || !description || !bankAccount || !amount || !user) {
      return res.status(400).json({
        success: false,
        message: "Date, description, bank account, amount, and user are required",
      });
    }

    // Prepare payment data
    const paymentData = {
      date,
      description,
      bankAccount,
      user,
      amount,
      status: status || "Un Posted",
      remarks: remarks || "",
    };

    // Add receipt if uploaded
    if (req.file) {
      paymentData.receipt = req.file.path;
      paymentData.receiptPublicId = req.file.filename;
    }

    // Create new payment
    const newPayment = await Payment.create(paymentData);
    
    // Populate bank account and user details
    await newPayment.populate(["bankAccount", "user"]);

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// Get all payments with filters
export const getPayments = async (req, res) => {
  try {
    const { dateFrom, dateTo, status } = req.query;

    // Build filter query
    let filter = {};

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    // Fetch payments with populated bank account and user
    const payments = await Payment.find(filter)
      .populate("bankAccount")
      .populate("user", "name email companyName")
      .populate("editedBy", "name email")
      .sort({ date: -1 });

    // Calculate total amount
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      success: true,
      data: payments,
      total,
      count: payments.length,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Get single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("bankAccount")
      .populate("user", "name email companyName");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, bankAccount, amount, status, remarks, editedBy } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Update fields
    if (date) payment.date = date;
    if (description) payment.description = description;
    if (bankAccount) payment.bankAccount = bankAccount;
    if (amount) payment.amount = amount;
    if (status) {
      payment.status = status;
      // Track who changed the status and when
      if (editedBy) {
        payment.editedBy = editedBy;
        payment.editedAt = new Date();
      }
    }
    if (remarks !== undefined) payment.remarks = remarks;

    // Update receipt if new file uploaded
    if (req.file) {
      // Delete old receipt from Cloudinary
      if (payment.receiptPublicId) {
        await cloudinary.uploader.destroy(payment.receiptPublicId);
      }
      payment.receipt = req.file.path;
      payment.receiptPublicId = req.file.filename;
    }

    await payment.save();
    await payment.populate("bankAccount");

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment",
      error: error.message,
    });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Delete receipt from Cloudinary if exists
    if (payment.receiptPublicId) {
      await cloudinary.uploader.destroy(payment.receiptPublicId);
    }

    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting payment",
      error: error.message,
    });
  }
};
