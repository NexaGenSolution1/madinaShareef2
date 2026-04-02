import React, { useEffect, useState } from "react";
import { Ticket, Menu, X } from "lucide-react";
import { FaPlane, FaSuitcase, FaUtensils, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { toast } from "react-toastify";
import MaskedDatePicker from "../../../components/MaskedDatePicker";
import { theme } from "../../../theme/theme";
import TopBar from "../../../components/TopBar/TopBar";

export default function AllGroups({ headerType, header, searchParams }) {
  const user = JSON.parse(localStorage.getItem("frontend_user"));
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    sectors: [],
    airlines: [],
    searchKeyword: "",
    departDate: null,
  });

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [airlines, setAirlines] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, [searchParams]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/sector/getUnifiedGroups");

      let fetchedGroups = response.data.success
        ? (response.data.data || []).filter(
            (group) => Number(group.available_no_of_pax) > 0,
          )
        : [];

      const groupType = searchParams.get("group_type") || "";
      if (groupType) {
        const normalizedGroupType = groupType.toLowerCase().trim();
        const groupTypeMap = {
          uae: (type) => type === "uae" || type.includes("uae"),
          ksa: (type) => type === "ksa oneway" || type.includes("ksa"),
          "ksa oneway": (type) => type === "ksa oneway" || type.includes("ksa"),
          bahrain: (type) => type === "bahrain" || type.includes("bahrain"),
          muscat: (type) =>
            type === "muscat" ||
            type.includes("muscat") ||
            type.includes("mascat"),
          qatar: (type) => type === "qatar" || type.includes("qatar"),
          uk: (type) => type === "uk" || type.includes("uk"),
          umrah: (type) => type === "umrah" || type.includes("umrah"),
        };

        fetchedGroups = fetchedGroups.filter((group) => {
          if (!group.type) return false;
          const normalizedType = group.type.toLowerCase().trim();
          const matcher = groupTypeMap[normalizedGroupType];
          if (matcher) return matcher(normalizedType);
          return (
            normalizedType === normalizedGroupType ||
            normalizedType.includes(normalizedGroupType) ||
            normalizedGroupType.includes(normalizedType)
          );
        });
      }

      const uniqueAirlines = [
        ...new Set(
          fetchedGroups.map((g) => g.airline?.airline_name).filter(Boolean),
        ),
      ];
      const uniqueSectors = [
        ...new Set(fetchedGroups.map((g) => g.sector).filter(Boolean)),
      ];

      setAirlines(uniqueAirlines.sort());
      setSectors(uniqueSectors.sort());
      setAllGroups(fetchedGroups);
      applyFilters(fetchedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      toast.error("Failed to load groups");
      setAllGroups([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (dataToFilter = allGroups) => {
    let filtered = [...dataToFilter];

    if (filters.sectors.length > 0) {
      filtered = filtered.filter((g) => filters.sectors.includes(g.sector));
    }
    if (filters.airlines.length > 0) {
      filtered = filtered.filter((g) =>
        filters.airlines.includes(g.airline?.airline_name),
      );
    }
    if (filters.searchKeyword) {
      const keyword = filters.searchKeyword.toLowerCase();
      filtered = filtered.filter((g) => {
        const matchesSector = g.sector?.toLowerCase().includes(keyword);
        const matchesAirline = g.airline?.airline_name
          ?.toLowerCase()
          .includes(keyword);
        const matchesFlightNo = g.details?.some((flight) =>
          flight.flight_no?.toLowerCase().includes(keyword),
        );
        return matchesSector || matchesAirline || matchesFlightNo;
      });
    }
    if (filters.departDate) {
      filtered = filtered.filter((g) => {
        const deptDate = new Date(g.dept_date);
        const selectedDate = new Date(filters.departDate);
        return (
          deptDate.getFullYear() === selectedDate.getFullYear() &&
          deptDate.getMonth() === selectedDate.getMonth() &&
          deptDate.getDate() === selectedDate.getDate()
        );
      });
    }

    setGroups(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "sector") {
      setFilters((prev) => ({
        ...prev,
        sectors: prev.sectors.includes(value)
          ? prev.sectors.filter((s) => s !== value)
          : [...prev.sectors, value],
      }));
    } else if (filterType === "airline") {
      setFilters((prev) => ({
        ...prev,
        airlines: prev.airlines.includes(value)
          ? prev.airlines.filter((a) => a !== value)
          : [...prev.airlines, value],
      }));
    } else {
      setFilters((prev) => ({ ...prev, [filterType]: value }));
    }
  };

  const handleBookNow = (group) => {
    navigate("/dashboard/booking", { state: { groupData: group } });
  };

  useEffect(() => {
    applyFilters();
  }, [filters, allGroups]);

  const LoadingSkeleton = () => (
    <div className="space-y-6 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 rounded-2xl bg-gray-200 mb-4 w-full" />
          <div className="h-16 bg-gray-100 rounded-xl mb-2 w-48 mx-auto" />
          {[1, 2].map((j) => (
            <div key={j} className="h-24 bg-gray-100 rounded-2xl mb-3" />
          ))}
        </div>
      ))}
    </div>
  );

  const groupedData = groups.reduce((acc, group) => {
    const key = `${group.airline?.airline_name || "Unknown"}-${group.sector || "Unknown"}`;
    if (!acc[key]) {
      acc[key] = {
        airline: group.airline?.airline_name || "Unknown",
        airlineLogo: group.airline?.logo_url || null,
        sector: group.sector || "Unknown",
        groups: [],
      };
    }
    acc[key].groups.push(group);
    return acc;
  }, {});

  // Shared Filter UI Component for Sidebar and Mobile Drawer
  const FilterContent = () => (
    <>
      <h3
        className="font-semibold text-lg mb-4"
        style={{ color: theme.colors.textPrimary }}
      >
        Airlines
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {airlines.map((airline) => (
          <label
            key={airline}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition"
          >
            <input
              type="checkbox"
              checked={filters.airlines.includes(airline)}
              onChange={() => handleFilterChange("airline", airline)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">{airline}</span>
          </label>
        ))}
      </div>
      <div className="h-px bg-gray-200 my-6" />
      <h3
        className="font-semibold text-lg mb-4"
        style={{ color: theme.colors.textPrimary }}
      >
        Sectors
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {sectors.map((sector) => (
          <label
            key={sector}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition"
          >
            <input
              type="checkbox"
              checked={filters.sectors.includes(sector)}
              onChange={() => handleFilterChange("sector", sector)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">{sector}</span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <>
      <TopBar title={"All Groups Tickets"} />
      <div
        className="w-full min-h-screen"
        style={{ background: theme.colors.background }}
      >
        {/* Responsive Header Container */}
        <div
          className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 p-4 md:p-5 bg-white border-b shadow-sm ${headerType === "dashboard" ? "rounded-t-3xl" : ""}`}
        >
          <div className="w-full xl:w-auto">{header}</div>

          <div className="flex flex-col lg:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
              {/* Advanced Search Toggle */}
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showAdvancedSearch}
                    onChange={(e) => setShowAdvancedSearch(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-11 h-6 rounded-full transition-all"
                    style={{
                      background: showAdvancedSearch
                        ? theme.colors.ublGradient
                        : "#d1d5db",
                    }}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${showAdvancedSearch ? "translate-x-5" : ""}`}
                    />
                  </div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                  Advanced Search
                </span>
              </label>

              {/* Mobile Filter Button (Visible only on small screens when Advanced Search is on) */}
              {showAdvancedSearch && (
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-gray-100 text-gray-700"
                >
                  <Menu size={20} />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-48">
                <MaskedDatePicker
                  value={filters.departDate}
                  onChange={(date) => handleFilterChange("departDate", date)}
                  placeholderText="Departure Date"
                  minDate={new Date()}
                />
              </div>
              <div className="flex-1 lg:w-64 relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.searchKeyword}
                  onChange={(e) =>
                    handleFilterChange("searchKeyword", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 text-sm"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-xl animate-in slide-in-from-right">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X />
                </button>
              </div>
              <FilterContent />
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-5">
          {/* Desktop Sidebar */}
          {showAdvancedSearch && (
            <div className="hidden lg:block w-72 shrink-0">
              <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-6">
                <FilterContent />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-6 overflow-hidden">
            {loading ? (
              <div className="bg-white rounded-3xl shadow-sm p-4">
                <LoadingSkeleton />
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm p-10 md:p-20 text-center text-gray-400">
                No groups available at the moment
              </div>
            ) : (
              Object.entries(groupedData).map(([key, data]) => {
                const sectorParts = data.sector?.split("-") || [];
                const origin = sectorParts[0] || "";
                const destination = sectorParts[1] || data.sector;

                return (
                  <div
                    key={key}
                    className="rounded-2xl overflow-hidden shadow-md bg-white"
                  >
                    {/* Sector Header Bar */}
                    <div
                      className="flex items-center justify-center gap-4 px-4 py-3 md:py-4"
                      style={{ background: theme.colors.primary }}
                    >
                      <i className="fa-solid fa-plane-departure text-white text-lg md:text-2xl"></i>
                      <span className="text-white font-bold text-lg md:text-2xl tracking-widest uppercase">
                        {data.sector}
                      </span>
                      <i className="fa-solid fa-plane-arrival text-white text-lg md:text-2xl"></i>
                    </div>

                    {/* Airline Logo Area */}
                    <div className="bg-white flex items-center justify-center py-4 border-b border-gray-100">
                      {data.airlineLogo ? (
                        <img
                          style={{ height: "50px" }}
                          src={data.airlineLogo}
                          alt={data.airline}
                          className="h-10 md:h-14 object-contain"
                        />
                      ) : (
                        <span
                          className="font-semibold text-lg"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {data.airline}
                        </span>
                      )}
                    </div>

                    {/* Flight Cards */}
                    <div className="bg-gray-50 p-2 md:p-4 space-y-4">
                      {data.groups
                        .sort(
                          (a, b) =>
                            new Date(a.dept_date) - new Date(b.dept_date),
                        )
                        .map((group) => {
                          const flight = group.details?.[0];

                          return (
                            <div
                              key={group.id}
                              className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                              {/* Main Card Content: Stack on mobile, Row on Tablet/Desktop */}
                              <div className="flex flex-col lg:flex-row items-center p-4 md:p-6 lg:px-8 gap-6 lg:gap-8">
                                {/* Left: Date & Flight Info */}
                                <div className="w-full lg:w-auto flex lg:flex-col items-center lg:items-start justify-between lg:justify-center border-b lg:border-b-0 pb-4 lg:pb-0 border-gray-100">
                                  <div className="text-sm font-medium text-gray-500">
                                    {flight
                                      ? new Date(
                                          flight.flight_date,
                                        ).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "—"}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <FaPlane
                                      className="text-lg"
                                      style={{
                                        color: theme.colors.ublGradientStart,
                                      }}
                                    />
                                    <span className="font-semibold text-lg md:text-xl">
                                      {flight?.flight_no || "SV-725"}
                                    </span>
                                  </div>
                                </div>

                                {/* Center: Route Path */}
                                <div className="flex-1 flex items-center justify-center w-full gap-6 md:gap-8 px-2 md:px-0">
                                  <div className="text-center">
                                    <div className="text-xl md:text-2xl font-bold">
                                      {origin}
                                    </div>
                                    <div className="text-sm md:text-base text-gray-500 font-medium">
                                      {flight?.dept_time?.substring(0, 5) ||
                                        "09:50"}
                                    </div>
                                  </div>

                                  <div className="flex items-center flex-1 relative min-w-[60px] max-w-[200px]">
                                    <div
                                      className="h-0.5 w-full"
                                      style={{
                                        background: theme.colors.ublGradient,
                                      }}
                                    />
                                    <div className="absolute left-1/2 -translate-x-1/2 bg-white px-1">
                                      <FaPlane
                                        className="text-lg md:text-2xl"
                                        style={{
                                          color: theme.colors.ublGradientStart,
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-xl md:text-2xl font-bold">
                                      {destination}
                                    </div>
                                    <div className="text-sm md:text-base text-gray-500 font-medium">
                                      {flight?.arv_time?.substring(0, 5) ||
                                        "12:05"}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Features, Price & Button */}
                                <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-row items-center gap-4 lg:gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                                  {/* Baggage/Meal */}
                                  <div className="flex items-center gap-2">
                                    {flight?.baggage && (
                                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-xs font-medium">
                                        <FaSuitcase
                                          style={{
                                            color:
                                              theme.colors.ublGradientStart,
                                          }}
                                        />
                                        <span>{flight.baggage}KG</span>
                                      </div>
                                    )}
                                    {flight?.meal && flight.meal !== "No" && (
                                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-xs font-medium">
                                        <FaUtensils
                                          style={{
                                            color:
                                              theme.colors.ublGradientStart,
                                          }}
                                        />
                                        <span>Meal</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Pricing */}
                                  <div className="text-center sm:text-right min-w-[100px]">
                                    <div className="text-[10px] text-gray-500 uppercase">
                                      Adult
                                    </div>
                                    <div
                                      className="text-2xl font-bold"
                                      style={{
                                        color: theme.colors.ublGradientStart,
                                      }}
                                    >
                                      {user?.priceOnCall
                                        ? "On Call"
                                        : group.price?.toLocaleString()}
                                    </div>
                                    {!user?.priceOnCall && (
                                      <div className="text-[10px] text-gray-400">
                                        PKR
                                      </div>
                                    )}
                                  </div>

                                  {/* Action */}
                                  <button
                                    onClick={() => handleBookNow(group)}
                                    disabled={!user?.showHideButton}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 md:px-8 md:py-5 font-semibold transition-all shadow-sm hover:shadow active:scale-95"
                                    style={{
                                      borderRadius: "12px",
                                      background: user?.showHideButton
                                        ? theme.colors.ublGradient
                                        : "#e5e7eb",
                                      color: user?.showHideButton
                                        ? "white"
                                        : "#9ca3af",
                                      cursor: user?.showHideButton
                                        ? "pointer"
                                        : "not-allowed",
                                    }}
                                  >
                                    <Ticket size={20} />
                                    <span>Book Now</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
