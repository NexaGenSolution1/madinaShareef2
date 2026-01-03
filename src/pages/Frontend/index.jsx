import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from '../../components/Header'
import Home from './Home'
import Footer from '../../components/Footer'
import NoPage from '../../components/NoPage'

export default function Frontend() {
    return (
        <>
            <Header />
            <Routes>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
                <Route path="*" element={<NoPage />} />
            </Routes>
            <Footer />
        </>
    )
}