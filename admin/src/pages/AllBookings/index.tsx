import { useState, useEffect, memo } from 'react'
import { useNavigate } from 'react-router'
import axiosInstance from '../../Api/axios'

interface Booking {
    _id: string
    bookingReference: string
    contactPersonName: string
    sector: string
    airline?: { id?: string; name: string; logoUrl?: string }
    userId?: string | { _id: string; name: string; email: string }
    adultsCount: number
    childrenCount: number
    infantsCount: number
    departureDate: string
    pricing: { grandTotal: number }
    status: string
}

interface StatusOption {
    value: string
    label: string
    color: string
}

interface BookingsTableProps {
    bookings: Booking[]
    getStatusBadge: (status: string) => StatusOption
    formatDate: (dateStr: string | undefined) => string
    navigate: (path: string) => void
}

const BookingsTable = memo(({ bookings, getStatusBadge, formatDate, navigate }: BookingsTableProps) => {
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-linear-to-r from-[#1e3a5f] to-[#2d5a8f]">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Sector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Airline
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Passengers
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Departure
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Total Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Action
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            No bookings found
                        </td>
                    </tr>
                ) : (
                    bookings.map((booking) => {
                        const statusBadge = getStatusBadge(booking.status)
                        return (
                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="font-semibold text-blue-600">{booking.bookingReference}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    <div>
                                        <p className="font-medium">{booking.contactPersonName}</p>
                                        <p className="text-xs text-gray-500">{typeof booking.userId === 'object' ? booking.userId?.email : booking.userId || 'N/A'}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {booking.sector}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {booking.airline?.name || 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex gap-1">
                                        {booking.adultsCount > 0 && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                A: {booking.adultsCount}
                                            </span>
                                        )}
                                        {booking.childrenCount > 0 && (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                C: {booking.childrenCount}
                                            </span>
                                        )}
                                        {booking.infantsCount > 0 && (
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                I: {booking.infantsCount}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(booking.departureDate)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    PKR {booking.pricing.grandTotal.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                                        {statusBadge.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => navigate(`/booking-detail/${booking._id}`)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        )
                    })
                )}
            </tbody>
        </table>
    )
})

BookingsTable.displayName = 'BookingsTable'

export default function AllBookings() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [fetching, setFetching] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeStatus, setActiveStatus] = useState('')
    const [filters, setFilters] = useState({
        sector: '',
        airline: '',
        fromDate: '',
        toDate: ''
    })
    const [uniqueSectors, setUniqueSectors] = useState<string[]>([])
    const [uniqueAirlines, setUniqueAirlines] = useState<string[]>([])

    const statusOptions: StatusOption[] = [
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    ]

    useEffect(() => {
        fetchBookings()
    }, [filters, activeStatus, searchQuery])

    useEffect(() => {
        // Extract unique sectors and airlines from bookings
        const sectors = [...new Set(bookings.map(b => b.sector).filter(Boolean))]
        const airlines = [...new Set(bookings.map(b => b.airline?.name).filter((name): name is string => Boolean(name)))]
        setUniqueSectors(sectors.sort())
        setUniqueAirlines(airlines.sort())
    }, [bookings])

    const fetchBookings = async () => {
        try {
            setFetching(true)

            const params = new URLSearchParams({
                ...(activeStatus && { status: activeStatus }),
                ...(filters.sector && { sector: filters.sector }),
                ...(filters.airline && { airline: filters.airline }),
                ...(searchQuery && { search: searchQuery }),
                ...(filters.fromDate && { fromDate: filters.fromDate }),
                ...(filters.toDate && { toDate: filters.toDate })
            })

            const response = await axiosInstance.get(`/bookings?${params}`)

            if (response.data.success) {
                setBookings(response.data.data)
            }
        } catch (err) {
            console.error('Error fetching bookings:', err)
        } finally {
            setInitialLoading(false)
            setFetching(false)
        }
    }

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }))
    }

    const resetFilters = () => {
        setSearchQuery('')
        setActiveStatus('')
        setFilters({
            sector: '',
            airline: '',
            fromDate: '',
            toDate: ''
        })
    }

    const getStatusBadge = (status: string): StatusOption => {
        const option = statusOptions.find(opt => opt.value === status)
        return option || statusOptions[0]
    }

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    if (initialLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h1>
                <p className="text-gray-600">Manage all customer flight bookings</p>
            </div>

            {/* Status Tabs */}
            <div className="mb-6 bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveStatus('')}
                            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                activeStatus === '' 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            All Bookings
                        </button>
                        {statusOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setActiveStatus(option.value)}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeStatus === option.value
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Filters Section */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sector
                        </label>
                        <select
                            value={filters.sector}
                            onChange={(e) => handleFilterChange('sector', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Sectors</option>
                            {uniqueSectors.map(sector => (
                                <option key={sector} value={sector}>
                                    {sector}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Airline Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Airline
                        </label>
                        <select
                            value={filters.airline}
                            onChange={(e) => handleFilterChange('airline', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Airlines</option>
                            {uniqueAirlines.map(airline => (
                                <option key={airline} value={airline}>
                                    {airline}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => handleFilterChange('toDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Search Bar Above Table */}
            <div className="mb-4 bg-white rounded-lg shadow p-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by reference, PNR, or customer name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden relative">
                {fetching && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <BookingsTable 
                        bookings={bookings}
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        navigate={navigate}
                    />
                </div>
            </div>
        </div>
    )
}
