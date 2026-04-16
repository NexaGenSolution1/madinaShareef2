import axios from "axios";
import FormData from "form-data";
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
  const token = tokenRecord.token;

  if (!token) {
    throw new Error("No valid Sabaoon token available");
  }

  console.log(`[Sabaoon] Creating booking with token: ${token.slice(0, 8)}...`);

  // Split PNR into pnr_1 / pnr_2 (Sabaoon sometimes has "PNR1 / PNR2")
  const pnrParts = (pnr || "").split(/\s*\/\s*/);
  const pnr_1 = pnrParts[0] || "";
  const pnr_2 = pnrParts[1] || "";

  const totalSeats = adultsCount + childrenCount; // Sabaoon counts infants differently

  // Build form-data body (Sabaoon backend is PHP and expects multipart/form-data,
  // matching the same format used by the login endpoint).
  const form = new FormData();

  form.append("token", token);
  form.append("agent_id", process.env.SABAOON_AGENT_CODE || "");
  form.append("roe", bookingReference);
  form.append("no_of_seat", String(totalSeats));
  form.append("group_id", String(groupId));
  form.append("pnr_1", pnr_1);
  form.append("pnr_2", pnr_2);

  for (const p of passengers) {
    form.append("pax_title[]", p.title || "Mr");
    form.append("human_type[]", (p.type || "Adult").toLowerCase());
    form.append("sur_name[]", p.surName || "");
    form.append("given_name[]", p.givenName || "");
    form.append("pass_no[]", p.passport || "");
    form.append("dob[]", formatDate(p.dateOfBirth));
    form.append("doi[]", ""); // We don't collect passport issue date
    form.append("doe[]", formatDate(p.passportExpiry));
  }

  // Price arrays — one entry per passenger of that type
  for (let i = 0; i < adultsCount; i++)
    form.append("adult_price[]", String(pricing.adultPrice || 0));
  for (let i = 0; i < childrenCount; i++)
    form.append("child_price[]", String(pricing.childPrice || 0));
  for (let i = 0; i < infantsCount; i++)
    form.append("infant_price[]", String(pricing.infantPrice || 0));

  const response = await axios.post(
    `${process.env.SABAOON_API_URL}/booking`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Token ${token}`,
      },
    }
  );

  console.log("[Sabaoon] Booking response:", JSON.stringify(response.data));

  const { status, message, transaction_id } = response.data;

  if (status !== "success") {
    throw new Error(message || "Sabaoon booking API returned a failure status");
  }

  return { transactionId: transaction_id };
};
