import axios from "axios";

/* ===========================
   PRE-AUTHENTICATION MIDDLEWARE
=========================== */
export const preAuthMiddleware = async (req, res, callback) => {
  
  try {
    // Check if valid token exists in cookie
    if (req.cookies?.externalAPIToken && req.cookies?.externalAPITokenExpiry) {
      const expiry = parseInt(req.cookies.externalAPITokenExpiry, 10);
      const now = Date.now();
      const isValid = now < expiry;
      
      console.log("Found existing token, checking expiry:", {
        expiry: new Date(expiry).toISOString(),
        now: new Date(now).toISOString(),
        isValid
      });
      
      if (isValid) {
        // Token is still valid, use it
        req.externalAPIToken = req.cookies.externalAPIToken;
        console.log("Using existing valid external API token");
        return callback();
      } else {
        console.log("Existing token has expired, fetching new one...");
      }
    } else {
      console.log("ℹNo existing token found, fetching new one...");
    }
    
    // No valid token in cookie, fetch new one from external API
    const credentials = {
      email: process.env.ALI_HAIDER_API_EMAIL,
      password: process.env.ALI_HAIDER_API_PASSWORD
    };

    if (!credentials.email || !credentials.password) {
      console.error("MISSING CREDENTIALS IN ENV!");
      throw new Error("External API credentials not configured in environment variables");
    }

    const response = await axios.post(
      `${process.env.ALI_HAIDER_API_URL}api/login`,
      credentials,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000
      }
    );


    if (!response?.data?.token) {
      throw new Error(`No token received from external API. Response data: ${JSON.stringify(response.data)}`);
    }

    const token = response.data.token;
    const expiresAt = response.data.expires_at; // Note: it's expires_at not expired_at

    // Convert Unix timestamp (seconds) to milliseconds
    const expiresAtMs = expiresAt * 1000;

    // Store token in cookies
    res.cookie('externalAPIToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresAtMs - Date.now(),
      sameSite: 'strict'
    });

    res.cookie('externalAPITokenExpiry', expiresAtMs.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresAtMs - Date.now(),
      sameSite: 'strict'
    });

    // Attach token to request
    req.externalAPIToken = token;

    callback();

  } catch (error) {
    console.error(`Pre-authentication error:`, error.message);
    
    if (error.response) {
      console.error("External API error response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.code) {
      console.error("Network error code:", error.code);
    }
    
    // Clear any invalid cookies
    res.clearCookie('externalAPIToken');
    res.clearCookie('externalAPITokenExpiry');
    
    // Pass error to callback
    return callback(error);
  }
};
