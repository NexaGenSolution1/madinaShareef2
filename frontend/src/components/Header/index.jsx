import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/images/logo.webp'
import { CiMenuFries } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import { groupTypes } from '../../data/groupTypes'
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
            <div className='relative flex items-center justify-between gap-2 sm:gap-4 md:gap-6 px-2 sm:px-3 md:px-4 bg-white py-2 md:py-2.5 overflow-visible'>
                {/* Left Part */}
                <div className='relative flex items-center gap-2 sm:gap-4 md:gap-6 z-1'>
                    <Link to='/' className='w-10 sm:w-12 md:w-14 lg:w-16 block shrink-0'>
                        <img src={logo} alt="logo" className='w-full h-full object-contain' />
                    </Link>

                    {user &&
                        <div className='hidden xl:flex flex-wrap gap-x-3 lg:gap-x-5'>
                            {groupTypes.map((group) => (
                                <Link 
                                    key={group.value} 
                                    to={`/${group.path}`} 
                                    className='text-xs lg:text-sm font-semibold hover:text-[#d6d30b] whitespace-nowrap'
                                >
                                    {group.label}
                                </Link>
                            ))}
                        </div>
                    }

                </div>

                <div className='relative flex items-center gap-1.5 sm:gap-2 md:gap-4 z-1'>
                    {/* Banks Link - Always Visible */}


                    {
                        user && (
                            <div ref={profileRef} className='relative hidden md:flex items-center gap-2'>
                                <button
                                    className='flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#2A166D] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#2A166D] hover:bg-[#2A166D] hover:text-white transition-colors'
                                    onClick={() => setProfileOpen((p) => !p)}
                                >
                                    <span className='flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#2A166D] text-white font-semibold text-xs sm:text-base shrink-0'>
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                    <span className='font-semibold hidden lg:inline'>{user.name || 'User'}</span>
                                </button>
                                {profileOpen && (
                                    <div className='absolute right-0 top-12 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-2 text-sm z-1000'>
                                        <div className='px-4 py-2 text-neutral-700'>
                                            Signed in as
                                            <div className='font-semibold text-[#2A166D] truncate'>{user.email}</div>
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
                                           <button
                                            className='w-full text-left px-4 py-2 hover:bg-neutral-100 font-semibold'
                                            onClick={() => {
                                                setProfileOpen(false);
                                                navigate('/dashboard');
                                            }}
                                        >
                                            Agent Dashboard
                                        </button>
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
                    }
                    <div className='flex items-center gap-2 md:hidden'>
                        {!user && (
                            <Link to='/banks' className='text-xs sm:text-sm font-semibold hover:text-[#d6d30b] whitespace-nowrap'>Banks</Link>
                        )}
                        {user && (
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className='flex items-center justify-center'
                            >
                                <span className='flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#2A166D] text-white font-semibold text-xs sm:text-sm'>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            </button>
                        )}
                    </div>
                    {user &&
                        <button 
                            className='flex xl:hidden border border-neutral-300 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors' 
                            onClick={() => setOpen(!open)}
                            aria-label="Toggle menu"
                        >
                            {open ? <AiOutlineClose className='text-neutral-700 text-lg sm:text-xl' /> : <CiMenuFries className='text-lg sm:text-xl' />}
                        </button>
                    }
                </div>

                {/* Mobile Menu */}
                <div className={`flex xl:hidden fixed w-full h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] md:h-[calc(100vh-72px)] top-14 sm:top-16 md:top-18 left-0 bg-white overflow-y-auto z-998 transition-all duration-300 ease-in-out shadow-lg
                ${open ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}
                >
                    <div className='flex flex-col items-start gap-4 sm:gap-5 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 font-semibold w-full'>
                        {groupTypes.map((group) => (
                            <Link 
                                key={group.value}
                                to={group.path} 
                                className='text-sm sm:text-base hover:text-[#d6d30b] w-full py-2 border-b border-gray-100 transition-colors'
                                onClick={() => setOpen(false)}
                            >
                                {group.label}
                            </Link>
                        ))}

                        <hr className='w-full border-t border-gray-200 my-2' />
                        
                        {user && (
                            <>
                                <button
                                    className='text-sm sm:text-base hover:text-[#d6d30b] w-full py-2 border-b border-gray-100 transition-colors text-left font-semibold'
                                    onClick={() => {
                                        setOpen(false);
                                        navigate('/dashboard');
                                    }}
                                >
                                    Agent Dashboard
                                </button>
                                <button
                                    className='text-sm sm:text-base text-red-600 hover:text-red-700 w-full py-2 transition-colors text-left'
                                    onClick={() => {
                                        setOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}