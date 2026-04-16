import React, { useEffect, useState } from "react";
import { Ticket, Menu, X } from "lucide-react";
import {
    FaPlane,
    FaSuitcase,
    FaUtensils,
    FaSearch,
    FaPlaneDeparture,
    FaPlaneArrival,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { toast } from "react-toastify";
import MaskedDatePicker from "../../../components/MaskedDatePicker";
import { theme } from "../../../theme/theme";
import TopBar from "../../../components/TopBar/TopBar";
import { groupTypes } from "../../../data/groupTypes";

export default function AllGroups({ headerType, header, searchParams, user }) {
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [dbMargin, setDbMargin] = useState(null);

    // Extract "YYYY-MM-DD" from any date value (ISO datetime or date-only string)
    const toDateOnly = (dateVal) => {
        if (!dateVal) return "";
        return String(dateVal).slice(0, 10);
    };

    // Normalize our own GroupTicketing records to match the Sabaoon group shape
    const normalizeOwnGroup = (group, airlineLogoMap = {}) => {
        const firstFlight = group.flights?.[0] || {};
        const lastFlight = group.flights?.[group.flights.length - 1] || {};

        const sectorFrom = (firstFlight.sectorFrom || "").toUpperCase().trim();
        const sectorTo = (lastFlight.sectorTo || "").toUpperCase().trim();
        const sector =
            sectorFrom && sectorTo
                ? `${sectorFrom}-${sectorTo}`
                : (group.sector || "").toUpperCase().trim();

        const airlineName = (group.airline || "").trim();
        const logoUrl = airlineLogoMap[airlineName] || null;

        return {
            id: group._id,
            isOwnGroup: true,
            groupName: group.groupName || "",
            airline: {
                airline_name: airlineName,
                logo_url: logoUrl,
            },
            sector,
            price: group.price?.sellingAdultPriceB2B || 0,
            childPrice: group.price?.sellingChildPriceB2B || 0,
            infantPrice: group.price?.sellingInfantPriceB2B || 0,
            pnr: group.pnr || "",
            type: group.groupType,
            available_no_of_pax: group.totalSeats || 0,
            showSeat: group.showSeat,
            // Use date-only string to match Sabaoon format and avoid timezone issues
            dept_date: toDateOnly(firstFlight.depDate),
            arv_date: toDateOnly(lastFlight.arrDate),
            details: (group.flights || []).map((f) => ({
                flight_no: f.flightNo,
                flight_date: toDateOnly(f.depDate),
                dep_date: toDateOnly(f.depDate),
                dept_time: f.depTime,
                arv_date: toDateOnly(f.arrDate),
                arv_time: f.arrTime,
                origin: (f.sectorFrom || "").toUpperCase().trim(),
                destination: (f.sectorTo || "").toUpperCase().trim(),
                baggage: f.baggage,
                meal: f.meal,
            })),
        };
    };

    const [filters, setFilters] = useState({
        sectors: [],
        airlines: [],
        searchKeyword: "",
        departDate: null,
    });

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [airlines, setAirlines] = useState([]);
    const [sectors, setSectors] = useState([]);

    // Fetch margin from database
    const fetchMargin = async () => {
        try {
            const response = await axiosInstance.get("/sector/getMargin");
            if (response.data.success) {
                setDbMargin(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching margin:", err);
        }
    };

    const calculateB2BPrice = (groupPrice, group = {}) => {
        if (!user) return groupPrice; // B2C case (handled separately)

        // If user has priceOnCall flag, return "Price on Call"
        if (user.priceOnCall) return null;

        // Priority 0: Individual group margin (admin-set per Sabaoon group).
        // When set, this fixed PKR amount is the ONLY margin applied — agent and
        // global margins are completely ignored for this group.
        const indMargin = group?.individualMargin;
        if (indMargin !== null && indMargin !== undefined) {
            return Math.round(groupPrice + indMargin).toLocaleString();
        }

        let finalPrice = groupPrice;

        // Priority 1: Use user-specific margin if available
        const marginType = user.marginType; // "Percentage" or "Amount"
        const marginPercent = user.flightMarginPercent;
        const marginAmount = user.flightMarginAmount;

        if (marginType === "Percentage" && marginPercent > 0) {
            // Add percentage margin
            const marginValue = (groupPrice * marginPercent) / 100;
            finalPrice = groupPrice + marginValue;
        } else if (marginType === "Amount" && marginAmount > 0) {
            // Add fixed amount margin
            finalPrice = groupPrice + marginAmount;
        }

        // Priority 2: Fallback to database margin if user margin not set
        if (finalPrice === groupPrice && dbMargin) {
            if (dbMargin.type === "percent" && dbMargin.value > 0) {
                // value is already in percentage (e.g., 100 = 100%)
                const marginValue = (groupPrice * dbMargin.value) / 100;
                finalPrice = groupPrice + marginValue;
            } else if (dbMargin.type === "amount" && dbMargin.value > 0) {
                // Add fixed amount margin
                finalPrice = groupPrice + dbMargin.value;
            }
        }

        return Math.round(finalPrice).toLocaleString(); // Round to nearest integer
    };

    useEffect(() => {
        fetchMargin(); // Fetch margin on component mount
        fetchGroups();
    }, [searchParams]);

    const fetchGroups = async () => {
        try {
            setLoading(true);

            const groupType = searchParams.get("group_type") || "";
            const params = {};
            if (groupType) params.type = groupType;

            // Map Sabaoon group_type value to our own MongoDB groupType enum value
            const ownGroupType = groupType
                ? (groupTypes.find((g) => g.value === groupType)?.ownGroupType || "")
                : "";
            const ownParams = {};
            if (ownGroupType) ownParams.groupType = ownGroupType;

            // Fetch Sabaoon groups, own groups, and airlines in parallel
            const [sabaoonRes, ownRes, airlinesRes] = await Promise.allSettled([
                axiosInstance.get("/sabaoon/groups", { params }),
                axiosInstance.get("/group-ticketing/public", { params: ownParams }),
                axiosInstance.get("/airline"),
            ]);

            const sabaoonGroups =
                sabaoonRes.status === "fulfilled" && sabaoonRes.value.data?.success
                    ? sabaoonRes.value.data.data || []
                    : [];

            // Build airline name → logo_url map from our own airline records
            const airlineLogoMap = {};
            if (airlinesRes.status === "fulfilled" && airlinesRes.value.data?.success) {
                for (const airline of airlinesRes.value.data.data || []) {
                    if (airline.airlineName && airline.logo) {
                        airlineLogoMap[airline.airlineName.trim()] = airline.logo;
                    }
                }
            }

            const ownGroupsRaw =
                ownRes.status === "fulfilled" && ownRes.value.data?.success
                    ? ownRes.value.data.data || []
                    : [];

            const ownGroups = ownGroupsRaw.map((g) => normalizeOwnGroup(g, airlineLogoMap));

            const fetchedGroups = [...sabaoonGroups, ...ownGroups];

            const uniqueAirlines = [
                ...new Set(
                    fetchedGroups.map((g) => g.airline?.airline_name).filter(Boolean),
                ),
            ];
            const uniqueSectors = [
                ...new Set(
                    fetchedGroups
                        .map((g) => (g.sector || "").toUpperCase().trim())
                        .filter(Boolean),
                ),
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
            filtered = filtered.filter((g) =>
                filters.sectors.includes((g.sector || "").toUpperCase().trim()),
            );
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
                const matchesGroupName = g.groupName?.toLowerCase().includes(keyword);
                const matchesFlightNo = g.details?.some((flight) =>
                    flight.flight_no?.toLowerCase().includes(keyword),
                );
                const matchesPnr = g.pnr?.toLowerCase().includes(keyword);
                return matchesSector || matchesAirline || matchesGroupName || matchesFlightNo || matchesPnr;
            });
        }
        if (filters.departDate) {
            // Parse the selected date in local time to avoid timezone shifts
            const sd = filters.departDate instanceof Date
                ? filters.departDate
                : new Date(filters.departDate);
            const selYear = sd.getFullYear();
            const selMonth = sd.getMonth();
            const selDay = sd.getDate();

            filtered = filtered.filter((g) => {
                if (!g.dept_date) return false;
                // dept_date is always "YYYY-MM-DD" after normalization
                const [y, m, d] = String(g.dept_date).slice(0, 10).split("-").map(Number);
                return y === selYear && (m - 1) === selMonth && d === selDay;
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
        const airlineName = group.airline?.airline_name || "Unknown";
        const sector = (group.sector || "Unknown").toUpperCase().trim();
        const key = `${airlineName}-${sector}`;
        if (!acc[key]) {
            acc[key] = {
                airline: airlineName,
                airlineLogo: group.airline?.logo_url || null,
                sector,
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
            <TopBar title={"All Group Tickets"} />
            <div
                className="w-full min-h-screen"
                style={{ background: theme.colors.background }}
            >
                {/* Responsive Header Container */}
                <div
                    className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 px-3 py-2 bg-white border-b border-b-neutral-200 shadow-sm ${headerType === "dashboard" ? "rounded-t-2xl" : ""}`}
                >
                    <div className="w-full xl:w-auto">{header}</div>

                    <div className="flex flex-col lg:flex-row items-center gap-2 w-full xl:w-auto">
                        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
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
                                        className="w-9 h-5 rounded-full transition-all"
                                        style={{
                                            background: showAdvancedSearch
                                                ? theme.colors.ublGradient
                                                : "#d1d5db",
                                        }}
                                    >
                                        <div
                                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${showAdvancedSearch ? "translate-x-4" : ""}`}
                                        />
                                    </div>
                                </div>
                                <span className="ml-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                                    Advanced Search
                                </span>
                            </label>

                            {showAdvancedSearch && (
                                <button
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="lg:hidden p-1.5 rounded-lg bg-gray-100 text-gray-700"
                                >
                                    <Menu size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <div className="w-full sm:w-48">
                                <MaskedDatePicker
                                    value={filters.departDate}
                                    onChange={(date) => handleFilterChange("departDate", date)}
                                    placeholderText="Departure Date"
                                    minDate={new Date()}
                                    size="small"
                                />
                            </div>
                            <div className="flex-1 lg:w-52 relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={filters.searchKeyword}
                                    onChange={(e) =>
                                        handleFilterChange("searchKeyword", e.target.value)
                                    }
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-xs"
                                />
                                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
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

                <div className="flex flex-col lg:flex-row gap-4 pt-3 pb-6">
                    {/* Desktop Sidebar */}
                    {showAdvancedSearch && (
                        <div className="hidden lg:block w-56 shrink-0">
                            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-6">
                                <FilterContent />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 space-y-3 overflow-hidden">
                        {loading ? (
                            <div className="bg-white rounded-3xl shadow-sm p-4">
                                <LoadingSkeleton />
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
                                No groups available at the moment
                            </div>
                        ) : (
                            Object.entries(groupedData).map(([key, data]) => {
                                const sectorParts = data.sector?.split("-") || [];
                                const origin = sectorParts[0] || "";
                                const destination = sectorParts[sectorParts.length - 1] || data.sector;

                                return (
                                    <div
                                        key={key}
                                        className="rounded-2xl overflow-hidden bg-white"
                                    >
                                        {/* Sector Header Bar */}
                                        <div className="bg-linear-to-r from-blue-50 via-transparent to-blue-50 flex justify-center items-center gap-6 py-2.5 border-b border-neutral-200">
                                            {/* Airline Logo Area */}
                                            <div className="bg-white flex items-center justify-center border-b border-neutral-100">
                                                {data.airlineLogo ? (
                                                    <img
                                                        style={{ height: "56px" }}
                                                        src={data.airlineLogo}
                                                        alt={data.airline}
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <span
                                                        className="font-semibold text-sm"
                                                        style={{ color: theme.colors.textPrimary }}
                                                    >
                                                        {data.airline}
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                className="flex items-center justify-center gap-4 px-4 py-4"
                                            >
                                                <FaPlaneDeparture className="text-lg" />
                                                <span className="font-bold text-lg tracking-widest uppercase">
                                                    {data.sector}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Flight Cards */}
                                        <div className="bg-gray-50 py-3">
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
                                                            className="bg-white border border-neutral-100 overflow-hidden"
                                                        >
                                                            {/* Main Card Content: Stack on mobile, Row on Tablet/Desktop */}
                                                            <div className="flex flex-col lg:flex-row items-center p-2 px-3 lg:px-5 gap-4 lg:gap-6">
                                                                {/* Left: Date & Flight Info */}
                                                                <div className="w-full lg:w-auto flex lg:flex-col items-center lg:items-start justify-between lg:justify-center border-b lg:border-b-0 pb-3 lg:pb-0 border-gray-100">
                                                                    <div className="text-xs font-medium text-gray-500">
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
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <FaPlane
                                                                            className="text-sm"
                                                                            style={{
                                                                                color: theme.colors.ublGradientStart,
                                                                            }}
                                                                        />
                                                                        <span className="font-semibold text-sm">
                                                                            {flight?.flight_no || "—"}
                                                                        </span>
                                                                    </div>
                                                                    {/* {group.isOwnGroup && (
                                    <div className="mt-1 flex flex-col gap-0.5">
                                      <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700">
                                        Direct
                                      </span>
                                      {group.groupName && (
                                        <span className="text-[10px] text-gray-400 max-w-20 truncate">
                                          {group.groupName}
                                        </span>
                                      )}
                                    </div>
                                  )} */}
                                                                </div>

                                                                {/* Center: Route Path */}
                                                                <div className="flex-1 flex items-center justify-center w-full gap-4 px-1">
                                                                    <div className="text-center">
                                                                        <div className="text-lg font-bold">
                                                                            {origin}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 font-medium">
                                                                            {flight?.dept_time?.substring(0, 5) ||
                                                                                "09:50"}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center flex-1 relative min-w-10 max-w-36">
                                                                        <div
                                                                            className="h-0.5 w-full"
                                                                            style={{
                                                                                background: theme.colors.ublGradient,
                                                                            }}
                                                                        />
                                                                        <div className="absolute left-1/2 -translate-x-1/2 bg-white px-1">
                                                                            <FaPlane
                                                                                className="text-base"
                                                                                style={{
                                                                                    color: theme.colors.ublGradientStart,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-center">
                                                                        <div className="text-lg font-bold">
                                                                            {destination}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 font-medium">
                                                                            {(group.details?.[group.details.length - 1]?.arv_time || flight?.arv_time)?.substring(0, 5) ||
                                                                                "12:05"}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Right: Features, Price & Button */}
                                                                <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-row items-center gap-3 lg:gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                                                                    {/* Baggage/Meal */}
                                                                    <div className="flex items-center gap-1.5">
                                                                        {flight?.baggage && (
                                                                            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs font-medium">
                                                                                <FaSuitcase
                                                                                    className="text-xs"
                                                                                    style={{
                                                                                        color:
                                                                                            theme.colors.ublGradientStart,
                                                                                    }}
                                                                                />
                                                                                <span>{flight.baggage}KG</span>
                                                                            </div>
                                                                        )}
                                                                        {flight?.meal && flight.meal !== "No" && (
                                                                            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs font-medium">
                                                                                <FaUtensils
                                                                                    className="text-xs"
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
                                                                    <div className="text-center sm:text-right min-w-20">
                                                                        <div className="text-[9px] text-gray-500 uppercase">
                                                                            Adult
                                                                        </div>
                                                                        <div
                                                                            className="text-lg font-bold"
                                                                            style={{
                                                                                color: theme.colors.ublGradientStart,
                                                                            }}
                                                                        >
                                                                            {user?.priceOnCall
                                                                                ? "On Call"
                                                                                : calculateB2BPrice(group.price, group)}
                                                                        </div>
                                                                        {!user?.priceOnCall && (
                                                                            <div className="text-[9px] text-gray-400">
                                                                                PKR
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Action */}
                                                                    <button
                                                                        onClick={() => handleBookNow(group)}
                                                                        disabled={!user?.showHideButton}
                                                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-95"
                                                                        style={{
                                                                            borderRadius: "10px",
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
                                                                        <Ticket size={15} />
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