import axios from "axios";
import { getValidSabaoonToken } from "../utils/sabaoonToken.js";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Format a Date (or date string) to "YYYY-MM-DD". Returns "" if invalid. */
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// ─────────────────────────────────────────────────────────
// GET ALL GROUPS
// ─────────────────────────────────────────────────────────

export const getSabaoonGroups = async (req, res) => {
  try {
    let tokenRecord;
    try {
      tokenRecord = await getValidSabaoonToken();
    } catch (refreshErr) {
      console.error("Failed to obtain a valid Sabaoon token:", refreshErr.message);
      return res
        .status(503)
        .json({ success: false, message: "Unable to authenticate with Sabaoon. Please try again later." });
    }

    const { type } = req.query;
    const params = { token: tokenRecord.token };
    if (type) params.type = type;

    const response = await axios.get(
      `${process.env.SABAOON_API_URL}/groups`,
      { params }
    );

    const rawGroups = response.data?.groups || [];

    const normalizedGroups = rawGroups
      .filter((g) => Number(g.available_no_of_pax) > 0)
      .map((g) => {
        const firstDetail = g.details?.[0] || {};
        const airlineObj = Array.isArray(g.airline) ? g.airline[0] : g.airline;

        const LOGO_BASE = "https://sabaoon.com/assets/img/airline-logo/";
        const logoUrl = airlineObj?.logo_url
          ? airlineObj.logo_url.startsWith("http")
            ? airlineObj.logo_url
            : `${LOGO_BASE}${encodeURIComponent(airlineObj.logo_url)}`
          : null;

        return {
          ...g,
          // Parse price to number (Sabaoon sends it as a string)
          price: Number(g.price) || 0,
          // Build sector string from origin-destination so the frontend can split it
          sector:
            firstDetail.origin && firstDetail.destination
              ? `${firstDetail.origin}-${firstDetail.destination}`
              : g.sector,
          // Normalise airline to a plain object (frontend expects g.airline?.airline_name)
          airline: airlineObj
            ? { ...airlineObj, logo_url: logoUrl }
            : null,
          // Propagate meal onto each detail so the existing card UI can read flight?.meal
          details: (g.details || []).map((d) => ({ ...d, meal: g.meal })),
        };
      });

    return res.json({ success: true, data: normalizedGroups });
  } catch (error) {
    console.error("Error fetching Sabaoon groups:", error?.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch groups from Sabaoon" });
  }
};

// ─────────────────────────────────────────────────────────
// CREATE BOOKING ON SABAOON
// ─────────────────────────────────────────────────────────

/**
 * Sends a booking to the Sabaoon API.
 *
 * @param {object} params
 * @param {string}   params.groupId          Sabaoon's numeric group_id
 * @param {string}   params.pnr              PNR string (may contain " / " for two PNRs)
 * @param {string}   params.bookingReference Our internal booking reference (used as roe)
 * @param {number}   params.adultsCount
 * @param {number}   params.childrenCount
 * @param {number}   params.infantsCount
 * @param {object[]} params.passengers       Passenger objects from our Booking model
 * @param {object}   params.pricing          Pricing object from our Booking model
 *
 * @returns {{ transactionId: number }} Sabaoon transaction_id
 */
export const createSabaoonBooking = async ({
  groupId,
  pnr,
  bookingReference,
  adultsCount,
  childrenCount,
  infantsCount,
  passengers,
  pricing,
}) => {
  const tokenRecord = await getValidSabaoonToken();

  // Split PNR into pnr_1 / pnr_2 (Sabaoon sometimes has "PNR1 / PNR2")
  const pnrParts = (pnr || "").split(/\s*\/\s*/);
  const pnr_1 = pnrParts[0] || "";
  const pnr_2 = pnrParts[1] || "";

  const totalSeats = adultsCount + childrenCount; // Sabaoon counts infants differently

  // Build per-passenger arrays
  const pax_title = [];
  const human_type = [];
  const sur_name = [];
  const given_name = [];
  const pass_no = [];
  const dob = [];
  const doi = [];
  const doe = [];

  for (const p of passengers) {
    pax_title.push(p.title || "Mr");
    human_type.push((p.type || "Adult").toLowerCase());
    sur_name.push(p.surName || "");
    given_name.push(p.givenName || "");
    pass_no.push(p.passport || "");
    dob.push(formatDate(p.dateOfBirth));
    doi.push(""); // We don't collect passport issue date
    doe.push(formatDate(p.passportExpiry));
  }

  // Build price arrays (one entry per passenger of that type)
  const adult_price = Array(adultsCount).fill(String(pricing.adultPrice || 0));
  const child_price = Array(childrenCount).fill(String(pricing.childPrice || 0));
  const infant_price = Array(infantsCount).fill(String(pricing.infantPrice || 0));

  const payload = {
    token: tokenRecord.token,
    roe: bookingReference,
    no_of_seat: String(totalSeats),
    group_id: String(groupId),
    pnr_1,
    pnr_2,
    pax_title,
    human_type,
    sur_name,
    given_name,
    pass_no,
    dob,
    doi,
    doe,
    adult_price,
    child_price,
    infant_price,
  };

  const response = await axios.post(
    `${process.env.SABAOON_API_URL}/booking`,
    payload
  );

  const { status, message, transaction_id } = response.data;

  if (status !== "success") {
    throw new Error(message || "Sabaoon booking API returned a failure status");
  }

  return { transactionId: transaction_id };
};
