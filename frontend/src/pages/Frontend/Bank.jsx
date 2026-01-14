import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

const Bank = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all banks
  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/bank");
      if (response.data.success) {
        // Filter only active banks for frontend
        const activeBanks = response.data.data.filter(
          (bank) => bank.status === "Active"
        );
        setBanks(activeBanks);
      } else {
        // If response is not successful but no error thrown, set empty array
        setBanks([]);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      // Only show error for actual network/server errors
      // If it's a 404 or empty response, just show empty state
      if (error.response && error.response.status === 404) {
        setBanks([]);
      } else {
        setError("Failed to fetch bank details. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bank details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bank Details</h1>

        {banks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bank details available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks.map((bank) => (
              <div
                key={bank._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Bank Logo Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 flex items-center justify-center h-40">
                  {bank.logo ? (
                    <img
                      src={bank.logo}
                      alt={`${bank.bankName} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-gray-400">
                      {bank.bankName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Bank Details Section */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Bank Name:
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {bank.bankName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Account Title:
                      </p>
                      <p className="text-base text-gray-700">
                        {bank.accountTitle}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Account Number:
                      </p>
                      <p className="text-base text-gray-700">
                        {bank.accountNo}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        IBN:
                      </p>
                      <p className="text-base text-gray-700">{bank.ibn}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Address:
                      </p>
                      <p className="text-base text-gray-700">
                        {bank.bankAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bank;
