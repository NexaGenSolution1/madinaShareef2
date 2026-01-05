import React from 'react'
import heroImg from '../../assets/images/hero.webp'
import makkahImg from '../../assets/images/makkah.webp'
import ukImg from '../../assets/images/uk.webp'
import qatarImg from '../../assets/images/qatar.jpg'
import mascatImg from '../../assets/images/mascat.webp'
import uaeImg from '../../assets/images/uae.webp'
import bahrainImg from '../../assets/images/bahrain.webp'
import jeddahImg from '../../assets/images/jeddah.webp'
import madinaImg from '../../assets/images/madina.webp'

export default function HeroSection() {
    return (
        <section
            style={{ backgroundImage: `url(${heroImg})` }}
            className='relative bg-cover bg-center mt-17 md:mt-21 z-1'
        >
            <div className='realtive main-container min-h-[60vh] text-white py-18 sm:py-24 z-10'>
                <div className='flex justify-center'>
                    <div className='relative w-fit'>
                        <h1 className='relative text-[#2A166D] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-semibold! z-1'>Brothers International Travel</h1>
                        {/* <div className='absolute bottom-0 left-0 w-full h-[35%] bg-[#d6d30b] rounded-md z-0'></div> */}
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mt-10 sm:mt-16'>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={makkahImg} alt="makkah-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Umrah Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={ukImg} alt="uk-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>UK Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={qatarImg} alt="qatar-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Qatar Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={mascatImg} alt="mascat-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Mascat Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={uaeImg} alt="uae-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>Bahrain Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={bahrainImg} alt="bahrain-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>UAE Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={jeddahImg} alt="jeddah-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>KSA Groups</p>
                        </div>
                    </div>
                    <div className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'>
                        <img src={madinaImg} alt="madina-img" className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' />
                        <div className='absolute w-full bottom-0 left-0'>
                            <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>All Groups</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className='absolute inset-0 bg-linear-to-t from-black/10 to-transparent -z-1'></div> */}
        </section>
    )
}