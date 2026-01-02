import React, { useState } from 'react'
import logo from '../../assets/images/logo.webp'
import { CiMenuFries } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { CiLogin } from "react-icons/ci";

export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className='flex items-center justify-between gap-6 px-2.5 sm:px-4 py-2.5'>
            {/* Left Part */}
            <div className='flex items-center gap-6'>
                <div className='w-12 md:w-16'>
                    <img src={logo} alt="logo" className='w-full h-full object-contain' />
                </div>

                <div className='hidden xl:block space-x-5'>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>Umrah Groups</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>UAE Groups</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>KSA Groups</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>Qatar Groups</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>UK Groups</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>Muscat Groups</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>Bahrain Groups</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>Banks</button>
                    <button className='text-sm font-semibold hover:text-[#d6d30b]'>Deals</button>
                </div>
            </div>

            {/* Right Part */}
            <div className='flex items-center gap-2 md:gap-4'>
                <div className='hidden md:flex gap-2'>
                    <button className='text-sm bg-[#2A166D] text-white border border-[#2A166D] px-6 py-2 rounded-xl hover:bg-[#d6d30b] hover:border-[#d6d30b]'>
                        Signup
                    </button>
                    <button className='flex items-center gap-1 text-sm text-[#2A166D] px-6 py-2 border border-[#2A166D] rounded-xl hover:bg-[#2A166D] hover:text-white'>
                        Login <CiLogin />
                    </button>
                </div>
                <div className='block md:hidden'>
                    <HiOutlineUserCircle className='text-2xl text-neutral-700' />
                </div>
                <div className='block xl:hidden border border-neutral-100 p-2 rounded-lg' onClick={() => setOpen(!open)}>
                    {open ? <AiOutlineClose className='text-neutral-700' /> : <CiMenuFries />}
                </div>
            </div>

            {/* Sub Header */}
            <div className={`block xl:block fixed w-full h-[calc(100vh-68px)] md:h-[calc(100vh-84px)] top-17 md:top-20.5 left-0 bg-white overflow-y-auto z-999 transition-all duration-300 ease-in-out
                ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
                <div className='flex flex-col items-start gap-6 px-8 py-6 font-semibold'>
                    <button className='hover:text-[#d6d30b]'>Umrah Groups</button>
                    <button className='hover:text-[#d6d30b]'>UAE Groups</button>
                    <button className='hover:text-[#d6d30b]'>KSA Groups</button>
                    <button className='hover:text-[#d6d30b]'>Qatar Groups</button>
                    <button className='hover:text-[#d6d30b]'>UK Groups</button>
                    <button className='hover:text-[#d6d30b]'>Muscat Groups</button>
                    <button className='hover:text-[#d6d30b]'>Bahrain Groups</button>
                    <button className='hover:text-[#d6d30b]'>Banks</button>
                    <button className='hover:text-[#d6d30b]'>Deals</button>
                </div>
            </div>
        </header>
    )
}