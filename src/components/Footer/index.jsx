import React from 'react'
import footerImg from '../../assets/images/footer.webp'
import dayjs from 'dayjs'

export default function Footer() {
    return (
        <footer style={{ position: 'relative', backgroundImage: `url(${footerImg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}>
            <div className='main-container min-h-96'>

            </div>

            <div className='main-container flex flex-col md:flex-row justify-between gap-2 py-6 sm:py-10 text-sm sm:text-base text-neutral-300 border-t border-neutral-600'>
                <p>&copy; Brother International. All Rights Reserved {dayjs().year()}.</p>
                <p><span className='text-neutral-100 font-semibold'>Designed & Developed By</span> Nexagen Solution</p>
            </div>

            <div className='absolute inset-0 bg-black/70 -z-1'></div>
        </footer>
    )
}