import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import NoPage from '../../components/NoPage'

export default function Auth() {
    return (
        <Routes>
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
    )
}