import PageMeta from "../../components/common/PageMeta";
import { ArrowRightIcon, UsersIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import AgentStatusChart from "../../components/charts/AgentStatusChart";
import { useEffect, useState } from "react";
import axiosInstance from "../../Api/axios";
import { Modal } from "../../components/ui/modal";


interface FlightDetail {
  dep_date?: string;
  flight_date?: string;
  flight_no?: string;
  flightNo?: string;
  origin?: string;
  from?: string;
  destination?: string;
  to?: string;
  dept_time?: string;
  dep_time?: string;
  depTime?: string;
  arv_time?: string;
  arr_time?: string;
  arrTime?: string;
}

interface UnifiedGroup {
  id: string;
  source: string;
  sector: string;
  type: string;
  available_no_of_pax: number;
  price: number;
  dept_date: string;
  airline: {
    airline_name: string;
    short_name: string;
    logo_url: string | null;
  };
  pnr: string;
  details?: FlightDetail[];
}

interface CopyTextEntry {
  group: UnifiedGroup;
  date: Date;
  price: number;
  line: string;
}

const MONTHS_TITLE = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function trimTime(t: string): string {
  if (!t) return "";
  return t.slice(0, 5);
}

function extractIATA(terminal: string): string {
  if (!terminal) return "";
  const match = terminal.match(/\(([A-Z]{3})\)/);
  return match ? match[1] : terminal.trim();
}

function buildCopyText(groups: UnifiedGroup[]): string {
  if (!groups.length) return "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const header = `*===== ${String(today.getDate()).padStart(2, "0")} ${MONTHS_TITLE[today.getMonth()].toUpperCase()} UPDATES =====*`;

  // ── Step A: Build sector-grouped map (preserving API sector order) ──
  const sectorMap = new Map<string, CopyTextEntry[]>();
  const sectorOrder: string[] = [];

  groups.forEach((g: UnifiedGroup) => {
    if (g.available_no_of_pax !== undefined && g.available_no_of_pax <= 0) return;

    const sector = g.sector || "UNKNOWN";
    const price = g.price || 0;

    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
      sectorOrder.push(sector);
    }

    if (g.details && g.details.length > 0) {
      const d = g.details[0];
      const rawDate = d.dep_date || d.flight_date || g.dept_date;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return;

      const depDay = new Date(date);
      depDay.setHours(0, 0, 0, 0);
      if (depDay < today) return;

      const dd = String(date.getDate()).padStart(2, "0");
      const mon = MONTHS_TITLE[date.getMonth()];
      const flightNo = (d.flight_no || d.flightNo || "").toUpperCase();
      const origin = extractIATA(d.origin || d.from || "");
      const dest = extractIATA(d.destination || d.to || "");
      const depTime = trimTime(d.dept_time || d.dep_time || d.depTime || "");
      const arvTime = trimTime(d.arv_time || d.arr_time || d.arrTime || "");
      const formattedDate = `${dd}${mon.toUpperCase()}`;
      const cleanDepTime = depTime.replace(":", "");
      const cleanArrTime = arvTime.replace(":", "");

      const line = `${flightNo} *${formattedDate}* ${origin} ${cleanDepTime} ${dest} ${cleanArrTime} *PKR ${price}*`;

      sectorMap.get(sector)!.push({ group: g, date, price, line });

    } else {
      // Fallback: no details
      const rawDate = g.dept_date;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return;

      const depDay = new Date(date);
      depDay.setHours(0, 0, 0, 0);
      if (depDay < today) return;

      const dd = String(date.getDate()).padStart(2, "0");
      const mon = MONTHS_TITLE[date.getMonth()];
      const code = g.airline?.short_name || "";
      const formattedDate = `${dd}${mon.toUpperCase()}`;
      const sec = (g.sector || "").replace("-", " ");

      const line = `${code} *${formattedDate}* ${sec}..... *PKR ${price}*`;

      sectorMap.get(sector)!.push({ group: g, date, price, line });
    }
  });

  // ── Step B: Sort each sector's entries by date → then price ──
  sectorMap.forEach((entries: CopyTextEntry[]) => {
    entries.sort((a: CopyTextEntry, b: CopyTextEntry) => {
      const timeDiff = a.date.getTime() - b.date.getTime();
      if (timeDiff !== 0) return timeDiff;   // earlier date first
      return a.price - b.price;              // same date → cheaper first
    });
  });

  // ── Step C: Build final output in sector order ──
  const lines: string[] = [];
  sectorOrder.forEach((sector: string) => {
    const entries = sectorMap.get(sector)!;
    entries.forEach((e: CopyTextEntry) => lines.push(e.line));
  });

  const footer =
    `*ALL GROUPS ARE NON REFUNDABLE AND NON CHANGEABLE*

=======================

World Fly Travel & Tours

Mobile: 0314-5266660
Address: Shop No 03 G Floor G 13 Services Road G 12 Islamabad.
Ptcl: 051-2154600
Website: worldflytickets.com`;

  return [header, ...lines, "=======================", footer].join("\n\n");
}

