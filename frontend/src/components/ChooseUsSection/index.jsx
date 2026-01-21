import React from 'react'
import { BiSolidPlane } from "react-icons/bi";
import { FaGlobe } from "react-icons/fa";
import { GiFalconMoon } from "react-icons/gi";
import { LuHotel } from "react-icons/lu";

export default function ChooseUsSection() {
    return (
        <section className='main-container py-18 sm:py-24'>
            <div className='flex flex-col items-center'>
                <h3 className='text-center text-[#2A166D] font-semibold!'>WHY CHOOSE US?</h3>
                <div className='flex justify-center mt-2 mb-6'>
                    <div className='relative w-fit'>
                        <h2 className='relative text-center text-[#2A166D] text-3xl sm:text-4xl md:text-5xl z-1'>Why Choose Rihla Access</h2>
                        <div className='absolute bottom-0 left-0 w-full h-[35%] bg-[#d6d30b]/50 rounded-md z-0'></div>
                    </div>
                </div>
                <p className='w-full max-w-5xl sm:text-lg text-center text-neutral-600'>We are a trusted travel agency providing comprehensive services including airline group tickets, visa assistance, Umrah packages, and hotel bookings. Here’s why travelers prefer us:</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12'>
                <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#2A166D]/5 border border-[#2A166D] rounded-3xl overflow-hidden'>
                    <div className='bg-[#2A166D] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
                        <BiSolidPlane className='text-5xl text-[#d6d30b] rotate-90' />
                    </div>

                    <h2 className='text-2xl text-[#2A166D] mt-3 mb-4'>Airline Tickets</h2>
                    <p className='text-center text-neutral-600'>Get instant access to worldwide destinations with competitive pricing and 24/7 booking support for a hassle-free journey.</p>

                    <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
                </div>
                <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#2A166D]/5 border border-[#2A166D] rounded-3xl overflow-hidden'>
                    <div className='bg-[#2A166D] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
                        <FaGlobe className='text-5xl text-[#d6d30b]' />
                    </div>

                    <h2 className='text-2xl text-[#2A166D] mt-3 mb-4'>Visa Services</h2>
                    <p className='text-center text-neutral-600'>Simplify your travel with our high-success visa processing. We handle the paperwork so you can focus on your trip.</p>

                    <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
                </div>
                <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#2A166D]/5 border border-[#2A166D] rounded-3xl overflow-hidden'>
                    <div className='bg-[#2A166D] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
                        <GiFalconMoon className='text-5xl text-[#d6d30b]' />
                    </div>

                    <h2 className='text-2xl text-[#2A166D] mt-3 mb-4'>Umrah Packages</h2>
                    <p className='text-center text-neutral-600'>All-inclusive, spiritually-focused packages featuring premium locations and seamless logistics for a peaceful pilgrimage.</p>

                    <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
                </div>
                <div className='relative group p-4 sm:p-6 flex flex-col items-center bg-[#2A166D]/5 border border-[#2A166D] rounded-3xl overflow-hidden'>
                    <div className='bg-[#2A166D] p-3 rounded-full transition-all duration-500 ease-in-out group-hover:rotate-y-360'>
                        <LuHotel className='text-5xl text-[#d6d30b]' />
                    </div>

                    <h2 className='text-2xl text-[#2A166D] mt-3 mb-4'>Hotel Booking</h2>
                    <p className='text-center text-neutral-600'>From luxury resorts to budget-friendly rooms, we offer vetted accommodations at exclusive rates across the globe.</p>

                    <div className='absolute -top-10 -right-10 w-30 h-30 bg-[#d6d30b]/30 rounded-full transition-all duration-500 ease-in-out group-hover:scale-120'></div>
                </div>
            </div>
        </section>
    )
}