// import Booking from '../models/Booking.js';
// import GroupTicketing from '../models/GroupTicketing.js';

// // Store active timers to prevent duplicates
// const activeTimers = new Map();

// /**
//  * Start a 2-hour timer for a booking
//  * After 2 hours, the booking status is automatically updated to 'cancelled'
//  * and the seats are returned to the group
//  */
// export const startBookingTimer = (bookingId) => {
//     // Cancel existing timer if any
//     if (activeTimers.has(bookingId)) {
//         clearTimeout(activeTimers.get(bookingId));
//     }

//     // Set a 2-hour timer
//     const timerId = setTimeout(async () => {
//         try {
//             await cancelBookingAfterTimeout(bookingId);
//         } catch (error) {
//             console.error(`Error cancelling booking ${bookingId} after timeout:`, error);
//         } finally {
//             // Remove from active timers
//             activeTimers.delete(bookingId);
//         }
//     }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds

//     // Store the timer ID
//     activeTimers.set(bookingId, timerId);

//     console.log(`Timer started for booking ${bookingId}`);
// };

// /**
//  * Cancel booking after timeout and return seats to group
//  */
// const cancelBookingAfterTimeout = async (bookingId) => {
//     try {
//         // Find the booking
//         const booking = await Booking.findById(bookingId);

//         if (!booking) {
//             console.log(`Booking ${bookingId} not found`);
//             return;
//         }

//         // Only cancel if still in 'on hold' or 'pending' status
//         if (booking.status !== 'on hold' && booking.status !== 'pending') {
//             console.log(`Booking ${bookingId} is no longer 'on hold', skipping cancellation`);
//             return;
//         }

//         // Update booking status to 'cancelled'
//         booking.status = 'cancelled';
//         await booking.save();

//         // Return seats to the group (only adults + children)
//         const seatsToReturn = booking.adultsCount + booking.childrenCount;
//         await GroupTicketing.updateOne(
//             { _id: booking.groupId },
//             { $inc: { totalSeats: seatsToReturn } }
//         );

//         console.log(`Booking ${bookingId} automatically cancelled after 2 hours. Returned ${seatsToReturn} seats to group ${booking.groupId}`);
//     } catch (error) {
//         console.error(`Error in cancelBookingAfterTimeout for booking ${bookingId}:`, error);
//         throw error;
//     }
// };

// /**
//  * Cancel a timer for a booking (when booking is manually confirmed or cancelled)
//  */
// export const cancelBookingTimer = (bookingId) => {
//     if (activeTimers.has(bookingId)) {
//         clearTimeout(activeTimers.get(bookingId));
//         activeTimers.delete(bookingId);
//         console.log(`Timer cancelled for booking ${bookingId}`);
//     }
// };

// /**
//  * Initialize timers for all 'on hold' bookings from the database
//  * (useful for server restart scenarios)
//  */
// export const initializeBookingTimers = async () => {
//     try {
//         // Find all 'on hold' bookings
//         const onHoldBookings = await Booking.find({ status: 'on hold' });

//         console.log(`Initializing timers for ${onHoldBookings.length} on-hold bookings`);

//         for (const booking of onHoldBookings) {
//             const createdAt = new Date(booking.createdAt);
//             const expiryTime = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours
//             const now = new Date();

//             if (now < expiryTime) {
//                 // Timer hasn't expired yet, start a new timer
//                 const remainingTime = expiryTime - now;
//                 const timerId = setTimeout(async () => {
//                     try {
//                         await cancelBookingAfterTimeout(booking._id);
//                     } catch (error) {
//                         console.error(`Error cancelling booking ${booking._id} after timeout:`, error);
//                     } finally {
//                         activeTimers.delete(booking._id);
//                     }
//                 }, remainingTime);

//                 activeTimers.set(booking._id, timerId);
//                 console.log(`Timer re-initialized for booking ${booking._id}, expires in ${Math.round(remainingTime / 1000)} seconds`);
//             } else {
//                 // Timer has expired, cancel the booking
//                 console.log(`Booking ${booking._id} timer has expired, cancelling now`);
//                 await cancelBookingAfterTimeout(booking._id);
//             }
//         }

//         console.log('Booking timer initialization complete');
//     } catch (error) {
//         console.error('Error initializing booking timers:', error);
//     }
// };

// /**
//  * Get remaining time for a booking (for frontend display)
//  */
// export const getBookingRemainingTime = (createdAt) => {
//     const createdDate = new Date(createdAt);
//     const expiryDate = new Date(createdDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours
//     const now = new Date();
//     const diff = expiryDate - now;

//     if (diff <= 0) {
//         return { hours: 0, minutes: 0, seconds: 0, expired: true };
//     }

//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((diff % (1000 * 60)) / 1000);

//     return { hours, minutes, seconds, expired: false };
// };


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
