import React from 'react'
import aboutImg from '../../assets/images/hero1.webp'
import hangingLights from '../../assets/images/hanging-lights.png'
import moon from '../../assets/images/moon.png'
import dots from '../../assets/images/dots.svg'
import { BsArrowRight } from 'react-icons/bs'

export default function AboutSection() {
    return (
        <section className='relative overflow-hidden'>
            <div className='relative main-container flex flex-col lg:flex-row justify-between gap-12 sm:gap-18 min-h-[50vh] py-18 sm:py-24 z-1'>
                <div className='group relative w-full md:max-w-126 h-80 sm:h-120 rounded-tl-[5%] rounded-br-[5%] rounded-tr-[20%] rounded-bl-[20%] overflow-hidden shadow-lg sm:shadow-xl'>
                    <img src={aboutImg} alt="about-img" loading='lazy' className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />

                    <div className='absolute inset-0 flex items-end justify-end bg-linear-to-t from-black/50 to-transparent'>
                        <h2 className='text-3xl text-white p-6 font-semibold!'>About Us</h2>
                    </div>
                </div>

                <div className='w-full'>
                    <h2 className='text-lg text-[#2A166D] font-semibold!'>About Rihla Access Travels</h2>
                    <div className='relative w-fit mt-4 mb-6'>
                        <h2 className='relative text-[#2A166D] text-3xl sm:text-4xl z-1'>Trusted Travel Services</h2>
                        <div className='absolute bottom-0 left-0 w-full h-[35%] bg-[#d6d30b]/50 rounded-md z-0'></div>
                    </div>
                    {/* <h2 className='text-3xl sm:text-4xl text-neutral-900 mt-4 mb-6'>Trusted Travel Services</h2> */}
                    <p className='text-neutral-700 text-base sm:text-lg mb-4'>
                        If you are looking for a dependable and professional travel partner, Rihla Access Travels is your premier choice. With years of industry expertise, we have built a reputation for excellence and integrity in every journey we plan. We specialize in providing comprehensive travel management, dedicated customer care, and a commitment to making your travel dreams a reality.
                    </p>
                    <p className='text-neutral-700 text-base sm:text-lg mb-4'>
                        <strong className='text-neutral-900'>Expert Travel Solutions</strong><br />
                        Our experienced team ensures smooth bookings, route planning, and exclusive deals for all travelers.
                    </p>
                    <p className='text-neutral-700 text-base sm:text-lg'>
                        <strong className='text-neutral-900'>Personalized Support</strong><br />
                        We focus on individual customer needs, providing one-on-one assistance to make every journey stress-free.
                    </p>

                    <button className='flex items-center gap-2 bg-[#2A166D] text-white border border-[#2A166D] mt-10 px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-[#d6d30b] hover:text-[#2A166D]'>
                        Discover More <BsArrowRight />
                    </button>
                </div>
            </div>

            <img src={hangingLights} alt="hanging-lights" className='hidden sm:block absolute top-0 -right-14 w-100 sm:w-fit opacity-70' />
            <img src={moon} alt="moon" className='absolute bottom-0 -left-4 sm:left-0 opacity-70 max-w-60 sm:max-w-88' />
            <img src={dots} alt="dots" className='absolute top-5 sm:top-16 left-0 lg:left-40 w-40 sm:w-60 opacity-50 bg-no-repeat -z-1' />
        </section>
    )
}