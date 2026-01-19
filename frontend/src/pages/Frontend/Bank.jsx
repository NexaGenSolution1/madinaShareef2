import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

const Bank = () => {
  const [banks, setBanks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all banks
  const fetchBanks = async () => {
    try {
      setError(null);
      
      const response = await axiosInstance.get("/bank");
      if (response.data.success) {
        // Filter only active banks for frontend
        const activeBanks = response.data.data.filter(
          (bank) => bank.status === "Active"
        );
        setBanks(activeBanks);
      } else {
        setBanks([]);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      if (error.response && error.response.status === 404) {
        setBanks([]);
      } else {
        setError("Failed to fetch bank details. Please try again later.");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  if (initialLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bank details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBanks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mx-auto px-2 sm:px-4 md:px-0">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">bank details</h1>
        <p className="text-sm sm:text-base text-gray-600">View your registered bank account information</p>
      </div>

      {banks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 sm:w-16 h-12 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-500 text-base sm:text-lg">No bank details available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {banks.map((bank) => (
            <div
              key={bank._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Bank Logo Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex items-center justify-center h-32 sm:h-40 border-b border-gray-200">
                {bank.logo ? (
                  <img
                    src={bank.logo}
                    alt={`${bank.bankName} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-4xl sm:text-6xl font-bold text-gray-400">
                    {bank.bankName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Bank Details Section */}
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Bank Name
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      {bank.bankName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Account Title
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">
                      {bank.accountTitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Account Number
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 font-mono">
                        {bank.accountNo}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        IBN
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 font-mono">
                        {bank.ibn}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Address
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
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
  );
};

export default Bank;
