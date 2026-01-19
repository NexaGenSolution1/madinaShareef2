import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import Home from './Home'
import AllGroups from './AllGroups'
import BookingForm from '../../components/BookingForm/index2'
import Bank from './Bank'
import Footer from '../../components/Footer'
import NoPage from '../../components/NoPage'
import Register from '../Auth/Register'
import Payment from './Payment'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import Dashboard from './Dashboard'
import Ledger from './Ledger'
import ChangePassword from '../../components/ChangePassword/ChnagePassword'
import Profile from '../../components/Profile/Profile'
import MyBookings from '../MyBookings'
import BookingDetail from '../BookingDetail'

export default function Frontend() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("frontend_user");
        console.log("Retrieved user from localStorage:", storedUser);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (_) {
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        console.log("Login handler called with:", userData);
        setUser(userData);
    };

    const handleLogout = () => {
        console.log("Logging out...")
        localStorage.removeItem("frontend_token");
        localStorage.removeItem("frontend_user");
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes with Header and Footer */}
            <Route path="/" element={
                <>
                    <Header user={user} handleLogout={handleLogout} />
                    <Home user={user} onLogin={handleLogin} />
                    <Footer />
                </>
            } />
            <Route path="/home" element={
                <>
                    <Header user={user} handleLogout={handleLogout} />
                    <Home user={user} onLogin={handleLogin} />
                    <Footer />
                </>
            } />
            <Route path="/auth/register" element={
                !user ? (
                    <>
                        <Header user={user} handleLogout={handleLogout} />
                        <Register />
                        <Footer />
                    </>
                ) : <Navigate to="/dashboard" replace />
            } />

            {/* Original Routes with Header and Footer - Protected */}
            <Route path="/all-groups" element={
                user ? (
                    <>
                        <Header user={user} handleLogout={handleLogout} />
                        <div className='bg-gray-50'>
                            <div className='w-full min-h-screen mx-auto pt-32 px-8'>
                                <div className="mb-4 sm:mb-6 md:mb-8">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">All Groups</h1>
                                    <p className="text-sm sm:text-base text-gray-600">Submit and manage your payment records</p>
                                </div>
                                <AllGroups />
                            </div>
                        </div>
                        <Footer />
                    </>
                ) : <Navigate to="/" replace />
            } />
            <Route path="/banks" element={
                user ? (
                    <>
                        <Header user={user} handleLogout={handleLogout} />
                        <Bank />
                        <Footer />
                    </>
                ) : <Navigate to="/" replace />
            } />
            <Route path="/payment" element={
                user ? (
                    <>
                        <Header user={user} handleLogout={handleLogout} />
                        <Payment />
                        <Footer />
                    </>
                ) : <Navigate to="/" replace />
            } />

            {/* Dashboard Routes - Protected */}
            <Route path="/dashboard" element={
                user ? <DashboardLayout user={user} handleLogout={handleLogout} /> : <Navigate to="/" replace />
            }>
                <Route index element={<Dashboard />} />
                <Route path="all-groups" element={<AllGroups />} />
                <Route path="booking" element={<BookingForm user={user} />} />
                <Route path="banks" element={<Bank />} />
                <Route path="payment" element={<Payment />} />
                <Route path="ledger" element={<Ledger />} />
                <Route path="my-bookings" element={<MyBookings />} />
                <Route path="booking-detail/:id" element={<BookingDetail />} />
                <Route path="edit-booking/:id" element={<BookingForm />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* Profile Route - Standalone Protected */}
            <Route path="/profile" element={
                user ? (
                    <>
                        <Header user={user} handleLogout={handleLogout} />
                        <Profile />
                        <Footer />
                    </>
                ) : <Navigate to="/" replace />
            } />

            {/* 404 Page */}
            <Route path="*" element={
                <>
                    <Header user={user} handleLogout={handleLogout} />
                    <NoPage />
                    <Footer />
                </>
            } />
        </Routes>
    )
}