function buildSectorCopyText(groups: UnifiedGroup[], sectorFilter: string): string {
  if (!groups.length) return "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const header = `*===== ${String(today.getDate()).padStart(2, "0")} ${MONTHS_TITLE[today.getMonth()].toUpperCase()} UPDATES =====*`;

  const lines: Array<{ date: Date; price: number; line: string }> = [];

  groups.forEach((g: UnifiedGroup) => {
    // Filter only by the specified sector
    if ((g.sector || "UNKNOWN") !== sectorFilter) return;

    if (g.available_no_of_pax !== undefined && g.available_no_of_pax <= 0) return;

    const price = g.price || 0;

    if (g.details && g.details.length > 0) {
      const d = g.details[0];
      const rawDate = d.dep_date || d.flight_date || g.dept_date;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return;

      const depDay = new Date(date);
      depDay.setHours(0, 0, 0, 0);
      if (depDay < today) return;

      const dd = String(date.getDate()).padStart(2, "0");
      const mon = MONTHS_TITLE[date.getMonth()];
      const flightNo = (d.flight_no || d.flightNo || "").toUpperCase();
      const origin = extractIATA(d.origin || d.from || "");
      const dest = extractIATA(d.destination || d.to || "");
      const depTime = trimTime(d.dept_time || d.dep_time || d.depTime || "");
      const arvTime = trimTime(d.arv_time || d.arr_time || d.arrTime || "");
      const formattedDate = `${dd}${mon.toUpperCase()}`;
      const cleanDepTime = depTime.replace(":", "");
      const cleanArrTime = arvTime.replace(":", "");

      const line = `${flightNo} *${formattedDate}* ${origin} ${cleanDepTime} ${dest} ${cleanArrTime} *PKR ${price}*`;
      lines.push({ date, price, line });

    } else {
      // Fallback: no details
      const rawDate = g.dept_date;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return;

      const depDay = new Date(date);
      depDay.setHours(0, 0, 0, 0);
      if (depDay < today) return;

      const dd = String(date.getDate()).padStart(2, "0");
      const mon = MONTHS_TITLE[date.getMonth()];
      const code = g.airline?.short_name || "";
      const formattedDate = `${dd}${mon.toUpperCase()}`;
      const sec = (g.sector || "").replace("-", " ");

      const line = `${code} *${formattedDate}* ${sec}..... *PKR ${price}*`;
      lines.push({ date, price, line });
    }
  });

  // Sort by date then price
  lines.sort((a, b) => {
    const timeDiff = a.date.getTime() - b.date.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.price - b.price;
  });

  const footer =
    `*ALL GROUPS ARE NON REFUNDABLE AND NON CHANGEABLE*

=======================

World Fly Travel & Tours

Mobile: 0314-5266660
Address: Shop No 03 G Floor G 13 Services Road G 12 Islamabad.
Ptcl: 051-2154600
Website: worldflytickets.com`;

  return [header, ...lines.map(l => l.line), "=======================", footer].join("\n\n");
}

