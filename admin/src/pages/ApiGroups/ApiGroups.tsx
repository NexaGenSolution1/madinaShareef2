import { useEffect, useState } from "react";
import axiosInstance from "../../Api/axios";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import {
    EyeIcon,
    EyeCloseIcon,
    AlertIcon,
} from "../../icons";

// ─── Inline SVG micro-icons (no extra package needed) ────────────────────────

const PlaneSVG = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
);

const SuitcaseSVG = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
        <path d="M20 7h-3V6a3 3 0 0 0-3-3H10a3 3 0 0 0-3 3v1H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM9 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V6zm11 14H4V9h16v11z" />
    </svg>
);

const UtensilsSVG = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    </svg>
);

const RefreshSVG = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="1em" height="1em">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const DepartureSVG = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
        <path d="M2.5 19h19v2h-19zm7.18-1.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-3.64-.97-2.45-8.74-1.99-.53v7.69l-4.34-1.16-.82-1.43-1.5-.4v3.79l1.82.49 2.48.63z" />
    </svg>
);

const SaveSVG = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
        <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10v4z" />
    </svg>
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface FlightDetail {
    flight_no: string;
    flight_date: string;
    dep_date: string;
    dept_time: string;
    arv_date: string;
    arv_time: string;
    origin: string;
    destination: string;
    baggage?: string;
    meal?: string;
}

interface SabaoonAirline {
    airline_name: string;
    logo_url: string | null;
}

interface SabaoonGroup {
    id: string | number;
    groupName?: string;
    airline: SabaoonAirline | null;
    sector: string;
    price: number;
    childPrice?: number;
    infantPrice?: number;
    type?: string;
    available_no_of_pax: number;
    dept_date: string;
    arv_date: string;
    pnr?: string;
    details: FlightDetail[];
    isHidden: boolean;
    individualMargin: number | null;
}

interface GroupedEntry {
    airline: string;
    airlineLogo: string | null;
    sector: string;
    groups: SabaoonGroup[];
}

