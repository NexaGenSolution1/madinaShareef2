import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BookingForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const groupData = location.state?.groupData

    const [formData, setFormData] = useState({
        passengerName: '',
        passportNumber: '',
        email: '',
        phone: '',
        adults: 1,
        children: 0,
        infants: 0,
        specialRequests: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const totalPassengers = parseInt(formData.adults) + parseInt(formData.children) + parseInt(formData.infants)
    
    const calculateTotalPrice = () => {
        if (!groupData?.price) return 0
        const adultPrice = groupData.price
        const childPrice = groupData.price * 0.75 // 75% of adult price
        const infantPrice = groupData.price * 0.1 // 10% of adult price
        
        return (
            (parseInt(formData.adults) || 0) * adultPrice +
            (parseInt(formData.children) || 0) * childPrice +
            (parseInt(formData.infants) || 0) * infantPrice
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Booking Data:', { ...formData, groupData })
        // Add API call here
        alert('Booking submitted successfully!')
        navigate('/dashboard/all-groups')
    }

    if (!groupData) {
        return (
            <div className="w-full min-h-screen bg-gray-50 py-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">No flight data available</p>
                    <button
                        onClick={() => navigate('/dashboard/all-groups')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Flights
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-5 rounded-t-xl shadow-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Book Your Flight</h2>
                        <p className="text-blue-200 text-sm">Complete the form below to confirm your booking</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/all-groups')}
                        className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-2xl font-bold"
                        title="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Flight Details Summary */}
                <div className="bg-white border-x border-gray-200 shadow-md">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-5 border-b border-gray-200">
                        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                            </svg>
                            Flight Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Airline</span>
                                    <p className="font-semibold text-gray-900 text-base">{groupData.airline?.airline_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Sector</span>
                                    <p className="font-semibold text-gray-900 text-base">{groupData.sector}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Departure Date</span>
                                    <p className="font-semibold text-gray-900 text-base">
                                        {new Date(groupData.dept_date).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Base Price</span>
                                    <p className="font-bold text-green-600 text-lg">
                                        PKR {groupData.price?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleSubmit} className="bg-white px-8 py-8 rounded-b-xl shadow-xl border-x border-b border-gray-200">
                    <div className="space-y-6">
                        {/* Passenger Information Section */}
                        <div className="pb-6 border-b border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Passenger Information
                            </h4>
                            
                            {/* Passenger Name */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="passengerName"
                                    value={formData.passengerName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter full name as per passport"
                                />
                            </div>

                            {/* Passport Number */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Passport Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="passportNumber"
                                    value={formData.passportNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                                    placeholder="Enter passport number"
                                />
                            </div>

                            {/* Email and Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="+92 300 1234567"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Passenger Type Selection */}
                        <div className="pb-6 border-b border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Number of Passengers
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Adults */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900">Adults</label>
                                            <span className="text-xs text-gray-600">12+ years</span>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        name="adults"
                                        value={formData.adults}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        max={groupData?.available_no_of_pax || 10}
                                        className="w-full px-4 py-3 text-center text-lg font-bold border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                                    />
                                    <p className="text-xs text-center text-blue-700 font-semibold mt-2 bg-white/50 py-1 rounded">100% price</p>
                                </div>
                                
                                {/* Children */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900">Children</label>
                                            <span className="text-xs text-gray-600">2-11 years</span>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        name="children"
                                        value={formData.children}
                                        onChange={handleChange}
                                        min="0"
                                        max={groupData?.available_no_of_pax || 10}
                                        className="w-full px-4 py-3 text-center text-lg font-bold border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all"
                                    />
                                    <p className="text-xs text-center text-green-700 font-semibold mt-2 bg-white/50 py-1 rounded">75% price</p>
                                </div>
                                
                                {/* Infants */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900">Infants</label>
                                            <span className="text-xs text-gray-600">0-2 years</span>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        name="infants"
                                        value={formData.infants}
                                        onChange={handleChange}
                                        min="0"
                                        max={groupData?.available_no_of_pax || 10}
                                        className="w-full px-4 py-3 text-center text-lg font-bold border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
                                    />
                                    <p className="text-xs text-center text-purple-700 font-semibold mt-2 bg-white/50 py-1 rounded">10% price</p>
                                </div>
                            </div>
                            {groupData?.available_no_of_pax && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                    <span className="text-sm text-gray-700">
                                        <span className="font-semibold">Total Passengers:</span> {totalPassengers}
                                    </span>
                                    <span className="text-sm text-gray-700">
                                        <span className="font-semibold">Available Seats:</span> {groupData.available_no_of_pax}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Total Price Summary */}
                        {groupData && (
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-gray-800 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Total Amount
                                    </span>
                                    <span className="text-3xl font-black text-orange-600">
                                        PKR {calculateTotalPrice().toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-y-2 pt-3 border-t border-orange-300">
                                    {formData.adults > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                <span className="font-semibold">{formData.adults}</span> Adult{formData.adults > 1 ? 's' : ''} × PKR {groupData.price?.toLocaleString()}
                                            </span>
                                            <span className="font-semibold text-gray-800">PKR {(formData.adults * groupData.price).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {formData.children > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                <span className="font-semibold">{formData.children}</span> Child{formData.children > 1 ? 'ren' : ''} × PKR {(groupData.price * 0.75).toLocaleString()}
                                            </span>
                                            <span className="font-semibold text-gray-800">PKR {(formData.children * groupData.price * 0.75).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {formData.infants > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                <span className="font-semibold">{formData.infants}</span> Infant{formData.infants > 1 ? 's' : ''} × PKR {(groupData.price * 0.1).toLocaleString()}
                                            </span>
                                            <span className="font-semibold text-gray-800">PKR {(formData.infants * groupData.price * 0.1).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Special Requests */}
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Special Requests
                                <span className="ml-2 text-xs font-normal text-gray-500">(Optional)</span>
                            </h4>
                            <textarea
                                name="specialRequests"
                                value={formData.specialRequests}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="Any special requirements or requests (e.g., meal preferences, wheelchair assistance, etc.)"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/all-groups')}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
