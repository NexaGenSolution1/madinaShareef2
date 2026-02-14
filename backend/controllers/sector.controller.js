import axios from "axios";
import Airline from "../models/Airline.js";
import GroupTicketing from "../models/GroupTicketing.js";
import Sector from "../models/Sector.js";

// Add new sector
export const addSector = async (req, res) => {
  try {
    const { groupType, sectorTitle, fullSector } = req.body;

    // Validate required fields
    if (!groupType || !sectorTitle || !fullSector) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if sector already exists
    const existingSector = await Sector.findOne({
      groupType,
      sectorTitle: sectorTitle.toUpperCase(),
    });

    if (existingSector) {
      return res.status(400).json({
        success: false,
        message: "Sector with this title already exists in this group",
      });
    }

    // Create new sector
    const newSector = await Sector.create({
      groupType,
      sectorTitle: sectorTitle.toUpperCase(),
      fullSector,
    });

    res.status(201).json({
      success: true,
      message: "Sector added successfully",
      data: newSector,
    });
  } catch (error) {
    console.error("Error adding sector:", error);
    res.status(500).json({
      success: false,
      message: "Error adding sector",
      error: error.message,
    });
  }
};

// Get all sectors
export const getSectors = async (req, res) => {
  try {
    const sectors = await Sector.find().sort({ groupType: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sectors.length,
      data: sectors,
    });
  } catch (error) {
    console.error("Error fetching sectors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sectors",
      error: error.message,
    });
  }
};

// Get sectors by group type
export const getSectorsByGroup = async (req, res) => {
  try {
    const { groupType } = req.params;
    const sectors = await Sector.find({ groupType }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sectors.length,
      data: sectors,
    });
  } catch (error) {
    console.error("Error fetching sectors by group:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sectors by group",
      error: error.message,
    });
  }
};

// Get single sector by ID
export const getSectorById = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await Sector.findById(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Sector not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sector,
    });
  } catch (error) {
    console.error("Error fetching sector:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sector",
      error: error.message,
    });
  }
};

// Update sector
export const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupType, sectorTitle, fullSector } = req.body;

    // Validate required fields
    if (!groupType || !sectorTitle || !fullSector) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if sector exists
    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Sector not found",
      });
    }

    // Check if another sector with the same title exists in the same group
    const existingSector = await Sector.findOne({
      _id: { $ne: id },
      groupType,
      sectorTitle: sectorTitle.toUpperCase(),
    });

    if (existingSector) {
      return res.status(400).json({
        success: false,
        message: "Another sector with this title already exists in this group",
      });
    }

    // Update sector
    const updatedSector = await Sector.findByIdAndUpdate(
      id,
      {
        groupType,
        sectorTitle: sectorTitle.toUpperCase(),
        fullSector,
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Sector updated successfully",
      data: updatedSector,
    });
  } catch (error) {
    console.error("Error updating sector:", error);
    res.status(500).json({
      success: false,
      message: "Error updating sector",
      error: error.message,
    });
  }
};

// Delete sector
export const deleteSector = async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Sector not found",
      });
    }

    await Sector.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Sector deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sector:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting sector",
      error: error.message,
    });
  }
};

// Update Sector Order
export const updateSectorOrder = async (req, res) => {
  try {
    const { sectors } = req.body;

    if (!sectors || !Array.isArray(sectors)) {
      return res
        .status(400)
        .json({ success: false, message: "Sectors array is required" });
    }

    // Prepare bulk operations
    const bulkOps = sectors.map((sector) => ({
      updateOne: {
        filter: { _id: sector._id },
        update: { $set: { order: sector.order } },
      },
    }));

    await Sector.bulkWrite(bulkOps);

    const updatedSectors = await Sector.find().sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Sector order updated successfully",
      data: updatedSectors,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUnifiedGroups = async (req, res) => {
  try {
    /* ===============================
       1️⃣ Fetch Admin Groups
    =============================== */
    const adminGroups = await GroupTicketing.find()
      .sort({ createdAt: -1 })
      .lean();

    /* ===============================
       2️⃣ Fetch Airlines
    =============================== */
    const airlines = await Airline.find().lean();

    /* ===============================
       3️⃣ Fetch Sector Sorting Order
    =============================== */
    const sectors = await Sector.find().lean();

    // Make sector order map
    const sectorOrderMap = {};
    sectors.forEach((s) => {
      sectorOrderMap[s.sectorTitle] = s.order ?? 999;
    });

    /* ===============================
       4️⃣ Fetch Ali Haider Groups
    =============================== */
    const token = process.env.ALI_HAIDER_API_TOKEN;

    let aliHaiderGroups = [];

    try {
      const response = await axios.get(
        `${process.env.ALI_HAIDER_API_URL}api/available/groups?type=0&airline_id=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // console.log(response);
      aliHaiderGroups = response?.data?.groups || [];
    } catch (err) {
      console.log("Ali Haider API Failed:", err.message);
    }

    /* ===============================
       5️⃣ Transform Admin Groups → Unified
    =============================== */
    const transformedAdmin = adminGroups.map((g) => {
      const airline = airlines.find((a) => a.airlineName === g.airline);

      return {
        id: g._id,
        source: "admin",

        sector: g.sector,
        type: g.groupType,

        available_no_of_pax: g.totalSeats,
        showSeat: g.showSeat,

        price: g.price?.sellingAdultPriceB2B || 0,
        childPrice: g.price?.sellingChildPriceB2B || 0,
        infantPrice: g.price?.sellingInfantPriceB2B || 0,

        pnr: g.pnr,

        dept_date: g.flights?.[0]?.depDate || null,
        arv_date: g.flights?.[g.flights.length - 1]?.arrDate || null,

        details: g.flights?.map((f, i) => ({
          sr: i + 1,
          flight_no: f.flightNo,
          dep_date: f.depDate,
          dept_time: f.depTime,
          origin: f.fromTerminal,
          destination: f.toTerminal,
          arv_date: f.arrDate,
          arv_time: f.arrTime,
          baggage: f.baggage,
          meal: f.meal,
        })),

        airline: {
          id: airline?._id || null,
          airline_name: g.airline,
          short_name: airline?.shortCode || null,
          logo_url: airline?.logo || null,
        },
      };
    });

    /* ===============================
       6️⃣ Transform Ali Haider Groups
    =============================== */
    const transformedAliHaider = aliHaiderGroups.map((g) => ({
      ...g,
      source: "ali-haider",
    }));

    /* ===============================
       7️⃣ Merge All Groups
    =============================== */
    let unifiedGroups = [...transformedAliHaider, ...transformedAdmin];

    /* ===============================
       8️⃣ Sector Sorting (ADMIN ORDER)
    =============================== */
    unifiedGroups.sort((a, b) => {
      const orderA = sectorOrderMap[a.sector] ?? 999;
      const orderB = sectorOrderMap[b.sector] ?? 999;
      return orderA - orderB;
    });

    /* ===============================
       9️⃣ Response
    =============================== */
    res.status(200).json({
      success: true,
      total: unifiedGroups.length,
      data: unifiedGroups,
    });
  } catch (error) {
    console.error("Unified API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