export default function Home() {
  const navigate = useNavigate()
  const [unifiedGroups, setUnifiedGroups] = useState<UnifiedGroup[]>([]);
  const [copied, setCopied] = useState(false);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [marginValue, setMarginValue] = useState("");
  const [marginType, setMarginType] = useState<"percent" | "amount">("percent");
  const [isApplyingMargin, setIsApplyingMargin] = useState(false);
  const [currentMargin, setCurrentMargin] = useState<{ value: number; type: "percent" | "amount" } | null>(null);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [copiedSector, setCopiedSector] = useState<string | null>(null);

  const fetchUnifiedGroups = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/sector/getUnifiedGroups");
      if (response.data.success && Array.isArray(response.data.data)) {
        setUnifiedGroups(response.data.data);
      } else {
        console.warn("Data format matches but array not found or success is false");
      }
    } catch (error: unknown) {
      console.error("Error fetching unified groups:", error);
    }
  };

  const fetchMargin = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get("/sector/getMargin");
      if (response.data.success) {
        setCurrentMargin({
          value: response.data.data.value,
          type: response.data.data.type,
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching margin:", error);
    }
  };

  const handleCopyData = async (): Promise<void> => {
    const text = buildCopyText(unifiedGroups);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopySpecificSectorData = async (sector: string): Promise<void> => {
    const text = buildSectorCopyText(unifiedGroups, sector);
    if (!text) {
      alert("No data available for this sector");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSector(sector);
      setTimeout(() => setCopiedSector(null), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedSector(sector);
      setTimeout(() => setCopiedSector(null), 2500);
    }
  };

  // Get unique sectors from unified groups
  const getAvailableSectors = (): string[] => {
    const sectorSet = new Set<string>();
    unifiedGroups.forEach((g) => {
      if (g.sector && g.available_no_of_pax !== undefined && g.available_no_of_pax > 0) {
        sectorSet.add(g.sector);
      }
    });
    return Array.from(sectorSet).sort();
  };

  const handleApplyMargin = async (): Promise<void> => {
    if (!marginValue || marginValue === "0") {
      alert("Please enter a valid margin value");
      return;
    }

    setIsApplyingMargin(true);
    try {
      const payload = {
        value: parseFloat(marginValue),
        type: marginType,
      };

      const response = await axiosInstance.post("/sector/applyMargin", payload);

      if (response.data.success) {
        alert(`Margin saved: ${marginValue} ${marginType === "percent" ? "%" : "Rs"}`);
        setIsMarginModalOpen(false);
        setMarginValue("");
        setMarginType("percent");
        // Fetch updated margin
        fetchMargin();
      } else {
        alert(response.data.message || "Failed to save margin");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error saving margin";
      alert(errorMessage);
      console.error("Error saving margin:", error);
    } finally {
      setIsApplyingMargin(false);
    }
  };

  useEffect(() => {
    fetchUnifiedGroups();
    fetchMargin();
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard | World Fly Ticket Travel"
        description="Dashboard overview for World Fly Ticket Travel"
      />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-white">Dashboard</h1>
          <div className="text-sm text-gray-500">
            <span className="text-blue-600">Home</span> / Profile
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-3 gap-3">
        <button
          onClick={handleCopyData}
          disabled={unifiedGroups.length === 0}
          title={unifiedGroups.length === 0 ? "No data available to copy" : "Copy flight data"}
          style={{
            backgroundColor: unifiedGroups.length === 0 ? '#d1d5db' : copied ? '#22c55e' : '#3b82f6',
            color: 'white',
            opacity: unifiedGroups.length === 0 ? 0.6 : 1
          }}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy All Data ({unifiedGroups.length})
            </>
          )}
        </button>

        <button
          onClick={() => setShowSectorModal(true)}
          disabled={unifiedGroups.length === 0}
          title={unifiedGroups.length === 0 ? "No data available" : "Copy specific sector data"}
          style={{
            backgroundColor: unifiedGroups.length === 0 ? '#d1d5db' : '#8b5cf6',
            color: 'white',
            opacity: unifiedGroups.length === 0 ? 0.6 : 1
          }}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Copy Specific Data
        </button>

        <button
          onClick={() => setIsMarginModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer bg-purple-600 hover:bg-purple-700 text-white"
          title="Apply margin to all groups"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Apply Margin
        </button>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
        {/* Agents Card */}
        <div className="bg-linear-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 rounded-lg p-6 text-white relative shadow-lg">
          <div className="absolute top-6 right-6 opacity-20">
            <UsersIcon className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Agents</h3>
          <p className="text-teal-100 mb-4 text-sm">My Agents</p>
          <Link to="/registered-agencies" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition-colors">
            Go to list <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Index Cards */}
        <div className="bg-linear-to-br from-slate-500 to-blue-600 dark:from-slate-600 dark:to-blue-700 rounded-lg p-6 text-white relative shadow-lg">
          <div className="absolute top-6 right-6 opacity-20">
            <IdentificationIcon className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Index Cards</h3>
          <p className="text-slate-100 mb-4 text-sm">Index Cards</p>
          <button onClick={() => { navigate("/special-offers") }} className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition-colors">
            Go to list <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agent Status Chart */}
      <div className="mb-6">
        <AgentStatusChart />
      </div>

      {/* View Sections */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <button className="bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg text-lg">
          View All Groups
        </button>
      </div>

      {/* Apply Margin Modal */}
      <Modal
        isOpen={isMarginModalOpen}
        onClose={() => {
          setIsMarginModalOpen(false);
          setMarginValue("");
          setMarginType("percent");
        }}
        className="max-w-md"
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Apply Margin</h2>

          {/* Current Margin Info */}
          {currentMargin && currentMargin.value > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6">
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                <strong>Current Margin:</strong> {currentMargin.value} {currentMargin.type === "percent" ? "%" : "Rs"}
              </p>
            </div>
          )}

          <div className="space-y-5">
            {/* Margin Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Margin Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="marginType"
                    value="percent"
                    checked={marginType === "percent"}
                    onChange={(e) => setMarginType(e.target.value as "percent" | "amount")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Percentage (%)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="marginType"
                    value="amount"
                    checked={marginType === "amount"}
                    onChange={(e) => setMarginType(e.target.value as "percent" | "amount")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Fixed Amount (Rs)</span>
                </label>
              </div>
            </div>

            {/* Margin Value Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Margin Value
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={marginValue}
                  onChange={(e) => setMarginValue(e.target.value)}
                  placeholder={marginType === "percent" ? "Enter percentage (e.g., 5)" : "Enter amount (e.g., 500)"}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">
                  {marginType === "percent" ? "%" : "Rs"}
                </span>
              </div>
            </div>

            {/* Info Text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                {marginType === "percent"
                  ? "This margin will be applied at the frontend when displaying prices."
                  : "This margin will be applied at the frontend when displaying prices."}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => {
                setIsMarginModalOpen(false);
                setMarginValue("");
                setMarginType("percent");
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={isApplyingMargin}
            >
              Cancel
            </button>
            <button
              onClick={handleApplyMargin}
              disabled={isApplyingMargin || !marginValue}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isApplyingMargin ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Sector Data Copy Modal */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-99999 transition-all duration-300 ease-in-out
          ${showSectorModal ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-4'}`}
        onClick={() => setShowSectorModal(false)}
      >
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg max-w-md w-full mx-4 max-h-150 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 border-b border-stroke px-6 py-4 dark:border-strokedark bg-white dark:bg-boxdark flex justify-between items-center">
            <h3 className="font-medium text-black dark:text-white">
              Copy Sector Data
            </h3>
            <button
              onClick={() => setShowSectorModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {getAvailableSectors().length > 0 ? (
              <div className="space-y-3">
                {getAvailableSectors().map((sector) => {
                  const sectorCount = unifiedGroups.filter(
                    (g) => g.sector === sector && (g.available_no_of_pax === undefined || g.available_no_of_pax > 0)
                  ).length;
                  return (
                    <div
                      key={sector}
                      className="flex items-center justify-between p-3 border border-stroke dark:border-strokedark rounded-lg hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-black dark:text-white">{sector}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{sectorCount} flights</p>
                      </div>
                      <button
                        onClick={() => handleCopySpecificSectorData(sector)}
                        style={{
                          backgroundColor: copiedSector === sector ? '#22c55e' : '#3b82f6',
                        }}
                        className="px-3 py-1 rounded text-white text-sm font-medium transition-all cursor-pointer"
                      >
                        {copiedSector === sector ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">No sectors available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
