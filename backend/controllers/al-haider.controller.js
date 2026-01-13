import axios from "axios";

export const getAvailableBookingsByGroup = async (req, res) => {
    try {
        const { group_type } = req.query;

        // Validate group_type
        if (!group_type) {
            return res.status(400).json({
                success: false,
                message: "group_type is required as query parameter"
            });
        }

        // Get auth token set by middleware
        const token = req.alHaiderAPIToken;
        console.log("Using Al-Haider API token to fetch available bookings by group:", { token, group_type });

        const response = await axios.get(
            `${process.env.ALI_HAIDER_API_URL}api/available/groups?type=${group_type}&airline_id=0`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error("AL-HAIDER API ERROR:", error.message || error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}