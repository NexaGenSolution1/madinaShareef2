import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../../api/axios'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function AllGroups({ searchParams }) {
    const navigate = useNavigate()
    const [groups, setGroups] = useState([])
    const [allGroups, setAllGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filter states
    const [filters, setFilters] = useState({
        sectors: [],
        airlines: [],
        searchKeyword: '',
        departDate: null
    })

    // Advanced search toggle
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

    // Get unique values for filter checkboxes
    const [airlines, setAirlines] = useState([])
    const [sectors, setSectors] = useState([])

    useEffect(() => {
        fetchGroups()
    }, [searchParams])

    const fetchGroups = async () => {
        try {
            setLoading(true)
            setError(null)
            let allGroups = []
            const groupType = searchParams.get('group_type') || ''

            // Fetch al-haider groups
            const alHaiderApiResponse = await axiosInstance.get('/al-haider/available-bookings-by-group')
                .catch(err => {
                    console.error('Al-Haider API Error:', err)
                    return { data: { success: false, data: { groups: [] } } }
                })

            if (alHaiderApiResponse.data.success) {
                allGroups = alHaiderApiResponse.data.data.groups || []
            }

            // Fetch admin groups
            const adminApiResponse = await axiosInstance.get("/group-ticketing")
                .catch(err => {
                    console.error('Admin API Error:', err)
                    return { data: { success: false, data: [] } }
                });

            const adminAirlineApiResponse = await axiosInstance.get("/airline")
                .catch(err => {
                    console.error('Admin API Error:', err)
                    return { data: { success: false, data: [] } }
                });

            if (adminApiResponse.data.success && adminApiResponse.data.data) {
                // Transform admin API data to match alHaider structure
                const transformedAdminGroups = adminApiResponse.data.data.map(group => ({
                    id: group._id,
                    available_no_of_pax: group.totalSeats || 0,
                    showSeat: group.showSeat || false,
                    sector: group.sector,
                    type: group.groupType,
                    price: group.price?.sellingAdultPriceB2B || 0,
                    childPrice: group.price?.sellingChildPriceB2B || 0,
                    infantPrice: group.price?.sellingInfantPriceB2B || 0,
                    pnr: group.pnr || '',
                    dept_date: group.flights[0]?.depDate || null,
                    arv_date: group.flights[group.flights.length - 1]?.arrDate || null,
                    details: group.flights.map((flight, index) => ({
                        sr: index + 1,
                        flight_no: flight.flightNo,
                        flight_date: flight.depDate,
                        dep_date: flight.depDate,
                        dept_time: flight.depTime,
                        origin: flight.sectorFrom,
                        destination: flight.sectorTo,
                        arv_date: flight.arrDate,
                        arv_time: flight.arrTime,
                        baggage: flight.baggage,
                        meal: flight.meal
                    })),
                    airline: {
                        id: adminAirlineApiResponse.data.data.find(airline => airline.airlineName === group.airline)?._id || null,
                        airline_name: group.airline,
                        short_name: adminAirlineApiResponse.data.data.find(airline => airline.airlineName === group.airline)?.shortCode || null,
                        logo_url: adminAirlineApiResponse.data.data.find(airline => airline.airlineName === group.airline)?.logo || null
                    }
                }))

                allGroups = [...allGroups, ...transformedAdminGroups]
            }

            // Apply filtering based on group_type if specified
            if (groupType) {
                const normalizedGroupType = groupType.toLowerCase().trim()

                // Define group type mappings - maps search terms to actual group types in data
                const groupTypeMap = {
                    'uae': (type) => type === 'uae' || type.includes('uae'),
                    'ksa': (type) => type === 'ksa oneway' || type.includes('ksa'),
                    'ksa oneway': (type) => type === 'ksa oneway' || type.includes('ksa'),
                    'bahrain': (type) => type === 'bahrain' || type.includes('bahrain'),
                    'muscat': (type) => type === 'muscat' || type.includes('muscat') || type.includes('mascat'),
                    'mascat': (type) => type === 'muscat' || type.includes('muscat') || type.includes('mascat'),
                    'qatar': (type) => type === 'qatar' || type.includes('qatar'),
                    'uk': (type) => type === 'uk' || type.includes('uk'),
                    'umrah': (type) => type === 'umrah' || type.includes('umrah')
                }

                allGroups = allGroups.filter(group => {
                    if (!group.type) return false
                    const normalizedType = group.type.toLowerCase().trim()

                    // Check if we have a custom matcher for this group type
                    const matcher = groupTypeMap[normalizedGroupType]
                    if (matcher) {
                        return matcher(normalizedType)
                    }

                    // Fallback to direct comparison and contains check
                    return normalizedType === normalizedGroupType ||
                        normalizedType.includes(normalizedGroupType) ||
                        normalizedGroupType.includes(normalizedType)
                })
            }

            // Extract unique airlines and sectors for filters
            const uniqueAirlines = [...new Set(allGroups.map(g => g.airline?.airline_name).filter(Boolean))]
            const uniqueSectors = [...new Set(allGroups.map(g => g.sector).filter(Boolean))]
            setAirlines(uniqueAirlines.sort())
            setSectors(uniqueSectors.sort())

            setAllGroups(allGroups)
            applyFilters(allGroups)

        } catch (err) {
            console.error('Error fetching groups:', err)
            setError(null) // Don't show error, just use empty data
            setAllGroups([])
            setGroups([])
            toast.error('Failed to load groups. Showing empty list.')
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = (dataToFilter = allGroups) => {
        let filtered = [...dataToFilter]

        // Filter by selected sectors
        if (filters.sectors.length > 0) {
            filtered = filtered.filter(g => filters.sectors.includes(g.sector))
        }

        // Filter by selected airlines
        if (filters.airlines.length > 0) {
            filtered = filtered.filter(g => filters.airlines.includes(g.airline?.airline_name))
        }

        // Filter by search keyword (searches in flight number, sector, airline)
        if (filters.searchKeyword) {
            const keyword = filters.searchKeyword.toLowerCase()
            filtered = filtered.filter(g => {
                const matchesSector = g.sector?.toLowerCase().includes(keyword)
                const matchesAirline = g.airline?.airline_name?.toLowerCase().includes(keyword)
                const matchesFlightNo = g.details?.some(flight =>
                    flight.flight_no?.toLowerCase().includes(keyword)
                )
                return matchesSector || matchesAirline || matchesFlightNo
            })
        }

        // Filter by departure date
        if (filters.departDate) {
            filtered = filtered.filter(g => {
                const deptDate = new Date(g.dept_date)
                const selectedDate = new Date(filters.departDate)

                // Compare year, month, and day directly to avoid timezone issues
                return deptDate.getFullYear() === selectedDate.getFullYear() &&
                    deptDate.getMonth() === selectedDate.getMonth() &&
                    deptDate.getDate() === selectedDate.getDate()
            })
        }

        // Sort by departure date (earliest first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.dept_date)
            const dateB = new Date(b.dept_date)
            return dateA - dateB
        })

        setGroups(filtered)
    }

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'sector') {
            setFilters(prev => ({
                ...prev,
                sectors: prev.sectors.includes(value)
                    ? prev.sectors.filter(s => s !== value)
                    : [...prev.sectors, value]
            }))
        } else if (filterType === 'airline') {
            setFilters(prev => ({
                ...prev,
                airlines: prev.airlines.includes(value)
                    ? prev.airlines.filter(a => a !== value)
                    : [...prev.airlines, value]
            }))
        } else {
            setFilters(prev => ({ ...prev, [filterType]: value }))
        }
    }

    const handleBookNow = (group) => {
        navigate('/dashboard/booking', { state: { groupData: group } })
    }

    useEffect(() => {
        applyFilters()
    }, [filters, allGroups])

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading groups...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchGroups}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen mx-auto">
            {/* Advanced Search Section */}
            <div className="mb-4 bg-white rounded-lg shadow p-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Advanced Search Toggle */}
                    <div className="flex items-center gap-2">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={showAdvancedSearch}
                                    onChange={(e) => setShowAdvancedSearch(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${showAdvancedSearch ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showAdvancedSearch ? 'translate-x-4' : ''
                                        }`}></div>
                                </div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">Advance Search</span>
                        </label>
                    </div>

                    {/* Search by Dept Date */}
                    <div className="shrink-0">
                        {/* <label className="block text-xs font-medium text-gray-700 mb-1">
                            Search by Dept Date
                        </label> */}
                        <DatePicker
                            selected={filters.departDate}
                            onChange={(date) => handleFilterChange('departDate', date)}
                            placeholderText="Search by Dept Date"
                            dateFormat="dd MMM yyyy"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            wrapperClassName="w-full"
                            calendarClassName="custom-datepicker"
                        />
                    </div>

                    {/* Search by Keyword */}
                    <div className="flex-1 min-w-50">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by Keyword"
                                value={filters.searchKeyword}
                                onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                🔍
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex gap-4">
                {/* Left Sidebar - Filters */}
                {showAdvancedSearch && (
                    <div className="hidden lg:block w-64 shrink-0">
                        {/* Airlines Filter */}
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Airlines</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {airlines.map((airline) => (
                                    <label key={airline} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={filters.airlines.includes(airline)}
                                            onChange={() => handleFilterChange('airline', airline)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{airline}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sectors Filter */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Sectors</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {sectors.map((sector) => (
                                    <label key={sector} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={filters.sectors.includes(sector)}
                                            onChange={() => handleFilterChange('sector', sector)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{sector}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Table Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-linear-to-r from-[#1e3a5f] to-[#2d5a8f]">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Flight#
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Date
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Origin-Destination
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Time
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Baggage
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Meal
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Price
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-dashed divide-gray-300">
                                    {groups.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-center text-gray-500 text-sm">
                                                No groups available at the moment
                                            </td>
                                        </tr>
                                    ) : (
                                        (() => {
                                            // Group by airline_name and sector
                                            const groupedData = groups.reduce((acc, group) => {
                                                const key = `${group.airline?.airline_name || 'Unknown'}-${group.sector || 'Unknown'}`
                                                if (!acc[key]) {
                                                    acc[key] = {
                                                        airline: group.airline?.airline_name || 'Unknown',
                                                        sector: group.sector || 'Unknown',
                                                        logo_url: group.airline?.logo_url || null,
                                                        groups: []
                                                    }
                                                }
                                                acc[key].groups.push(group)
                                                return acc
                                            }, {})

                                            const formatDate = (dateStr) => {
                                                const date = new Date(dateStr)
                                                const day = date.getDate().toString().padStart(2, '0')
                                                const month = date.toLocaleDateString('en-US', { month: 'short' })
                                                const year = date.getFullYear()
                                                return `${day} ${month} ${year}`
                                            }
                                            return Object.entries(groupedData).map(([key, data]) => (
                                                <React.Fragment key={key}>
                                                    {/* Header row with airline logo and sector */}
                                                    <tr className="bg-gray-50">
                                                        <td colSpan="8" className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-3">
                                                                {data.logo_url && (
                                                                    <img
                                                                        src={data.logo_url}
                                                                        alt={data.airline}
                                                                        className='w-32 object-contain'
                                                                    />
                                                                )}
                                                                <span className="font-semibold text-gray-900 text-base">
                                                                    {data.sector}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* All flights under this airline and sector */}
                                                    {data.groups.map((group, groupIndex) => (
                                                        <tr
                                                            key={group.id}
                                                            className=" bg-sky-200/30 text-sm text-gray-900 [&>td]:px-4 [&>td]:py-1 align-middle"
                                                        >
                                                            {/* Flight Numbers */}
                                                            <td className="font-medium">
                                                                {group.details?.map((flight, i) => (
                                                                    <div key={i}>
                                                                        {flight.flight_no}
                                                                    </div>
                                                                ))}
                                                            </td>

                                                            {/* Flight Date */}
                                                            <td>
                                                                {group.details?.map((flight, i) => (
                                                                    <div key={i} className="flex justify-center gap-2">
                                                                        <span className="text-blue-600">✈</span>
                                                                        <span>{formatDate(flight.flight_date)}</span>
                                                                    </div>
                                                                ))}
                                                            </td>

                                                            {/* Sector */}
                                                            <td>
                                                                {group.details?.map((flight, i) => (
                                                                    <div key={i} className="flex justify-center">
                                                                        {flight.origin}-{flight.destination}
                                                                    </div>
                                                                ))}
                                                            </td>

                                                            {/* Time */}
                                                            <td>
                                                                {group.details?.map((flight, i) => (
                                                                    <div key={i} className="flex justify-center">
                                                                        {flight.dept_time?.substring(0, 5)} - {flight.arv_time?.substring(0, 5)}
                                                                    </div>
                                                                ))}
                                                            </td>

                                                            {/* Baggage */}
                                                            <td>
                                                                {group.details?.map((flight, i) => (
                                                                    <div key={i} className="flex justify-center">
                                                                        {flight.baggage ? `${flight.baggage} KG` : 'N/A'}
                                                                    </div>
                                                                ))}
                                                            </td>

                                                            {/* Meal */}
                                                            <td>
                                                                {group.details?.map((flight, i) => (
                                                                    <div key={i} className="flex justify-center">
                                                                        {flight.meal || 'No'}
                                                                    </div>
                                                                ))}
                                                            </td>

                                                            {/* Price */}
                                                            <td className="font-semibold text-center">
                                                                PKR {group.price?.toLocaleString()}
                                                            </td>

                                                            {/* Action */}
                                                            <td className="text-center">
                                                                <button
                                                                    onClick={() => handleBookNow(group)}
                                                                    className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff5722] text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                                                                >
                                                                    Book now
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                </React.Fragment>
                                            ))
                                        })()
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}