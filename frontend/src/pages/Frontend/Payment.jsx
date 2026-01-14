import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

const Payment = () => {
  // Get current year for default date filter
  const getCurrentYearStart = () => {
    const now = new Date();
    return `${now.getFullYear()}-01-01`;
  };

  // Form States
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    bankAccount: "",
    amount: "",
    receipt: null,
  });

  // Filter States
  const [filters, setFilters] = useState({
    dateFrom: getCurrentYearStart(),
    dateTo: new Date().toISOString().split("T")[0],
    status: "All",
  });

  // Data States
  const [payments, setPayments] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // Fetch banks for dropdown
  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get("/bank");
      if (response.data.success) {
        setBanks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  // Fetch payments based on filters
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/payment", {
        params: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          status: filters.status,
        },
      });

      if (response.data.success) {
        setPayments(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchPayments();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "amount") {
      // Remove any non-digit characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      receipt: e.target.files[0],
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.description || !formData.bankAccount || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem("frontend_user");
    if (!storedUser) {
      alert("User not logged in. Please login first.");
      return;
    }
    const user = JSON.parse(storedUser);

    // Check if user has id
    if (!user.id && !user._id) {
      alert("User ID not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("date", formData.date);
      submitData.append("description", formData.description);
      submitData.append("bankAccount", formData.bankAccount);
      submitData.append("amount", formData.amount);
      submitData.append("status", "Un Posted");
      submitData.append("user", user.id || user._id);
      
      if (formData.receipt) {
        submitData.append("receipt", formData.receipt);
      }

      const response = await axiosInstance.post("/payment/add", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Payment added successfully!");
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          description: "",
          bankAccount: "",
          amount: "",
          receipt: null,
        });
        // Reset file input
        document.querySelector('input[type="file"]').value = "";
        // Refresh payments list
        fetchPayments();
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert(error.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter button click
  const handleFilter = () => {
    fetchPayments();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add Payments</h1>
          <div className="text-sm text-gray-600">
            <a href="/" className="text-blue-600 hover:underline">
              Home
            </a>
            <span className="mx-2">/</span>
            <span>Add Payments</span>
          </div>
        </div>

        {/* Add Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Account
                </label>
                <select
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Account</option>
                  {banks.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.bankName} - {bank.accountNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount ? parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : ""}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Upload Image */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>

        {/* Filters Section */}
        <div className="bg-blue-600 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Posted">Posted</option>
                <option value="Un Posted">Un Posted</option>
              </select>
            </div>

            {/* Filter Button */}
            <div>
              <button
                onClick={handleFilter}
                disabled={loading}
                className="w-full px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Voucher Id
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No payments found
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment, index) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.voucherId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === "Posted"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.remarks || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {payment.receipt ? (
                              <a
                                href={payment.receipt}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Section */}
              <div className="bg-gray-100 px-6 py-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-700 mr-4">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      PKR: {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
