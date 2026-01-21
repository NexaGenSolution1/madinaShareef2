import Booking from '../models/Booking.js';
import GroupTicketing from '../models/GroupTicketing.js';

// Store active timers to prevent duplicates
const activeTimers = new Map();

/**
 * Check if a booking already has an active timer
 */
export const hasBookingTimer = (bookingId) => {
    return activeTimers.has(bookingId);
};

/**
 * Start a 2-hour timer for a booking
 */
// export const startBookingTimer = (bookingId) => {
//     if (activeTimers.has(bookingId)) {
//         return; // Prevent duplicate timers
//     }

//     const timerId = setTimeout(async () => {
//         try {
//             await cancelBookingAfterTimeout(bookingId);
//         } catch (error) {
//             console.error(`Error cancelling booking ${bookingId} after timeout:`, error);
//         } finally {
//             activeTimers.delete(bookingId);
//         }
//     }, 2 * 60 * 60 * 1000); // 2 hours

//     activeTimers.set(bookingId, timerId);
//     console.log(`Timer started for booking ${bookingId}`);
// };

export const startBookingTimer = async (bookingId) => {
    if (activeTimers.has(bookingId)) return;

    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    if (booking.status !== 'on hold' && booking.status !== 'pending') return;

    const createdAt = new Date(booking.createdAt).getTime();
    const expiryTime = createdAt + 2 * 60 * 60 * 1000;
    const now = Date.now();
    const remainingTime = expiryTime - now;

    if (remainingTime <= 0) {
        await cancelBookingAfterTimeout(bookingId);
        return;
    }

    const timerId = setTimeout(async () => {
        try {
            await cancelBookingAfterTimeout(bookingId);
        } finally {
            activeTimers.delete(bookingId);
        }
    }, remainingTime);

    activeTimers.set(bookingId, timerId);

    console.log(
        `Timer started for booking ${bookingId}, expires in ${Math.round(
            remainingTime / 1000
        )}s`
    );
};


/**
 * Cancel booking after timeout and return seats
 */
const cancelBookingAfterTimeout = async (bookingId) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) return;

    if (booking.status !== 'on hold' && booking.status !== 'pending') return;

    booking.status = 'cancelled';
    await booking.save();

    const seatsToReturn = booking.adultsCount + booking.childrenCount;

    await GroupTicketing.updateOne(
        { _id: booking.groupId },
        { $inc: { totalSeats: seatsToReturn } }
    );

    console.log(`Booking ${bookingId} auto-cancelled, seats returned: ${seatsToReturn}`);
};

/**
 * Cancel a timer manually
 */
export const cancelBookingTimer = (bookingId) => {
    if (activeTimers.has(bookingId)) {
        clearTimeout(activeTimers.get(bookingId));
        activeTimers.delete(bookingId);
        console.log(`Timer cancelled for booking ${bookingId}`);
    }
};

/**
 * Initialize timers on server start
 */
export const initializeBookingTimers = async () => {
    const bookings = await Booking.find({
        status: { $in: ['on hold', 'pending'] }
    });

    for (const booking of bookings) {
        const createdAt = new Date(booking.createdAt);
        const expiryTime = createdAt.getTime() + 2 * 60 * 60 * 1000;
        const now = Date.now();

        if (now >= expiryTime) {
            await cancelBookingAfterTimeout(booking._id);
            continue;
        }

        const remainingTime = expiryTime - now;

        const timerId = setTimeout(async () => {
            try {
                await cancelBookingAfterTimeout(booking._id);
            } finally {
                activeTimers.delete(booking._id.toString());
            }
        }, remainingTime);

        activeTimers.set(booking._id.toString(), timerId);
    }

    console.log(`Initialized ${activeTimers.size} booking timers`);
};

/**
 * Remaining time for frontend countdown
 */
export const getBookingRemainingTime = (createdAt) => {
    const expiry = new Date(createdAt).getTime() + 2 * 60 * 60 * 1000;
    const diff = expiry - Date.now();

    if (diff <= 0) {
        return { expired: true, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        expired: false,
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
};