// Per-row local state for unsaved UI changes
interface RowState {
    isHidden: boolean;
    individualMargin: string; // string so the input stays controlled
    saving: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ApiGroups() {
    const [groups, setGroups] = useState<SabaoonGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/sabaoon/admin-groups");
            if (res.data?.success) {
                const data: SabaoonGroup[] = res.data.data || [];
                setGroups(data);

                const init: Record<string, RowState> = {};
                for (const g of data) {
                    init[String(g.id)] = {
                        isHidden: g.isHidden ?? false,
                        individualMargin:
                            g.individualMargin !== null && g.individualMargin !== undefined
                                ? String(g.individualMargin)
                                : "",
                        saving: false,
                    };
                }
                setRowStates(init);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load Sabaoon API groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────────

    const setSaving = (id: string, value: boolean) =>
        setRowStates((prev) => ({ ...prev, [id]: { ...prev[id], saving: value } }));

    const handleToggleHide = async (groupId: string | number) => {
        const id = String(groupId);
        const row = rowStates[id];
        if (!row || row.saving) return;

        const newHidden = !row.isHidden;
        setRowStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], isHidden: newHidden, saving: true },
        }));

        try {
            await axiosInstance.post(`/sabaoon/override/${id}`, { isHidden: newHidden });
            toast.success(`Group ${newHidden ? "hidden from frontend" : "visible on frontend"}`);
        } catch {
            toast.error("Failed to update visibility");
            // Revert
            setRowStates((prev) => ({
                ...prev,
                [id]: { ...prev[id], isHidden: !newHidden },
            }));
        } finally {
            setSaving(id, false);
        }
    };

    const handleMarginInput = (groupId: string | number, value: string) => {
        const id = String(groupId);
        setRowStates((prev) => ({ ...prev, [id]: { ...prev[id], individualMargin: value } }));
    };

    const handleSaveMargin = async (groupId: string | number) => {
        const id = String(groupId);
        const row = rowStates[id];
        if (!row || row.saving) return;

        const raw = row.individualMargin.trim();
        const marginValue = raw === "" ? null : Number(raw);

        if (raw !== "" && (isNaN(marginValue as number) || (marginValue as number) < 0)) {
            toast.error("Please enter a valid non-negative number");
            return;
        }

        setSaving(id, true);
        try {
            await axiosInstance.post(`/sabaoon/override/${id}`, { individualMargin: marginValue });
            toast.success(
                marginValue === null
                    ? "Individual margin cleared — global/agent margins will apply"
                    : `Margin set to PKR ${marginValue.toLocaleString()} per pax`
            );
        } catch {
            toast.error("Failed to save margin");
        } finally {
            setSaving(id, false);
        }
    };

    // ── Group by airline × sector ─────────────────────────────────────────────

    const groupedData = groups.reduce<Record<string, GroupedEntry>>((acc, group) => {
        const airlineName = group.airline?.airline_name || "Unknown";
        const sector = (group.sector || "Unknown").toUpperCase().trim();
        const key = `${airlineName}||${sector}`;
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

    // ── Render helpers ────────────────────────────────────────────────────────

    const LoadingSkeleton = () => (
        <div className="space-y-6 p-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                    <div className="h-12 rounded-2xl bg-gray-200 mb-4 w-full" />
                    {[1, 2].map((j) => (
                        <div key={j} className="h-24 bg-gray-100 rounded-2xl mb-3" />
                    ))}
                </div>
            ))}
        </div>
    );

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <>
            <PageMeta
                title="All API Groups | Admin"
                description="Manage Sabaoon API group flights — hide groups or set individual margins"
            />
            <PageBreadCrumb pageTitle="All API Groups" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 min-h-screen">
                {/* ─── Page header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                            All API Groups
                        </h1>
                        {/* Sabaoon indicator badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Sabaoon API
                        </span>
                    </div>

                    <button
                        onClick={fetchGroups}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition disabled:opacity-50"
                    >
                        <RefreshSVG className={`text-base ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* ─── Info banner ─────────────────────────────────────────────── */}
                <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    <AlertIcon className="mt-0.5 shrink-0 text-amber-500 w-4 h-4" />
                    <div>
                        <strong>How margins work:</strong> If an individual margin (PKR fixed amount) is set for a group,{" "}
                        <em>only that margin</em> is applied on the frontend — agent and global margins are ignored for that group.
                        Clear the margin field and save to revert to global/agent margins.
                    </div>
                </div>

                {/* ─── Content ─────────────────────────────────────────────────── */}
                {loading ? (
                    <LoadingSkeleton />
                ) : groups.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        No groups returned from Sabaoon API
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedData).map(([key, data]) => {
                            const sectorParts = data.sector?.split("-") || [];
                            const origin = sectorParts[0] || "";
                            const destination = sectorParts[sectorParts.length - 1] || data.sector;

                            return (
                                <div
                                    key={key}
                                    className="rounded-2xl overflow-hidden border border-neutral-200"
                                >
                                    {/* ── Airline / Sector header ─────────────────────── */}
                                    <div className="flex items-center justify-center gap-6 py-2.5 bg-linear-to-r from-blue-50 via-white to-blue-50 border-b border-neutral-200">
                                        <div className="flex items-center justify-center min-w-16">
                                            {data.airlineLogo ? (
                                                <img
                                                    src={data.airlineLogo}
                                                    alt={data.airline}
                                                    style={{ height: "52px" }}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <span className="font-semibold text-sm text-gray-700">
                                                    {data.airline}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <DepartureSVG className="text-blue-500 text-lg" />
                                            <span className="font-bold text-lg tracking-widest uppercase text-gray-800">
                                                {data.sector}
                                            </span>
                                        </div>

                                        {/* Sabaoon source badge inside each group header */}
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 tracking-wide">
                                            SABAOON API
                                        </span>
                                    </div>

                                    {/* ── Flight cards ─────────────────────────────────── */}
                                    <div className="bg-gray-50 py-3 divide-y divide-gray-100">
                                        {data.groups
                                            .sort((a, b) => {
                                                const da = a.dept_date || a.details?.[0]?.dep_date || "";
                                                const db = b.dept_date || b.details?.[0]?.dep_date || "";
                                                return da.localeCompare(db);
                                            })
                                            .map((group) => {
                                                const id = String(group.id);
                                                const row = rowStates[id];
                                                const flight = group.details?.[0];
                                                const isHidden = row?.isHidden ?? group.isHidden;

                                                return (
                                                    <div
                                                        key={id}
                                                        className={`bg-white border border-neutral-100 transition-all ${isHidden ? "opacity-60" : ""
                                                            }`}
                                                    >
                                                        {/* Hidden banner */}
                                                        {isHidden && (
                                                            <div className="bg-red-50 border-b border-red-100 text-red-600 text-xs font-medium px-4 py-1.5 flex items-center gap-2">
                                                                <EyeCloseIcon className="w-3 h-3" />
                                                                This group is hidden from the frontend
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col xl:flex-row items-start xl:items-center p-3 px-4 gap-4">
                                                            {/* ─ Date & Flight ─────────────────────── */}
                                                            <div className="flex xl:flex-col items-center xl:items-start justify-between xl:justify-center w-full xl:w-auto border-b xl:border-b-0 pb-3 xl:pb-0 border-gray-100">
                                                                <div className="text-xs font-medium text-gray-500">
                                                                    {flight
                                                                        ? new Date(flight.flight_date).toLocaleDateString("en-GB", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })
                                                                        : "—"}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <PlaneSVG className="text-sm text-blue-500" />
                                                                    <span className="font-semibold text-sm text-gray-800">
                                                                        {flight?.flight_no || "—"}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-1 text-[10px] text-gray-400">
                                                                    Seats: {group.available_no_of_pax}
                                                                </div>
                                                            </div>

                                                            {/* ─ Route ─────────────────────────────── */}
                                                            <div className="flex-1 flex items-center justify-center gap-4 w-full px-1">
                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-gray-800">{origin}</div>
                                                                    <div className="text-xs text-gray-500 font-medium">
                                                                        {flight?.dept_time?.substring(0, 5) || "—"}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center flex-1 relative min-w-10 max-w-36">
                                                                    <div className="h-0.5 w-full bg-linear-to-r from-blue-400 to-blue-600" />
                                                                    <div className="absolute left-1/2 -translate-x-1/2 bg-white px-1">
                                                                        <PlaneSVG className="text-base text-blue-500" />
                                                                    </div>
                                                                </div>

                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-gray-800">{destination}</div>
                                                                    <div className="text-xs text-gray-500 font-medium">
                                                                        {(
                                                                            group.details?.[group.details.length - 1]?.arv_time ||
                                                                            flight?.arv_time
                                                                        )?.substring(0, 5) || "—"}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* ─ Baggage / Meal ────────────────────── */}
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {flight?.baggage && (
                                                                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs font-medium">
                                                                        <SuitcaseSVG className="text-xs text-blue-500" />
                                                                        <span>{flight.baggage}KG</span>
                                                                    </div>
                                                                )}
                                                                {flight?.meal && flight.meal !== "No" && (
                                                                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs font-medium">
                                                                        <UtensilsSVG className="text-xs text-blue-500" />
                                                                        <span>Meal</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ─ Base Price ────────────────────────── */}
                                                            <div className="text-center shrink-0 min-w-20">
                                                                <div className="text-[9px] text-gray-400 uppercase">
                                                                    Base Price (Adult)
                                                                </div>
                                                                <div className="text-lg font-bold text-blue-600">
                                                                    {group.price.toLocaleString()}
                                                                </div>
                                                                <div className="text-[9px] text-gray-400">PKR</div>
                                                            </div>

                                                            {/* ─ Admin Controls ────────────────────── */}
                                                            <div className="flex flex-col sm:flex-row xl:flex-row items-start sm:items-center gap-3 border-t xl:border-t-0 pt-3 xl:pt-0 border-gray-100 w-full xl:w-auto">
                                                                {/* Individual margin input */}
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                                                        Individual Margin (PKR)
                                                                    </label>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            placeholder="e.g. 500"
                                                                            value={row?.individualMargin ?? ""}
                                                                            onChange={(e) => handleMarginInput(id, e.target.value)}
                                                                            className="w-28 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                                            disabled={row?.saving}
                                                                        />
                                                                        <button
                                                                            onClick={() => handleSaveMargin(id)}
                                                                            disabled={row?.saving}
                                                                            title="Save margin"
                                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50"
                                                                        >
                                                                            <SaveSVG className="text-sm" />
                                                                            Save
                                                                        </button>
                                                                    </div>
                                                                    {row?.individualMargin !== "" && row?.individualMargin !== undefined && (
                                                                        <span className="text-[10px] text-amber-600 font-medium">
                                                                            ⚡ Overrides all other margins
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Hide toggle */}
                                                                <button
                                                                    onClick={() => handleToggleHide(id)}
                                                                    disabled={row?.saving}
                                                                    title={isHidden ? "Show on frontend" : "Hide from frontend"}
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition border disabled:opacity-50 ${isHidden
                                                                            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                                                            : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                                        }`}
                                                                >
                                                                    {isHidden ? (
                                                                        <>
                                                                            <EyeCloseIcon className="w-3.5 h-3.5" />
                                                                            Hidden
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <EyeIcon className="w-3.5 h-3.5" />
                                                                            Visible
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}