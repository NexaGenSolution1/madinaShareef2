import PageMeta from "../../components/common/PageMeta";
import { ArrowRightIcon, UsersIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import AgentStatusChart from "../../components/charts/AgentStatusChart";
import { useEffect, useState } from "react";
import axiosInstance from "../../Api/axios";


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
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function buildCopyText(groups: UnifiedGroup[]): string {
  if (!groups.length) return "";

  const today = new Date();
  const header = `=====${String(today.getDate()).padStart(2, "0")} ${MONTHS[today.getMonth()]
    } UPDATES=====`;

  const divider = "=====================";

  type Entry = {
    airline: string;
    sector: string;
    price: number;
    date: Date;
    available_no_of_pax?: number;
  };

  const sectorMap = new Map<string, Entry[]>();
  const sectorOrder: string[] = [];

  // 🔹 Step 1: Expand + group by sector
  groups.forEach((g: any) => {
    const addEntry = (dateStr: string) => {
      const entry: Entry = {
        airline: g.airline?.short_name || "",
        sector: g.sector,
        price: g.price,
        date: new Date(dateStr),
        available_no_of_pax: g.available_no_of_pax,
      };

      if (!sectorMap.has(g.sector)) {
        sectorMap.set(g.sector, []);
        sectorOrder.push(g.sector); // maintain API order
      }

      sectorMap.get(g.sector)!.push(entry);
    };

    if (g.details && g.details.length > 0) {
      g.details.forEach((d: any) => {
        const flightDate = d.flight_date || d.dep_date || g.dept_date;
        addEntry(flightDate);
      });
    } else {
      addEntry(g.dept_date);
    }
  });

  // 🔹 Step 2: Sort + same date pe sirf cheapest with seats
  sectorMap.forEach((entries, sector) => {

    // 1️⃣ Pehle sort karo (date → price)
    entries.sort((a, b) => {
      const timeA = a.date.getTime();
      const timeB = b.date.getTime();

      if (timeA === timeB) {
        return a.price - b.price; // same date → cheapest first
      }

      return timeA - timeB; // different date → earliest first
    });

    // 2️⃣ Same date pe sirf pehla valid (seats > 0) entry rakho
    const seenDates = new Set<string>();

    const filtered = entries.filter((item: any) => {
      const dateKey = item.date.toDateString();

      // ❗ seats check yahan hoga
      if (item.available_no_of_pax !== undefined && item.available_no_of_pax <= 0) {
        return false;
      }

      if (seenDates.has(dateKey)) return false;

      seenDates.add(dateKey);
      return true;
    });

    sectorMap.set(sector, filtered);
  });

  // 🔹 Step 3: Build output
  let outputLines: string[] = [];
  let lastMonth: number | null = null;
  let lastSector: string | null = null;

  sectorOrder.forEach((sector) => {
    const entries = sectorMap.get(sector)!;

    entries.forEach((item) => {
      const currentMonth = item.date.getMonth();

      // Divider when month changes OR new sector starts
      if (lastMonth !== null && (lastMonth !== currentMonth || lastSector !== sector)) {
        outputLines.push(divider);
      }

      const dd = String(item.date.getDate()).padStart(2, "0");
      const mon = MONTHS[currentMonth];
      const sectorFormatted = item.sector.replace("-", " ");

      outputLines.push(
        `${item.airline} ${dd} ${mon} ${sectorFormatted}...FARE ${item.price}`
      );

      lastMonth = currentMonth;
      lastSector = sector;
    });
  });

  const footer = `ALL GROUPS ARE NON REFUNDABLE AND NON CHANGEABLE
=======================
       Aizaz Ur Rahman
Mobile. 03478885551-
Brother's International Travels  
Address.. Main Bazar Batkhela.  
        Ptcl. . .0932 412499
EMAIL. pridetravel313@gmail.com`;

  return [header, ...outputLines, divider, footer].join("\n");
}

export default function Home() {
  const navigate = useNavigate()
  const [unifiedGroups, setUnifiedGroups] = useState<UnifiedGroup[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchUnifiedGroups = async () => {
    try {
      const response = await axiosInstance.get("/sector/getUnifiedGroups");
      if (response.data.success && Array.isArray(response.data.data)) {
        setUnifiedGroups(response.data.data);
      } else {
        console.warn("Data format matches but array not found or success is false");
      }
    } catch (error: any) {
      console.error("Error fetching unified groups:", error);
    }
  };

  const handleCopyData = async () => {
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

  useEffect(() => {
    fetchUnifiedGroups();
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard | Bother International"
        description="Dashboard overview for Bother International"
      />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-white">Dashboard</h1>
          <div className="text-sm text-gray-500">
            <span className="text-blue-600">Home</span> / Profile
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-3">
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
              Copy Sectors Data ({unifiedGroups.length})
            </>
          )}
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
    </>
  );
}
