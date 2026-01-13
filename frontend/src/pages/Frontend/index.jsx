import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from '../../components/Header'
import Home from './Home'
import Footer from '../../components/Footer'
import NoPage from '../../components/NoPage'

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
        <>
            <Header user={user} handleLogout={handleLogout} />
            <Routes>
                <Route index element={<Home user={user} onLogin={handleLogin} />} />
                <Route path="home" element={<Home user={user} onLogin={handleLogin} />} />
                <Route path="*" element={<NoPage />} />
            </Routes>
            <Footer />
        </>
    )
}