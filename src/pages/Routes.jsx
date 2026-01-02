import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Frontend from './Frontend'

export default function Index() {
    return (
        <Routes>
            <Route index element={<Frontend />} />
            <Route path='/*' element={<Frontend />} />
        </Routes>
    )
}