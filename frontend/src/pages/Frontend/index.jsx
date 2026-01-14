import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import Home from './Home'
import AllGroups from './AllGroups'
import BookingForm from '../../components/BookingForm'
import Bank from './Bank'
import Footer from '../../components/Footer'
import NoPage from '../../components/NoPage'
import Register from '../Auth/Register'
import Payment from './Payment'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import Dashboard from './Dashboard'
import Ledger from './Ledger'

export default function Frontend() {
    const [user, setUser] = useState(null);
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
                <>
                    <Header user={user} handleLogout={handleLogout} />
                    <Register />
                    <Footer />
                </>
            } />

            {/* Original Routes with Header and Footer - Protected */}
            <Route path="/all-groups" element={
                user ? (
                    <>
                        <Header user={user} handleLogout={handleLogout} />
                        <div className='pt-20'>
                            <AllGroups />
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
                <Route path="booking" element={<BookingForm />} />
                <Route path="banks" element={<Bank />} />
                <Route path="payment" element={<Payment />} />
                <Route path="ledger" element={<Ledger />} />
            </Route>

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