'use client'
import DashboardClient from '@/components/DashboardClient'
import { getSession } from '@/lib/getSession'
import React from 'react'

const page = async () => {
    const handleLogout = () => {
        window.location.href = '/api/auth/logout'
    }
    const response = await getSession()
    const session = await response.json()
    return (
        <div>
            <h1>NexaSupport Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
            <DashboardClient ownerId={session?.user?.id} />
        </div>
    )
}

export default page
