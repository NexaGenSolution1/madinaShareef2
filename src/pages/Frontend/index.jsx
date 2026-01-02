import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from '../../components/Header'
import Home from './Home'
import Footer from '../../components/Footer'

export default function Frontend() {
    return (
        <>
            <Header />
            <Routes>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
            </Routes>
            <Footer />
        </>
    )
}