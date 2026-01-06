import GroupTicketing from "../models/GroupTicketing.js";

/* ===========================
   CREATE GROUP TICKETING
=========================== */
export const createGroupTicketing = async (req, res) => {
  try {
    const group = await GroupTicketing.create(req.body);

    res.status(201).json({
      success: true,
      message: "Group ticketing created successfully",
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET ALL GROUP BOOKINGS
=========================== */
export const getAllGroupTicketings = async (req, res) => {
  try {
    const groups = await GroupTicketing.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET SINGLE GROUP BOOKING
=========================== */
export const getGroupTicketingById = async (req, res) => {
  try {
    const group = await GroupTicketing.findById(req.params.id)
      .populate("user", "name email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   UPDATE GROUP BOOKING
=========================== */
export const updateGroupTicketing = async (req, res) => {
  try {
    const group = await GroupTicketing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Group ticketing updated",
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   UPDATE STATUS ONLY
=========================== */
export const updateGroupStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const group = await GroupTicketing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated",
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   DELETE GROUP BOOKING
=========================== */
export const deleteGroupTicketing = async (req, res) => {
  try {
    const group = await GroupTicketing.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Group ticketing deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
