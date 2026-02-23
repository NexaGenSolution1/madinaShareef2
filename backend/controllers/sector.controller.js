import axios from "axios";
import Airline from "../models/Airline.js";
import GroupTicketing from "../models/GroupTicketing.js";
import Sector from "../models/Sector.js";
import UnifiedGroupCache from "../models/UnifiedGroupCache.js";
import Booking from "../models/Booking.js";

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
    const adminGroups = await GroupTicketing.find({ internalStatus: "Public" })
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

      aliHaiderGroups = response?.data?.groups || [];

      /* ===============================
         4.1️⃣ Auto-Store Missing Sectors
      =============================== */
      const uniqueSectors = [...new Set(aliHaiderGroups.map((g) => g.sector))];
      const existingSectorTitles = sectors.map((s) => s.sectorTitle);

      const newSectors = uniqueSectors.filter(
        (sector) => sector && !existingSectorTitles.includes(sector),
      );

      if (newSectors.length > 0) {
        const typeMap = {
          UAE: "UAE Groups",
          "KSA ONEWAY": "KSA Groups",
          "KSA RETURN": "KSA Groups",
          BAHRAIN: "Bahrain Groups",
          MASCAT: "Mascat Groups",
          QATAR: "Qatar Groups",
          UK: "UK Groups",
          UMRAH: "Umrah Groups",
        };

        const sectorsToInsert = newSectors.map((sector) => {
          const group = aliHaiderGroups.find((g) => g.sector === sector);
          const groupType = typeMap[group?.type] || "KSA Groups";

          return {
            sectorTitle: sector,
            fullSector: sector,
            groupType,
            order: 999,
          };
        });

        await Sector.insertMany(sectorsToInsert, { ordered: false }).catch(
          () => {},
        );

        // Refresh sectors and map
        const updatedSectors = await Sector.find().lean();
        sectorOrderMap.length = 0;
        updatedSectors.forEach((s) => {
          sectorOrderMap[s.sectorTitle] = s.order ?? 999;
        });
      }
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
   7️⃣ Merge All Groups & Fix Dates
=============================== */
    let unifiedGroups = [...transformedAliHaider, ...transformedAdmin];

    unifiedGroups = unifiedGroups.map((g) => {
      const formatDate = (dateValue) => {
        if (!dateValue) return null;
        const d = new Date(dateValue);
        return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
      };

      // Important: Ali Haider data uses 'dept_date' but details use 'flight_date' or 'dep_date'
      const finalDeptDate = formatDate(g.dept_date || g.dep_date);
      const finalArvDate = formatDate(g.arv_date);

      return {
        ...g,
        id: g.id?.toString?.() || g.id,
        dept_date: finalDeptDate,
        arv_date: finalArvDate,

        details: g.details?.map((d) => {
          // 1. Check for flight_date (Ali Haider) or dep_date (Admin)
          const detailDepDate = formatDate(
            d.dep_date || d.flight_date || finalDeptDate,
          );

          // 2. Fix arrival date logic
          const detailArvDate = formatDate(d.arv_date);

          return {
            ...d,
            // Ensure field names are consistent
            dep_date: detailDepDate,
            flight_date: detailDepDate,
            arv_date: detailArvDate,
          };
        }),

        airline: {
          ...g.airline,
          id: g.airline?.id?.toString?.() || g.airline?.id,
        },
      };
    });

    /* ===============================
       8️⃣ Sector Sorting (ADMIN ORDER)
    =============================== */
    unifiedGroups.sort((a, b) => {
      const orderA = sectorOrderMap[a.sector] ?? 999;
      const orderB = sectorOrderMap[b.sector] ?? 999;
      return orderA - orderB;
    });

    /* ===============================
       9️⃣ Filter — Past Departures Remove
    =============================== */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const freshGroups = unifiedGroups.filter((group) => {
      const rawDate = group.dept_date;
      if (!rawDate) return true; // no date = keep it

      const depDate = new Date(rawDate);
      depDate.setHours(0, 0, 0, 0);

      return depDate >= today; // ✅ today or future only
    });

    /* ===============================
       🔟 Smart Cache Store / Update
    =============================== */
    let cacheDoc = await UnifiedGroupCache.findOne();

    if (!cacheDoc) {
      // First time — create fresh
      cacheDoc = await UnifiedGroupCache.create({
        data: freshGroups,
        apidata: true,
      });
    } else {
      // Smart merge: preserve cache seat counts for groups
      // that were recently booked (within last HOLD_DURATION window)
      const HOLD_DURATION_MS = 15 * 60 * 1000; // match your HOLD_DURATION constant
      const recentCutoff = new Date(Date.now() - HOLD_DURATION_MS);

      // Find groups that have active/recent bookings
      const recentlyBookedGroupIds = await Booking.distinct("groupId", {
        createdAt: { $gte: recentCutoff },
        status: { $in: ["on hold", "confirmed"] },
      });

      const recentlyBookedSet = new Set(recentlyBookedGroupIds.map(String));

      // Build map from existing cache for quick lookup
      const cachedDataMap = new Map(
        cacheDoc.data.map((g) => [String(g.id), g]),
      );

      // Merge: protect seat count if group was recently booked
      const mergedGroups = freshGroups.map((freshGroup) => {
        const gId = String(freshGroup.id);

        if (recentlyBookedSet.has(gId)) {
          // 🔒 Keep cached seat count — already deducted by createBooking
          const cached = cachedDataMap.get(gId);
          if (cached) {
            return {
              ...freshGroup,
              available_no_of_pax: cached.available_no_of_pax,
            };
          }
        }

        // ✅ No recent booking = use fresh API/DB data
        return freshGroup;
      });

      cacheDoc.data = mergedGroups;
      cacheDoc.apidata = true;
      cacheDoc.markModified("data"); // required for Mongoose mixed arrays
      await cacheDoc.save();
    }

    /* ===============================
       1️⃣1️⃣ Response
    =============================== */
    res.status(200).json({
      success: true,
      total: cacheDoc.data.length,
      data: cacheDoc.data,
    });
  } catch (error) {
    console.error("Unified API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
