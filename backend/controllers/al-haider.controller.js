import axios from "axios";

export const getAvailableBookingsByGroup = async (req, res) => {
    try {
        

        // Get auth token set by middleware
        const token = req.alHaiderAPIToken;

        const response = await axios.get(
            `${process.env.ALI_HAIDER_API_URL}api/available/groups?type=0&airline_id=0`,
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