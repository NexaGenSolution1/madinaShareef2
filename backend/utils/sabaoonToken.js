import axios from "axios";
import SabaoonToken from "../models/SabaoonToken.js";

export const storeSabaoonToken = async (token, expiry) => {
    try {
        await SabaoonToken.deleteMany({});

        const newToken = new SabaoonToken({
            token,
            expiry: new Date(expiry),
        });

        await newToken.save();
        console.log("Sabaoon token stored successfully");
        return newToken;
    } catch (error) {
        console.error("Error storing Sabaoon token:", error);
        throw error;
    }
};

export const getSabaoonToken = async () => {
    return await SabaoonToken.findOne().sort({ createdAt: -1 });
};

export const isTokenValid = async () => {
    const record = await getSabaoonToken();
    if (!record || !record.token) return false;

    return new Date(record.expiry) > new Date();
};

// Hits the Sabaoon login API, stores the returned token, and returns it.
export const refreshSabaoonToken = async () => {
    const { SABAOON_API_URL, SABAOON_EMAIL, SABAOON_PASSWORD, SABAOON_AGENT_CODE } = process.env;

    if (!SABAOON_EMAIL || !SABAOON_PASSWORD || !SABAOON_AGENT_CODE) {
        throw new Error("Sabaoon login credentials are not set in environment variables (SABAOON_EMAIL, SABAOON_PASSWORD, SABAOON_AGENT_CODE)");
    }

    const loginUrl = `${SABAOON_API_URL}/login`;

    const response = await axios.post(loginUrl, {
        email: SABAOON_EMAIL,
        password: SABAOON_PASSWORD,
        agent_code: SABAOON_AGENT_CODE,
    });

    const { token, expiry } = response.data;

    if (!token || !expiry) {
        throw new Error("Sabaoon login response did not include a token or expiry");
    }

    await storeSabaoonToken(token, expiry);
    console.log(`Sabaoon token refreshed, expires at: ${expiry}`);
    return { token, expiry };
};

// Returns a valid Sabaoon token, automatically refreshing it if it has expired.
export const getValidSabaoonToken = async () => {
    const record = await getSabaoonToken();

    const isExpired = !record || !record.token || new Date(record.expiry) <= new Date();

    if (isExpired) {
        console.log("Sabaoon token is missing or expired — refreshing...");
        const { token, expiry } = await refreshSabaoonToken();
        return { token, expiry: new Date(expiry) };
    }

    return record;
};