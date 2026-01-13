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
  createdAt: string;
  updatedAt: string;
}

const GroupTicketing = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<GroupTicketing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
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
    
    const matchesGroupType = groupTypeFilter === "All" || booking.groupType === groupTypeFilter;
    
    return matchesSearch && matchesGroupType;
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

  return (
    <>
      <PageMeta title="Group Ticketing" description="Manage group ticketing bookings" />
      <PageBreadCrumb pageTitle="Group Ticketing" />

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
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <option value="UAE Groups">UAE Groups</option>
                <option value="KSA Groups">KSA Groups</option>
                <option value="Bahrain Groups">Bahrain Groups</option>
                <option value="Mascat Groups">Mascat Groups</option>
                <option value="Qatar Groups">Qatar Groups</option>
                <option value="UK Groups">UK Groups</option>
                <option value="Umrah Groups">Umrah Groups</option>
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
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Group Type</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Available Seats</th>
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
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {booking.groupType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800 dark:text-white/90">
                        <div className="text-xs text-gray-500">Seats: {booking.seatCount}</div>
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
