import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../../api/axios'
import { toast } from 'react-toastify'

export default function AllGroups() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const [groups, setGroups] = useState([])
    const [allGroups, setAllGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hoveredGroup, setHoveredGroup] = useState(null)

    // Filter states
    const [filters, setFilters] = useState({
        sector: '',
        airline: '',
        meal: '',
        fromDate: '',
        toDate: ''
    })

    // Get unique values for filter dropdowns
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

        // Filter by sector
        if (filters.sector) {
            filtered = filtered.filter(g => g.sector === filters.sector)
        }

        // Filter by airline
        if (filters.airline) {
            filtered = filtered.filter(g => g.airline?.airline_name === filters.airline)
        }

        // Filter by meal
        if (filters.meal) {
            filtered = filtered.filter(g => g.meal?.toLowerCase() === filters.meal.toLowerCase())
        }

        // Filter by date range
        if (filters.fromDate) {
            filtered = filtered.filter(g => {
                const deptDate = new Date(g.dept_date)
                const fromDate = new Date(filters.fromDate)
                return deptDate >= fromDate
            })
        }
        if (filters.toDate) {
            filtered = filtered.filter(g => {
                const deptDate = new Date(g.dept_date)
                const toDate = new Date(filters.toDate)
                return deptDate <= toDate
            })
        }

        // Sort by departure date (earliest first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.dept_date)
            const dateB = new Date(b.dept_date)
            return dateA - dateB
        })

        setGroups(filtered)
        // updateFilterOptions(filtered)
    }

    // const updateFilterOptions = (filteredGroups) => {
    //     // Create a copy of current filters to determine which filters to respect
    //     let dataForOptions = [...allGroups]

    //     // Apply each filter except the one being updated to get dynamic options
    //     if (filters.airline) {
    //         dataForOptions = dataForOptions.filter(g => g.airline?.airline_name === filters.airline)
    //     }
    //     if (filters.sector) {
    //         dataForOptions = dataForOptions.filter(g => g.sector === filters.sector)
    //     }
    //     if (filters.meal) {
    //         dataForOptions = dataForOptions.filter(g => g.meal?.toLowerCase() === filters.meal.toLowerCase())
    //     }
    //     if (filters.fromDate) {
    //         dataForOptions = dataForOptions.filter(g => {
    //             const deptDate = new Date(g.dept_date)
    //             const fromDate = new Date(filters.fromDate)
    //             return deptDate >= fromDate
    //         })
    //     }
    //     if (filters.toDate) {
    //         dataForOptions = dataForOptions.filter(g => {
    //             const deptDate = new Date(g.dept_date)
    //             const toDate = new Date(filters.toDate)
    //             return deptDate <= toDate
    //         })
    //     }

    //     // Extract unique values for dropdowns from filtered data
    //     const uniqueAirlines = [...new Set(dataForOptions.map(g => g.airline?.airline_name).filter(Boolean))]
    //     const uniqueSectors = [...new Set(dataForOptions.map(g => g.sector).filter(Boolean))]
    //     const uniqueMeals = [...new Set(dataForOptions.map(g => g.meal).filter(Boolean))]

    //     setAirlines(uniqueAirlines.sort())
    //     setSectors(uniqueSectors.sort())
    //     setMeals(uniqueMeals.sort())
    // }

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value }
        setFilters(newFilters)
    }

    const resetFilters = () => {
        setFilters({
            sector: '',
            airline: '',
            meal: '',
            fromDate: '',
            toDate: ''
        })
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
        <div className="w-full min-h-screen">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {searchParams.get('group_type')
                                ? `${searchParams.get('group_type').toUpperCase()} Groups`
                                : 'All Groups'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Showing {groups.length} of {allGroups.length} {groups.length === 1 ? 'group' : 'groups'}
                        </p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        <button
                            onClick={resetFilters}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Reset All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Sector Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sector
                            </label>
                            <select
                                value={filters.sector}
                                onChange={(e) => handleFilterChange('sector', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Sectors</option>
                                {sectors.map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </select>
                        </div>

                        {/* Airline Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Airline
                            </label>
                            <select
                                value={filters.airline}
                                onChange={(e) => handleFilterChange('airline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Airlines</option>
                                {airlines.map(airline => (
                                    <option key={airline} value={airline}>{airline}</option>
                                ))}
                            </select>
                        </div>

                        {/* Meal Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meal
                            </label>
                            <select
                                value={filters.meal}
                                onChange={(e) => handleFilterChange('meal', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Departure Date Range
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filters.fromDate}
                                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="date"
                                    value={filters.toDate}
                                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                    min={filters.fromDate || new Date().toISOString().split('T')[0]}
                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-[#1e3a5f] to-[#2d5a8f]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Flight#
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Date
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Origin-Destination
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Baggage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Meal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {groups.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
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

                                        console.log("Grouped Data", groupedData)

                                        return Object.entries(groupedData).map(([key, data]) => (
                                            <React.Fragment key={key}>
                                                {/* Header row with airline logo and route */}
                                                <tr className="bg-gray-50">
                                                    <td colSpan="8" className="px-4 py-2">
                                                        <div className="flex justify-center items-center gap-2">
                                                            {/* <span className="text-green-600 text-xl">✈</span> */}
                                                            <img src={data.logo_url} className='w-28' />
                                                            <span className="font-semibold text-gray-700">
                                                                {/* {data.airline} |  */}
                                                                {data.sector}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* All flights under this airline and sector */}
                                                {data.groups.map((group, groupIndex) => (
                                                    group.details?.map((flight, flightIndex) => (
                                                        <tr 
                                                            key={`${group.id}-${flight.id}`} 
                                                            className={`transition-colors border-l-4 border-l-green-500 ${flightIndex === group.details.length - 1 ? 'border-b border-gray-200' : ''} ${hoveredGroup === group.id ? 'bg-gray-50' : ''}`}
                                                            onMouseEnter={() => setHoveredGroup(group.id)}
                                                            onMouseLeave={() => setHoveredGroup(null)}
                                                        >

                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {flight.flight_no}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-green-500">✈</span>
                                                                    {formatDate(flight.flight_date)}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {flight.origin}-{flight.destination}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {flight.dept_time?.substring(0, 5)}-{flight.arv_time?.substring(0, 5)}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {`${flight.baggage ? `${flight.baggage} KG` : 'N/A'}`}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {flight.meal || 'No'}
                                                            </td>
                                                            {flightIndex === 0 && (
                                                                <>
                                                                    <td rowSpan={group.details.length} className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 align-middle text-center">
                                                                        PKR {group.price?.toLocaleString()}
                                                                    </td>
                                                                    <td rowSpan={group.details.length} className="px-4 py-3 whitespace-nowrap text-sm align-middle text-center">
                                                                        <button
                                                                            onClick={() => handleBookNow(group)}
                                                                            className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 hover:scale-105 active:scale-95 transition-all duration-300 text-xs font-semibold shadow-md hover:shadow-lg transform"
                                                                        >
                                                                            Book now
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))
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
    )
}