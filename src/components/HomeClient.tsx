'use client'
import React, { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'


const HomeClient = ({ user }: { user: { name: string } }) => {
  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }

  const firstName = user.name.split(" ")[0] ?? ""
  const secName = user.name.split(" ")[1] ?? ""

  const [togglePopup, setTogglePopup] = useState<boolean>(false)

  const popupRef = useRef<HTMLDivElement>(null)
  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setTogglePopup(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setTogglePopup(false)
  })

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
          {
            user.name ?
              <div className='relative' ref={popupRef}>
                <div onClick={() => setTogglePopup(!togglePopup)}
                  className='flex items-center p-2 font-medium text-lg rounded-full cursor-pointer text-green-500 bg-green-100'>
                  <span>{firstName[0].toUpperCase()}{secName[0].toUpperCase()}</span>
                </div>

                <AnimatePresence>
                  {togglePopup && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className='absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden'
                    >
                      <button className='w-full text-left px-4 py-3 text-sm hover:bg-zinc-100'>
                        Dashboard
                      </button>
                      <button className='w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-zinc-100'>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              :
              <motion.button
                className='px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-60 flex items-center gap-2'
                onClick={handleLogin}
              >Login
              </motion.button>
          }

        </div>

      </motion.div >
          
    </div >
  )
}

export default HomeClient