import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/images/logo.webp'
import { CiMenuFries } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ user, handleLogout }) {
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!profileOpen || !profileRef.current) return;
            if (!profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [profileOpen]);

    // const handleLogout = () => {
    //     localStorage.removeItem("frontend_token");
    //     localStorage.removeItem("frontend_user");
    //     setUser(null);
    //     setProfileOpen(false);
    //     // navigate("/auth/login");
    //     navigate("/");
    // };

    return (
        <header className='fixed w-full top-0 left-0 shadow-md z-999'>
            <div className='relative flex items-center justify-between gap-6 px-2.5 bg-white sm:px-4 py-2.5 overflow-visible'>
                {/* Left Part */}
                <div className='relative flex items-center gap-6 z-1'>
                    <Link to='/' className='w-12 md:w-16 block'>
                        <img src={logo} alt="logo" className='w-full h-full object-contain' />
                    </Link>

                    {user &&
                        <div className='hidden xl:block space-x-5'>
                            <Link to='/' className='text-sm font-semibold hover:text-[#d6d30b]'>Home</Link>
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
                    }
                </div>

                <div className='relative flex items-center gap-2 md:gap-4 z-1'>
                    {
                        // user ? (
                        user && (
                            <div ref={profileRef} className='relative hidden md:flex items-center gap-2'>
                                <button
                                    className='flex items-center gap-2 rounded-full border border-[#2A166D] px-3 py-2 text-sm text-[#2A166D] hover:bg-[#2A166D] hover:text-white'
                                    onClick={() => setProfileOpen((p) => !p)}
                                >
                                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-[#2A166D] text-white font-semibold'>
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                    <span className='font-semibold'>{user.name || 'User'}</span>
                                </button>
                                {profileOpen && (
                                    <div className='absolute right-0 top-12 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-2 text-sm z-[1000]'>
                                        <div className='px-4 py-2 text-neutral-700'>
                                            Signed in as
                                            <div className='font-semibold text-[#2A166D]'>{user.email}</div>
                                        </div>
                                        {user.role === 'Admin' && (
                                            <button
                                                className='w-full text-left px-4 py-2 hover:bg-neutral-100'
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    window.location.href = '/admin-portal/';
                                                }}
                                            >
                                                Admin Portal
                                            </button>
                                        )}
                                        {/* <button
                                            className='w-full text-left px-4 py-2 hover:bg-neutral-100'
                                            onClick={() => {
                                                setProfileOpen(false);
                                                navigate('/');
                                            }}
                                        >
                                            Home
                                        </button> */}
                                        <button
                                            className='w-full text-left px-4 py-2 text-red-600 hover:bg-neutral-100'
                                            onClick={() => {
                                                setProfileOpen(false);
                                                handleLogout();
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                        // : (
                        //     <div className='hidden md:flex gap-2'>
                        //         <Link to="/auth/register" className='text-sm bg-[#2A166D] text-white border border-[#2A166D] px-6 py-2 rounded-xl hover:bg-[#d6d30b] hover:text-[#2A166D]'>
                        //             Signup
                        //         </Link>
                        //         <Link to="/auth/login" className='flex items-center gap-1 text-sm text-[#2A166D] px-6 py-2 border border-[#2A166D] rounded-xl hover:bg-[#2A166D] hover:text-white'>
                        //             Login <CiLogin />
                        //         </Link>
                        //     </div>
                        // )
                    }
                    <div className='block md:hidden'>
                        {/* {user ? ( */}
                        {user && (
                            <button onClick={() => navigate('/')}>
                                <HiOutlineUserCircle className='text-2xl text-neutral-700' />
                            </button>
                        )
                            // : (
                            //     <Link to="/auth/login">
                            //         <HiOutlineUserCircle className='text-2xl text-neutral-700' />
                            //     </Link>
                            // )
                        }
                    </div>
                    {user &&
                        <div className='block xl:hidden border border-neutral-100 p-2 rounded-lg' onClick={() => setOpen(!open)}>
                            {open ? <AiOutlineClose className='text-neutral-700' /> : <CiMenuFries />}
                        </div>
                    }
                </div>

                {/* Sub Header */}
                <div className={`block xl:hidden fixed w-full h-[calc(100vh-68px)] md:h-[calc(100vh-84px)] top-17 md:top-20.5 left-0 bg-white overflow-y-auto z-999 transition-all duration-300 ease-in-out
                ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                >
                    <div className='flex flex-col items-start gap-6 px-8 py-6 font-semibold'>
                        <Link to='/' className='hover:text-[#d6d30b]'>Home</Link>
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
            </div>
        </header>
    )
}