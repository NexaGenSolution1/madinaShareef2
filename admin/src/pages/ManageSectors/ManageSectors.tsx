import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Api/axios';
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";

interface Sector {
    _id: string;
    groupType: string;
    sectorTitle: string;
    fullSector: string;
    order: number;
    createdAt: string;
}

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

            const entries = sectorMap.get(sector);
            if (entries) {
                entries.push({ group: g, date, price, line });
            }

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

            const entries = sectorMap.get(sector);
            if (entries) {
                entries.push({ group: g, date, price, line });
            }
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
        const entries = sectorMap.get(sector);
        if (entries) {
            entries.forEach((e: CopyTextEntry) => lines.push(e.line));
        }
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

export default function ManageSectors() {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [unifiedGroups, setUnifiedGroups] = useState<UnifiedGroup[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [showSectorModal, setShowSectorModal] = useState(false);
    const [copiedSector, setCopiedSector] = useState<string | null>(null);

    const fetchUnifiedGroups = async () => {
        try {
            const response = await axiosInstance.get("/sector/getUnifiedGroups");
            if (response.data.success && Array.isArray(response.data.data)) {
                setUnifiedGroups(response.data.data);
                console.log("✅ Unified groups set successfully:", response.data.data.length);
            } else {
                console.warn("Data format matches but array not found or success is false");
            }
        } catch (error: unknown) {
            console.error("Error fetching unified groups:", error);
        }
    };

    const fetchSectors = async () => {
        try {
            setFetchLoading(true);
            const response = await axiosInstance.get("/sector");
            if (response.data.success) {
                const sortedSectors = response.data.data.sort((a: Sector, b: Sector) =>
                    (a.order ?? 0) - (b.order ?? 0)
                );
                setSectors(sortedSectors);
            }
        } catch (error: unknown) {
            console.error("Error fetching sectors:", error);
        } finally {
            setFetchLoading(false);
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

    const handleCopySpecificSectorData = async (sector: string) => {
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

    const updateSectorOrder = async (reorderedSectors: Sector[]) => {
        try {
            setUpdateLoading(true);
            const sectorsWithOrder = reorderedSectors.map((sector, index) => ({
                _id: sector._id,
                order: index,
            }));
            const response = await axiosInstance.post("/sector/updateSectorOrder", {
                sectors: sectorsWithOrder,
            });
            if (response.data.success) {
                const sortedSectors = response.data.data.sort((a: Sector, b: Sector) =>
                    (a.order ?? 0) - (b.order ?? 0)
                );
                setSectors(sortedSectors);
            }
        } catch (error: unknown) {
            console.error("Error updating sector order:", error);
            fetchSectors();
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.currentTarget.style.opacity = '1';
        setDraggedIndex(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        const newSectors = [...sectors];
        const draggedSector = newSectors[draggedIndex];
        newSectors.splice(draggedIndex, 1);
        newSectors.splice(dropIndex, 0, draggedSector);
        setSectors(newSectors);
        updateSectorOrder(newSectors);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        if (draggedIndex !== null && draggedIndex !== index) {
            e.currentTarget.style.borderTop = '2px solid #3b82f6';
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.currentTarget.style.borderTop = '';
    };

    useEffect(() => {
        fetchUnifiedGroups();
        fetchSectors();
    }, []);

    return (
        <>
            <PageMeta title="All Sectors - World fly travel and tours (Pvt Ltd )" description="View all sectors list" />

            <div className="mb-6">
                <PageBreadCrumb pageTitle="All Sectors" />
            </div>

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex justify-between items-center">
                    <h3 className="font-medium text-black dark:text-white">
                        Sectors List ({sectors.length})
                    </h3>

                    <div className="flex items-center gap-3">
                        {updateLoading && (
                            <span className="text-sm text-primary">Updating order...</span>
                        )}

                        <button
                            onClick={handleCopyData}
                            disabled={unifiedGroups.length === 0}
                            title={unifiedGroups.length === 0 ? "No data available to copy" : "Copy all flight data"}
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
                    </div>
                </div>

                <div className="p-6">
                    {fetchLoading ? (
                        <div className="text-center py-8">
                            <p className="text-black dark:text-white">Loading sectors...</p>
                        </div>
                    ) : (
                        <div className="max-w-full overflow-x-auto">
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-meta-4 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    💡 <strong>Tip:</strong> Drag and drop rows to reorder sectors
                                </p>
                            </div>

                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-12.5 px-4 py-4 font-medium text-black dark:text-white">
                                            <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                            </svg>
                                        </th>
                                        <th className="min-w-12.5 px-4 py-4 font-medium text-black dark:text-white">Sr #</th>
                                        <th className="min-w-37.5 px-4 py-4 font-medium text-black dark:text-white">Group Type</th>
                                        <th className="min-w-30 px-4 py-4 font-medium text-black dark:text-white">Sector Code</th>
                                        <th className="px-4 py-4 font-medium text-black dark:text-white">Full Sector Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sectors.length > 0 ? (
                                        sectors.map((sector, index) => (
                                            <tr
                                                key={sector._id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDragEnter={(e) => handleDragEnter(e, index)}
                                                onDragLeave={handleDragLeave}
                                                className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4 cursor-move transition-all"
                                                style={{ transition: 'background-color 0.2s, border 0.2s' }}
                                            >
                                                <td className="px-4 py-4 text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                    </svg>
                                                </td>
                                                <td className="px-4 py-4 text-black dark:text-white">{index + 1}</td>
                                                <td className="px-4 py-4 text-black dark:text-white">
                                                    <span className="inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium bg-primary text-primary">
                                                        {sector.groupType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-black dark:text-white font-bold">{sector.sectorTitle}</td>
                                                <td className="px-4 py-4 text-black dark:text-white">{sector.fullSector}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-gray-500">
                                                No sectors found in the database.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

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