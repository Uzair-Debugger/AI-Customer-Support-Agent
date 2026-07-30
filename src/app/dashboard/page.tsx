'use client'
import React from 'react'

const page = () => {
    const handleLogout = () => {
        window.location.href = '/api/auth/logout'
    }
    return (
        <div>
            <h1>NexaSupport Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default page
