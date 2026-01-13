import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../Api/axios";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumb from "../components/common/PageBreadCrumb";

interface Flight {
  airline: string;
  flightNo: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  sectorFrom: string;
  sectorTo: string;
  fromTerminal?: string;
  toTerminal?: string;
  flightClass?: string;
  baggage?: string;
  meal?: string;
}

interface Passenger {
  adults: number;
  children: number;
  infants: number;
}

interface Price {
  buyingCurrency: string;
  buyingAdultPrice: number;
  buyingChildPrice: number;
  buyingInfantPrice: number;
  sellingCurrencyB2B: string;
  sellingAdultPriceB2B: number;
  sellingChildPriceB2B: number;
  sellingInfantPriceB2B: number;
  total: number;
}

interface Payment {
  amount: number;
  method: "Cash" | "Bank" | "Online";
  status: "Pending" | "Paid" | "Refunded";
  paymentDate?: string;
}

interface GroupTicketing {
  _id: string;
  voucher_id: string;
  groupBookingId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    companyName: string;
    agencyCode: string;
  };
  evoucherAccount?: string;
  sector?: string;
  type?: string;
  airline?: string;
  groupCategory?: string;
  groupName?: string;
  showSeat?: boolean;
  groupType: "Hajj" | "Umrah";
  flights: Flight[];
  passengers: Passenger;
  price: Price;
  payments: Payment[];
  seatCount: number;
  pnr?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  internalStatus?: string;
  status: "Pending" | "Processing" | "Cancelled" | "Confirmed";
  createdAt: string;
  updatedAt: string;
}

const GroupTicketing = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<GroupTicketing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [groupTypeFilter, setGroupTypeFilter] = useState<string>("All");
  const [entriesPerPage, setEntriesPerPage] = useState(50);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const response = await axiosInstance.get("/group-ticketing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bookingId: string) => {
    navigate(`/group-ticketing/edit/${bookingId}`);
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("admin_token");
      const response = await axiosInstance.delete(`/group-ticketing/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        window.alert("✅ Booking deleted successfully!");
        fetchBookings();
      }
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      window.alert("❌ " + (error.response?.data?.message || "Failed to delete booking"));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.voucher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.groupBookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.agencyCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    const matchesGroupType = groupTypeFilter === "All" || booking.groupType === groupTypeFilter;
    
    return matchesSearch && matchesStatus && matchesGroupType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "Pending":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      case "Processing":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "Cancelled":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const confirmedCount = bookings.filter(b => b.status === "Confirmed").length;
  const pendingCount = bookings.filter(b => b.status === "Pending").length;
  const processingCount = bookings.filter(b => b.status === "Processing").length;
  const cancelledCount = bookings.filter(b => b.status === "Cancelled").length;

  return (
    <>
      <PageMeta title="Group Ticketing" description="Manage group ticketing bookings" />
      <PageBreadCrumb pageTitle="Group Ticketing" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
          <div className="flex items-center justify-center w-14 h-14 bg-white/90 rounded-full shadow-md">
            <svg className="w-7 h-7 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="text-white">
            <div className="text-sm font-semibold tracking-wide">Confirmed</div>
            <div className="text-3xl font-bold">{confirmedCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
          <div className="flex items-center justify-center w-14 h-14 bg-white/90 rounded-full shadow-md">
            <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="text-white">
            <div className="text-sm font-semibold tracking-wide">Pending</div>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-lg">
          <div className="flex items-center justify-center w-14 h-14 bg-white/90 rounded-full shadow-md">
            <svg className="w-7 h-7 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="text-white">
            <div className="text-sm font-semibold tracking-wide">Processing</div>
            <div className="text-3xl font-bold">{processingCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl shadow-lg">
          <div className="flex items-center justify-center w-14 h-14 bg-white/90 rounded-full shadow-md">
            <svg className="w-7 h-7 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="text-white">
            <div className="text-sm font-semibold tracking-wide">Cancelled</div>
            <div className="text-3xl font-bold">{cancelledCount}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]" style={{zIndex: 999999999999999999999999999999999999999999999999999}}>
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Group Bookings</h2>
            <button
              onClick={() => navigate("/group-ticketing/create")}
              className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition"
            >
              + Create New Booking
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Group Type
              </label>
              <select
                value={groupTypeFilter}
                onChange={(e) => setGroupTypeFilter(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="All">All Types</option>
                <option value="Hajj">Hajj</option>
                <option value="Umrah">Umrah</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by voucher, booking ID, agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          {/* Entries */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="h-9 rounded border border-gray-300 bg-white px-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="text-gray-500 dark:text-gray-400">Loading bookings...</div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="text-gray-500 dark:text-gray-400">No bookings found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-800 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">#</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Voucher ID</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Agency</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Group Type</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Passengers</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Total Price</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Created</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50 dark:bg-gray-800/50">
                  {filteredBookings.slice(0, entriesPerPage).map((booking, index) => (
                    <tr key={booking._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-4 text-sm text-gray-800 dark:text-white/90">{index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.voucher_id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{booking.groupBookingId}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-800 dark:text-white/90">{booking.user.companyName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{booking.user.agencyCode}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {booking.groupType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800 dark:text-white/90">
                        <div>Adults: {booking.passengers.adults}</div>
                        <div>Children: {booking.passengers.children}</div>
                        <div>Infants: {booking.passengers.infants}</div>
                        <div className="text-xs text-gray-500">Seats: {booking.seatCount}</div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-800 dark:text-white/90">
                        {booking.price.total.toFixed(2)} {booking.price.sellingCurrencyB2B || booking.price.buyingCurrency}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800 dark:text-white/90">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(booking._id)}
                            className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupTicketing;
