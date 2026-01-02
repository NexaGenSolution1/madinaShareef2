import React from 'react'
import service1 from '../../assets/images/service1.webp'
import service2 from '../../assets/images/service2.webp'
import service3 from '../../assets/images/service3.jpg'
import service4 from '../../assets/images/service4.webp'
import service5 from '../../assets/images/service5.webp'
import service6 from '../../assets/images/service6.webp'

const services = [
    {
        id: 1,
        title: 'Air Tickets',
        description: 'We arrange safe, comfortable air tickets, activities, and hotels for your stay.',
        image: service1
    },
    {
        id: 2,
        title: 'Umrah Packages',
        description: 'We offer Umrah travel packages for groups and affordable deals with top service quality.',
        image: service2
    },
    {
        id: 3,
        title: 'Visa Services',
        description: 'Efficient visa services for seamless international travel with expert guidance.',
        image: service3
    },
    {
        id: 4,
        title: 'Hotel Packages',
        description: 'Luxurious hotel stays with curated experiences at top destinations worldwide.',
        image: service4
    },
    {
        id: 5,
        title: 'Travel Consultancy',
        description: 'Expert guidance, personalized bookings, and travel tips for unforgettable adventures.',
        image: service5
    },
    {
        id: 6,
        title: 'Meet & Assist',
        description: 'Seamless meet and assist services for stress-free airport experiences.',
        image: service6
    },
]

export default function ServicesSection() {
    return (
        <section className='min-h-[90vh] bg-linear-to-br from-[#fffffc] to-[#fffee0] py-18 sm:py-24'>
            <div className='main-container'>
                <h2 className='text-center text-[#2A166D] text-3xl sm:text-4xl md:text-5xl mb-16'>Our Services</h2>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
                    {services.map(service => (
                        <div key={service.id} className='group rounded-2xl sm:rounded-3xl shadow overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1.5'>
                            <div>
                                <img src={service.image} alt={service.title} className='w-full h-60 object-cover object-center transition-all duration-300 ease-in-out group-hover:scale-110' />
                            </div>

                            <div className='rounded-bl-2xl rounded-br-2xl sm:rounded-bl-3xl sm:rounded-br-3xl px-2 sm:px-4 md:px-6 py-6 text-center border-l border-r border-b border-[#ffffff33] bg-black/5 backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300 ease-in-out'>
                                <h2 className='text-2xl text-[#2A166D]'>{service.title}</h2>
                                <p className='text-neutral-700 mt-4'>{service.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}