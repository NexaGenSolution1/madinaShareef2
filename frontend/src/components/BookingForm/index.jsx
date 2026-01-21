// import React, { useState, useEffect } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import axiosInstance from '../../api/axios'
import { toast } from 'react-toastify'
import { buildPassengers } from '../../utils/passengerBuilder'
import MaskedDatePicker from '../MaskedDatePicker'
// import { parse, isValid } from "date-fns";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

export default function BookingForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id: bookingId } = useParams()
    const isEditMode = !!bookingId

    const [formData, setFormData] = useState({
        contactPersonName: 'N/A',
        adults: 1,
        children: 0,
        infants: 0,
        passengers: []
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingBooking, setLoadingBooking] = useState(isEditMode)
    const [existingBooking, setExistingBooking] = useState(null)
    const [groupData, setGroupData] = useState(location.state?.groupData || null)

    // console.log('BookingForm loaded with groupData:', groupData, 'editMode:', isEditMode, 'bookingId:', bookingId)

    // Load existing booking if in edit mode
    useEffect(() => {
        if (isEditMode && bookingId) {
            fetchBookingForEdit()
        }
    }, [bookingId, isEditMode])

    const fetchBookingForEdit = async () => {
        try {
            setLoadingBooking(true)
            const response = await axiosInstance.get(`/bookings/${bookingId}`)

            if (response.data.success) {
                const booking = response.data.data

                // Check if booking can be edited
                if (booking.status !== 'on hold') {
                    toast.error('Can only edit pending bookings')
                    navigate('/dashboard/my-bookings')
                    return
                }

                setExistingBooking(booking)

                // Reconstruct groupData from booking for display and pricing
                const reconstructedGroupData = {
                    id: booking.groupId,
                    type: booking.groupType,
                    airline: {
                        id: booking.airline?.id || null,
                        airline_name: booking.airline?.name || '',
                        logo_url: booking.airline?.logoUrl || ''
                    },
                    sector: booking.sector,
                    pnr: booking.pnr,
                    price: booking.pricing?.adultPrice || 0,
                    childPrice: booking.pricing?.childPrice || 0,
                    infantPrice: booking.pricing?.infantPrice || 0,
                    dept_date: booking.departureDate,
                    arv_date: booking.arrivalDate,
                    details: booking.flights?.map(flight => ({
                        flight_no: flight.flightNo,
                        flight_date: flight.flightDate,
                        dep_date: flight.depDate,
                        dept_time: flight.depTime,
                        origin: flight.origin,
                        destination: flight.destination,
                        arv_date: flight.arrDate,
                        arv_time: flight.arrTime,
                        baggage: flight.baggage,
                        meal: flight.meal
                    })) || [],
                    available_no_of_pax: 50 // Set a high limit for editing
                }

                setGroupData(reconstructedGroupData)

                // Convert date strings to YYYY-MM-DD format for date inputs
                const formattedPassengers = booking.passengers?.map(passenger => ({
                    ...passenger,
                    dateOfBirth: passenger.dateOfBirth ? new Date(passenger.dateOfBirth).toISOString().split('T')[0] : '',
                    passportExpiry: passenger.passportExpiry ? new Date(passenger.passportExpiry).toISOString().split('T')[0] : ''
                })) || []

                setFormData({
                    // contactPersonName: booking.contactPersonName,
                    adults: booking.adultsCount,
                    // children: booking.childrenCount,
                    infants: booking.infantsCount,
                    passengers: formattedPassengers
                })
            }
        } catch (error) {
            console.error('Error fetching booking:', error)
            toast.error('Failed to load booking')
            navigate('/dashboard/my-bookings')
        } finally {
            setLoadingBooking(false)
        }
    }

    const totalPassengers = (parseInt(formData.adults) || 0) + (parseInt(formData.children) || 0) + (parseInt(formData.infants) || 0)

    // Helper functions to check if prices are available
    const isChildPriceAvailable = () => {
        const price = groupData?.childPrice
        return price !== null && price !== undefined && price !== 0
    }

    const isInfantPriceAvailable = () => {
        const price = groupData?.infantPrice
        return price !== null && price !== undefined && price !== 0
    }

    // Initialize passenger array when counts change
    // useEffect(() => {
    //     const currentPassengers = formData.passengers || []
    //     const targetAdults = parseInt(formData.adults) || 0
    //     const targetChildren = parseInt(formData.children) || 0
    //     const targetInfants = parseInt(formData.infants) || 0

    //     const passengers = []

    //     // Add adults - preserve existing data if available
    //     for (let i = 0; i < targetAdults; i++) {
    //         const existing = currentPassengers.find((p, idx) => p.type === 'Adult' && currentPassengers.filter((x, xIdx) => xIdx < idx && x.type === 'Adult').length === i)
    //         passengers.push(existing || {
    //             type: 'Adult',
    //             title: 'Mr',
    //             givenName: '',
    //             surName: '',
    //             passport: '',
    //             dateOfBirth: '',
    //             passportExpiry: '',
    //             nationality: ''
    //         })
    //     }

    //     // Add children - preserve existing data if available (only if price available in create mode)
    //     if (!isEditMode || isChildPriceAvailable()) {
    //         for (let i = 0; i < targetChildren; i++) {
    //             const existing = currentPassengers.find((p, idx) => p.type === 'Child' && currentPassengers.filter((x, xIdx) => xIdx < idx && x.type === 'Child').length === i)
    //             passengers.push(existing || {
    //                 type: 'Child',
    //                 title: 'Mr',
    //                 givenName: '',
    //                 surName: '',
    //                 passport: '',
    //                 dateOfBirth: '',
    //                 passportExpiry: '',
    //                 nationality: ''
    //             })
    //         }
    //     }

    //     // Add infants - preserve existing data if available (only if price available in create mode)
    //     if (!isEditMode || isInfantPriceAvailable()) {
    //         for (let i = 0; i < targetInfants; i++) {
    //             const existing = currentPassengers.find((p, idx) => p.type === 'Infant' && currentPassengers.filter((x, xIdx) => xIdx < idx && x.type === 'Infant').length === i)
    //             passengers.push(existing || {
    //                 type: 'Infant',
    //                 title: 'INF',
    //                 givenName: '',
    //                 surName: '',
    //                 passport: '',
    //                 dateOfBirth: '',
    //                 passportExpiry: '',
    //                 nationality: ''
    //             })
    //         }
    //     }

    //     setFormData(prev => ({ ...prev, passengers }))
    // }, [formData.adults, formData.children, formData.infants, isEditMode])


    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            passengers: buildPassengers({
                adults: +prev.adults || 0,
                children: +prev.children || 0,
                infants: +prev.infants || 0,
                existing: prev.passengers,
                allowChildren: isEditMode || isChildPriceAvailable(),
                allowInfants: isEditMode || isInfantPriceAvailable(),
            }),
        }));
    }, [formData.adults, formData.children, formData.infants, isEditMode]);


    // Helper function to validate passenger input
    const validatePassengerInput = (name, value) => {
        // Allow empty string during editing
        if (value === '') return true

        const numValue = parseInt(value)

        // Block negative values
        if (numValue < 0) return false

        // Adults must be at least 1
        if (name === 'adults' && numValue === 0) return false

        return true
    }

    const formatDateInput = (value) => {
        // Remove everything except digits
        const digits = value.replace(/\D/g, "");

        let result = "";

        if (digits.length <= 2) {
            result = digits;
        } else if (digits.length <= 4) {
            result = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
            result = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        }

        return result;
    };


    // Helper function to get default passenger value
    const getDefaultPassengerValue = (name) => {
        return name === 'adults' ? 1 : 0
    }

    // Helper function to validate seat limits
    const validateSeatLimit = (adults, children) => {
        if (isEditMode) return true

        const totalSeats = adults + children
        const availableSeats = groupData?.available_no_of_pax || 0

        return totalSeats <= availableSeats
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        // Validate passenger count fields
        if (['adults', 'children', 'infants'].includes(name)) {
            if (!validatePassengerInput(name, value)) {
                return // Block invalid input
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePassengerBlur = (e) => {
        const { name, value } = e.target

        // Not a passenger field
        if (!['adults', 'children', 'infants'].includes(name)) return

        // Set default if empty or invalid
        if (value === '' || parseInt(value) < 0 || (name === 'adults' && parseInt(value) === 0)) {
            const defaultValue = getDefaultPassengerValue(name)
            setFormData(prev => ({ ...prev, [name]: defaultValue }))
            return
        }

        // Validate seat limit for adults and children (excluding infants)
        if (!isEditMode && (name === 'adults' || name === 'children')) {
            const adults = name === 'adults' ? parseInt(value) : (parseInt(formData.adults) || 0)
            const children = name === 'children' ? parseInt(value) : (parseInt(formData.children) || 0)

            if (!validateSeatLimit(adults, children)) {
                const totalSeats = adults + children
                const availableSeats = groupData?.available_no_of_pax || 0

                toast.error(
                    `Seats not available! You selected ${totalSeats} seats but only ${availableSeats} are available.`,
                    { toastId: 'seat-limit-error' }
                )

                // Reset to default value
                const defaultValue = getDefaultPassengerValue(name)
                setFormData(prev => ({ ...prev, [name]: defaultValue }))
                e.target.focus()
            }
        }
    }

    const handlePassengerChange = (index, field, value) => {
        setFormData(prev => {
            const newPassengers = [...prev.passengers]
            newPassengers[index] = { ...newPassengers[index], [field]: value }
            return { ...prev, passengers: newPassengers }
        })
    }

    const calculateTotalPrice = () => {
        if (!groupData?.price) return 0
        const adultPrice = groupData.price || 0
        const childPrice = groupData.childPrice || groupData.price || 0
        const infantPrice = groupData.infantPrice || (groupData.price * 0.24) || 0

        return (
            (parseInt(formData.adults) || 0) * adultPrice +
            (parseInt(formData.children) || 0) * childPrice +
            (parseInt(formData.infants) || 0) * infantPrice
        )
    }

    const calculateAdultTotal = () => (parseInt(formData.adults) || 0) * (groupData?.price || 0)
    const calculateChildTotal = () => (parseInt(formData.children) || 0) * (groupData?.childPrice || groupData?.price || 0)
    const calculateInfantTotal = () => (parseInt(formData.infants) || 0) * (groupData?.infantPrice || ((groupData?.price || 0) * 0.24))

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isEditMode) {
            // Edit mode - simplified update
            return handleUpdate()
        }

        // Validate contact person name
        // if (!formData.contactPersonName.trim()) {
        //     toast.error('Contact person name is required')
        //     return
        // }

        // Validate passenger count excluding infants
        const payingPassengers = (parseInt(formData.adults) || 0) + (parseInt(formData.children) || 0)
        if (payingPassengers > (groupData?.available_no_of_pax || 0)) {
            toast.error(`Adults and Children (${payingPassengers}) cannot exceed available seats (${groupData?.available_no_of_pax || 0})`)
            return
        }

        // Validate all passenger details are filled
        const hasEmptyFields = formData.passengers.some(passenger =>
            !passenger.givenName ||
            !passenger.surName ||
            !passenger.passport ||
            !passenger.dateOfBirth ||
            !passenger.passportExpiry ||
            !passenger.nationality
        )

        if (hasEmptyFields) {
            toast.error('Please fill in all passenger details')
            return
        }

        setIsSubmitting(true)

        try {
            // Prepare booking data according to API schema
            const bookingData = {
                groupId: groupData.id,
                groupType: groupData.type,
                airline: {
                    id: groupData.airline?.id || null,
                    name: groupData.airline?.airline_name || '',
                    logoUrl: groupData.airline?.logo_url || ''
                },
                sector: groupData.sector,
                pnr: groupData.pnr || '',
                contactPersonName: "N/A",
                adultsCount: parseInt(formData.adults),
                childrenCount: parseInt(formData.children),
                infantsCount: parseInt(formData.infants),
                totalPassengers: totalPassengers,
                pricing: {
                    adultPrice: groupData.price || 0,
                    childPrice: groupData.childPrice || 0,
                    infantPrice: groupData.infantPrice || (groupData.price * 0.24) || 0,
                    adultTotal: calculateAdultTotal(),
                    childTotal: calculateChildTotal(),
                    infantTotal: Math.round(calculateInfantTotal()),
                    grandTotal: Math.round(calculateTotalPrice())
                },
                passengers: formData.passengers,
                flights: groupData.details?.map(flight => ({
                    flightNo: flight.flight_no,
                    flightDate: flight.flight_date,
                    depDate: flight.dep_date,
                    depTime: flight.dept_time,
                    origin: flight.origin,
                    destination: flight.destination,
                    arrDate: flight.arv_date,
                    arrTime: flight.arv_time,
                    baggage: flight.baggage,
                    meal: flight.meal
                })) || [],
                departureDate: groupData.dept_date,
                arrivalDate: groupData.arv_date
            }

            console.log('Submitting booking data:', bookingData)

            const response = await axiosInstance.post('/bookings', bookingData)

            if (response.data.success) {
                toast.success(`Booking confirmed! Reference: ${response.data.data.bookingReference}`)
                // Navigate to bookings page or show confirmation
                setTimeout(() => {
                    navigate('/dashboard/all-groups', {
                        state: {
                            bookingSuccess: true,
                            bookingReference: response.data.data.bookingReference
                        }
                    })
                }, 1500)
            }
        } catch (error) {
            console.error('Error creating booking:', error)
            const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async () => {
        setIsSubmitting(true)

        try {
            const updateData = {
                contactPersonName: formData.contactPersonName,
                adultsCount: parseInt(formData.adults),
                childrenCount: parseInt(formData.children),
                infantsCount: parseInt(formData.infants),
                passengers: formData.passengers,
                // Recalculate pricing based on new passenger counts
                pricing: {
                    adultPrice: groupData?.price || 0,
                    childPrice: groupData?.childPrice || 0,
                    infantPrice: groupData?.infantPrice || 0,
                    adultTotal: calculateAdultTotal(),
                    childTotal: calculateChildTotal(),
                    infantTotal: Math.round(calculateInfantTotal()),
                    grandTotal: Math.round(calculateTotalPrice())
                }
            }

            console.log('Updating booking:', updateData)

            const response = await axiosInstance.put(`/bookings/${bookingId}`, updateData)

            if (response.data.success) {
                toast.success('Booking updated successfully')
                setTimeout(() => {
                    navigate('/dashboard/my-bookings')
                }, 1500)
            }
        } catch (error) {
            console.error('Error updating booking:', error)
            const errorMessage = error.response?.data?.message || 'Failed to update booking'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!groupData && !isEditMode) {
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

    if (loadingBooking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading booking...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen mx-auto flex flex-col gap-2">
            <div className="mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{isEditMode ? 'Edit' : 'Add New'} Booking</h1>
                <p className="text-sm sm:text-base text-gray-600">
                    {isEditMode ? 'Update passenger details and booking information' : 'Fill in the passenger details to complete your booking'}
                </p>
            </div>
            <div className="bg-white border border-gray-300 shadow-sm rounded-2xl">
                {groupData && (
                    <div className="px-4 py-2 flex flex-row justify-between gap-3 items-center border-b border-gray-200 text-xs">
                        {/* Airline Logo */}
                        <>
                            {groupData.airline?.logo_url && (
                                <img src={groupData.airline.logo_url} alt={groupData.airline.airline_name} className="w-20 h-auto" />
                            )}
                        </>

                        {/* Sector Information */}
                        <div className="flex flex-col">
                            <p className="text-xs text-gray-600 font-semibold mb-0.5">Sector Information</p>
                            {groupData.details && groupData.details.length > 0 && (
                                <div className="text-xs font-bold text-gray-900">
                                    {groupData.details.map((flight, idx) => (
                                        <div key={idx}>
                                            {flight.flight_no} {new Date(flight.flight_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} {flight.origin}-{flight.destination} {flight.dept_time?.substring(0, 5)} {flight.arv_time?.substring(0, 5)} {flight.baggage || '20+07-KG'} Baggage
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dep Date */}
                        <div className="flex flex-col text-center">
                            <p className="text-xs text-gray-600 font-semibold mb-0.5">Dep Date</p>
                            <p className="text-xs font-bold text-gray-900">
                                {new Date(groupData.dept_date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Meal */}
                        <div className="flex flex-col text-center">
                            <p className="text-xs text-gray-600 font-semibold mb-0.5">Meal</p>
                            <p className="text-xs font-bold text-gray-900">Yes</p>
                        </div>

                        {/* Pricing Info */}
                        <div className="flex flex-row just items-center gap-32 text-center">
                            <div className='flex flex-col'>
                                <p className="text-xs text-gray-600 font-semibold mb-0.5">Adult Price</p>
                                <p className="text-sm font-extrabold text-[#3d6a8f] bg-blue-50 px-2 py-1 rounded-2xl">PKR {groupData?.price?.toLocaleString() || 0}</p>
                            </div>
                            {isChildPriceAvailable() && (
                                <div className='flex flex-col'>
                                    <p className="text-xs text-gray-600 font-semibold mt-1 mb-0.5">Child</p>
                                    {/* <p className="text-sm font-extrabold text-[#3d6a8f] bg-blue-50 px-2 py-1 rounded">PKR {groupData?.childPrice?.toLocaleString()}</p> */}
                                    <p className="text-sm font-semibold text-white bg-red-600 px-2 py-1 rounded-2xl">N/A</p>
                                </div>
                            )}

                            {isInfantPriceAvailable() && (
                                <div className='flex flex-col'>
                                    <p className="text-xs text-gray-600 font-semibold mt-1 mb-0.5">Infant</p>
                                    <p className={`text-sm font-extrabold px-2 py-1 rounded-2xl ${groupData?.infantPrice ? "text-[#3d6a8f] bg-blue-50" : "text-white bg-red-600"}`}>{`${groupData?.infantPrice ? `PKR ${groupData.infantPrice.toLocaleString()}` : "Price On Call"}`}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Contact Person Name */}
                {/* <div className="bg-white border border-gray-300 shadow-sm p-4 rounded">
                    <label className="block mb-2">
                        <span className="text-sm font-semibold text-gray-700 mb-2 block">Contact Person Name <span className="text-red-500">*</span></span>
                        <input
                            type="text"
                            name="contactPersonName"
                            value={formData.contactPersonName}
                            onChange={handleChange}
                            placeholder="Enter contact person's full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>
                    <p className="text-xs text-gray-600 mt-1">This person will be the primary contact for this booking</p>
                </div> */}

                {/* Passengers and Pricing Table */}
                <div className="bg-white border border-gray-300 shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#3d6a8f] text-white">
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20 w-2/6">Passengers</th>
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20 w-2/6">Price</th>
                                <th className="px-3 py-2 text-center text-xs font-bold border-r border-white/20 w-1/6">Seats</th>
                                <th className="px-3 py-2 text-right text-xs font-bold w-1/6">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Adult Row */}
                            <tr className="border-b border-gray-200">
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-1/4 font-medium text-gray-900">Adult</span>
                                        <div className='w-3/4'>
                                            <input
                                                type="number"
                                                name="adults"
                                                value={formData.adults}
                                                onChange={handleChange}
                                                onBlur={handlePassengerBlur}
                                                min="1"
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-center text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-xs font-medium text-gray-900 border-r border-gray-200">
                                    PKR {groupData?.price?.toLocaleString() || 0}
                                </td>
                                <td className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-200">
                                    {formData.adults}
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                                    PKR {calculateAdultTotal().toLocaleString()}
                                </td>
                            </tr>

                            {/* Children Row */}
                            {/* {(isEditMode || isChildPriceAvailable()) && (
                                <tr className="border-b border-gray-200">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs w-1/4 font-medium text-gray-900">Children</span>
                                            <div className='w-3/4'>
                                                <input
                                                    type="number"
                                                    name="children"
                                                    value={formData.children}
                                                    onChange={handleChange}
                                                    onBlur={handlePassengerBlur}
                                                    min="0"
                                                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-center text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-xs font-medium text-gray-900 border-r border-gray-200">
                                        PKR {groupData?.childPrice?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-200">
                                        {formData.children}
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                                        PKR {calculateChildTotal().toLocaleString()}
                                    </td>
                                </tr>
                            )} */}

                            {/* Infants Row */}
                            <tr className="border-b border-gray-200">
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-1/4 font-medium text-gray-900">Infants</span>
                                        <div className='w-3/4'>
                                            <input
                                                type="number"
                                                name="infants"
                                                value={formData.infants}
                                                onChange={handleChange}
                                                onBlur={handlePassengerBlur}
                                                min="0"
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-center text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-xs font-medium border-r border-gray-200">
                                    {isInfantPriceAvailable() ? (
                                        <span className="text-gray-900">PKR {groupData?.infantPrice?.toLocaleString()}</span>
                                    ) : (
                                        <span className="text-red-500 font-semibold">Price On Call</span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-200">
                                    {formData.infants}
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                                    {isInfantPriceAvailable() ? `PKR ${Math.round(calculateInfantTotal()).toLocaleString()}` : '-'}
                                </td>
                            </tr>

                            {/* Total Row */}
                            <tr className="bg-gray-100">
                                <td colSpan="2" className="px-3 py-2 text-xs font-bold text-gray-900">
                                    Total
                                </td>
                                <td className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-200">
                                    {totalPassengers}
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-bold text-[#3d6a8f]">
                                    PKR {Math.round(calculateTotalPrice()).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Passenger Details Table */}
                <div className="bg-white border border-gray-300 shadow-sm overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#3d6a8f] text-white">
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20">SR#</th>
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20">Title</th>
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20">Surname</th>
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20">Given Name</th>
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20">Passport No</th>
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20">Date Of Birth</th>
                                <th className="px-3 py-2 text-left text-xs font-bold border-r border-white/20">Passport Expiry</th>
                                <th className="px-3 py-2 text-left text-xs font-bold">Nationality</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.passengers.map((passenger, index) => {
                                let passengerLabel = ''
                                if (passenger.type === 'Adult') {
                                    const adultNum = formData.passengers.slice(0, index + 1).filter(p => p.type === 'Adult').length
                                    passengerLabel = `Adult ${adultNum}`
                                } else if (passenger.type === 'Child') {
                                    const childNum = formData.passengers.slice(0, index + 1).filter(p => p.type === 'Child').length
                                    passengerLabel = `Child ${childNum}`
                                } else if (passenger.type === 'Infant') {
                                    const infantNum = formData.passengers.slice(0, index + 1).filter(p => p.type === 'Infant').length
                                    passengerLabel = `Infant ${infantNum}`
                                }

                                return (
                                    <tr key={index} className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                                        <td className="px-3 py-2 text-xs font-medium text-gray-900">{passengerLabel}</td>
                                        <td className="px-3 py-2">
                                            <select
                                                value={passenger.title}
                                                onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                                                required
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {/* <option value="">{passenger.type === 'Infant' ? 'INF' : passenger.type === 'Child' ? 'CHLD' : 'Mr'}</option> */}
                                                {passenger.type === 'Adult' && (
                                                    <>
                                                        <option value="Mr">Mr</option>
                                                        <option value="Mrs">Mrs</option>
                                                        <option value="Ms">Ms</option>
                                                    </>
                                                )}
                                                {passenger.type === 'Child' && <option value="CHLD">CHLD</option>}
                                                {passenger.type === 'Infant' && <option value="INF">INF</option>}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={passenger.surName}
                                                onChange={(e) => handlePassengerChange(index, 'surName', e.target.value)}
                                                required
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Surname"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={passenger.givenName}
                                                onChange={(e) => handlePassengerChange(index, 'givenName', e.target.value)}
                                                required
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Given Name"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={passenger.passport}
                                                onChange={(e) => handlePassengerChange(index, 'passport', e.target.value)}
                                                required
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Passport No"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            {/* <DatePicker
                                                selected={passenger.dateOfBirth}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="DD/MM/YYYY"

                                                onChange={(date) =>
                                                    handlePassengerChange(index, "dateOfBirth", date)
                                                }

                                                onChangeRaw={(e) => {
                                                    const formatted = formatDateInput(e.target.value);
                                                    e.target.value = formatted;

                                                    if (formatted.length === 10) {
                                                        const parsed = parse(formatted, "dd/MM/yyyy", new Date());

                                                        if (isValid(parsed)) {
                                                            handlePassengerChange(index, "dateOfBirth", parsed);
                                                        }
                                                    }
                                                }}

                                                onKeyDown={(e) => {
                                                    const allowed = [
                                                        "Backspace",
                                                        "Tab",
                                                        "ArrowLeft",
                                                        "ArrowRight",
                                                        "Delete",
                                                    ];

                                                    if (!allowed.includes(e.key) && !/\d/.test(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}

                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            /> */}
                                            <MaskedDatePicker
                                                value={passenger.dateOfBirth}
                                                onChange={(date) =>
                                                    handlePassengerChange(index, "dateOfBirth", date)
                                                }
                                                size="small"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            {/* <DatePicker
                                                selected={passenger.passportExpiry}
                                                onChange={(date) =>
                                                    handlePassengerChange(index, 'passportExpiry', date)
                                                }
                                                onChangeRaw={(e) => {
                                                    const value = e.target.value;
                                                    const parsedDate = parse(value, "dd/MM/yyyy", new Date());
                                                    if (isValid(parsedDate)) {
                                                        handlePassengerChange(index, 'passportExpiry', parsedDate);
                                                    }
                                                }}
                                                placeholderText="Passport Expiry"
                                                dateFormat="dd/MM/yyyy"
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            /> */}



                                            {/* <DatePicker
                                                selected={passenger.dateOfBirth}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="DD/MM/YYYY"

                                                onChange={(date) =>
                                                    handlePassengerChange(index, "passportExpiry", date)
                                                }

                                                onChangeRaw={(e) => {
                                                    const formatted = formatDateInput(e.target.value);
                                                    e.target.value = formatted;

                                                    if (formatted.length === 10) {
                                                        const parsed = parse(formatted, "dd/MM/yyyy", new Date());

                                                        if (isValid(parsed)) {
                                                            handlePassengerChange(index, "passportExpiry", parsed);
                                                        }
                                                    }
                                                }}

                                                onKeyDown={(e) => {
                                                    const allowed = [
                                                        "Backspace",
                                                        "Tab",
                                                        "ArrowLeft",
                                                        "ArrowRight",
                                                        "Delete",
                                                    ];

                                                    if (!allowed.includes(e.key) && !/\d/.test(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}

                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                            /> */}

                                            <MaskedDatePicker
                                                value={passenger.passportExpiry}
                                                onChange={(date) =>
                                                    handlePassengerChange(index, "passportExpiry", date)
                                                }
                                                size="small"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={passenger.nationality || ''}
                                                onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nationality"
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 bg-white border-t border-gray-200 flex justify-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-2 rounded text-sm font-bold shadow transform transition-all duration-300 ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#3d6a8f] text-white hover:bg-[#2d5a8f] hover:scale-105 hover:shadow-lg active:scale-95'}`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            isEditMode ? 'Update Booking' : 'Confirm Booking'
                        )}
                    </button>
                </div>
            </form>
        </div>
        // </div>
    )
}