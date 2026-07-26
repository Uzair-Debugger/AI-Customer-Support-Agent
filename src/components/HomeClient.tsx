'use client'
import React from 'react'
import { motion } from 'motion/react'


const HomeClient = ({ user }: { user: { name: string, profilePic: string } }) => {
  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }
  return (
    <div className='min-h-screen bg-linear-to-br from-white to-zinc-50 text-zinc-900 overflow-x-hidden '>

      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className='fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-black'
      >
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='text-lg font-semibold tracking-tight'>Support <span className='text-zinc-400'>AI</span></div>
          <motion.button
            className='px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-60 flex items-center gap-2'
            onClick={handleLogin}
          >Login</motion.button>
        </div>
      </motion.div>
      <div className='max-w-7xl mx-auto px-6 pt-24'>
        <h1 className='text-4xl font-semibold'>Welcome, {user.name}</h1>
        <div className='w-30 h-30'>
          <img
            className='rounded-full mt-4' src={user.profilePic} alt="profile picture" />
        </div>
      </div>
    </div>
  )
}

export default HomeClient