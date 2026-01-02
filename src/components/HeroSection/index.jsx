import React from 'react'
import heroImg from '../../assets/images/hero.webp'
import makkahImg from '../../assets/images/makkah.webp'
import ukImg from '../../assets/images/uk.webp'
import qatarImg from '../../assets/images/qatar.jpg'
import mascatImg from '../../assets/images/mascat.webp'

export default function HeroSection() {
    return (
        <section
            style={{ position: 'relative', backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }}
        >
            <div className='realtive main-container min-h-[60vh] text-white py-20 z-10'>
                {/* <div className='flex flex-col items-center'> */}
                {/* <div className='relative'>
                        <h2 className='relative text-center px-2.5 py-1 text-xl sm:text-2xl md:text-3xl font-semibold! z-1'>Group Ticketing Portal</h2>
                        <div className='absolute inset-0 bg-[#009dc5]/50 z-0'></div>
                    </div> */}

                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-semibold!'>Brother International (Pvt) Ltd</h1>
                {/* </div> */}

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mt-16'>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={makkahImg} alt="makkah-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={ukImg} alt="uk-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={qatarImg} alt="qatar-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={mascatImg} alt="mascat-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={qatarImg} alt="qatar-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={mascatImg} alt="mascat-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={ukImg} alt="uk-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={makkahImg} alt="makkah-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='absolute inset-0 bg-linear-to-t from-black/50 to-black/20 -z-1'></div>
        </section>
    )
}