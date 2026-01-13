import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../api/axios'
import { toast } from 'react-toastify'

export default function AllGroups() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axiosInstance.get('/al-haider/available-bookings-by-group', {
                params: {
                    group_type: '0'
                }
            })
            
            if (response.data.success) {
                setGroups(response.data.groups || [])
            } else {
                throw new Error('Failed to fetch groups')
            }
        } catch (err) {
            console.error('Error fetching groups:', err)
            setError(err)
            toast.error('Failed to load groups')
        } finally {
            setLoading(false)
        }
    }

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
        <div className="w-full min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Available Groups</h1>
                    <p className="mt-2 text-gray-600">Browse and book your group travel</p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Flight#
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
                            <tbody className="bg-white divide-y divide-gray-200">
                                {groups.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                            No groups available at the moment
                                        </td>
                                    </tr>
                                ) : (
                                    groups.map((group, index) => {
                                        const firstFlight = group.details?.[0]
                                        const formatDate = (dateStr) => {
                                            const date = new Date(dateStr)
                                            const day = date.getDate().toString().padStart(2, '0')
                                            const month = date.toLocaleDateString('en-US', { month: 'short' })
                                            const year = date.getFullYear()
                                            return `${day} ${month} ${year}`
                                        }
                                        
                                        return (
                                            <React.Fragment key={group.id || index}>
                                                {/* Header row with airline logo and route */}
                                                <tr className="bg-gray-50">
                                                    <td colSpan="8" className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-green-600 text-xl">✈</span>
                                                            <span className="font-semibold text-gray-700">
                                                                {group.airline?.airline_name || 'AIRSIAL'} {group.sector}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                {/* Flight details rows */}
                                                {group.details?.map((flight, flightIndex) => (
                                                    <tr key={`${group.id}-${flight.id}`} className="hover:bg-gray-50 transition-colors border-l-4 border-l-green-500">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-green-500">✈</span>
                                                                {formatDate(flight.flight_date)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {flight.flight_no}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {flight.origin}-{flight.destination}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {flight.dept_time?.substring(0, 5)}-{flight.arv_time?.substring(0, 5)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {flight.baggage || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {group.meal || 'No'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                            {flightIndex === 0 ? `PKR ${group.price?.toLocaleString()}` : ''}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                            {flightIndex === 0 && (
                                                                <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-xs font-medium">
                                                                    Book now
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}