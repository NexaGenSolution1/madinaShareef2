import { Link } from 'react-router-dom'
import makkahImg from '../../assets/images/makkah.webp'
import ukImg from '../../assets/images/uk.webp'
import qatarImg from '../../assets/images/qatar.jpg'
import mascatImg from '../../assets/images/mascat.webp'
import uaeImg from '../../assets/images/uae.webp'
import bahrainImg from '../../assets/images/bahrain.webp'
import jeddahImg from '../../assets/images/jeddah.webp'
import madinaImg from '../../assets/images/madina.webp'
import { groupTypes } from '../../data/groupTypes'

const groupImages = {
    'All Groups': madinaImg,
    'UAE Groups': bahrainImg,
    'KSA Groups': jeddahImg,
    'Bahrain Groups': uaeImg,
    'Muscat Groups': mascatImg,
    'Qatar Groups': qatarImg,
    'UK Groups': ukImg,
    'Umrah Groups': makkahImg,
}

export default function HeroSection() {
    return (
        <section
            // style={{ backgroundImage: `url(${heroImg})` }}
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)` }}
            className='relative bg-cover bg-center mt-17 md:mt-21 z-1'
        >
            <div className='realtive main-container min-h-[60vh] text-white py-18 sm:py-24 z-10'>
                <div className='flex justify-center'>
                    <div className='relative w-fit'>
                        <h1 className='relative text-white bg-linear-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md border-2 border-white/40 rounded-3xl px-6 py-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-semibold! tracking-wide shadow-2xl shadow-black/50 z-1' >Brother's International Travels</h1>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mt-10 sm:mt-16'>
                    {groupTypes.map((group) => (
                        <Link 
                            key={group.value} 
                            to={group.path} 
                            className='group relative h-48 sm:h-54 rounded-2xl cursor-pointer overflow-hidden'
                        >
                            <img 
                                src={groupImages[group.label]} 
                                alt={`${group.label.toLowerCase()}-img`} 
                                className='w-full h-full object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:-translate-y-3' 
                            />
                            <div className='absolute w-full bottom-0 left-0'>
                                <p className='text-xl font-semibold text-center bg-black/70 text-white p-3 transition-all duration-300 ease-in-out group-hover:bg-black/80'>
                                    {group.label}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* <div className='absolute inset-0 bg-linear-to-t from-black/10 to-transparent -z-1'></div> */}
        </section>
    )
}