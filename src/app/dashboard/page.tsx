'use client'
import React from 'react'
import { Scalekit } from '@scalekit-sdk/node'

const page = () => {
    const handleLogout = () =>{

        console.log("Logout");
        return 
    }
    return (
        <div>
            <h1>
                NexaSupport Dashboard
            </h1>
            <button type='submit' onSubmit={handleLogout}>Logout</button>
        </div>
        
    )
}

export default page