'use client'
import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { features } from '@/lib/data'

const HomeClient = ({ user }: { user: { name: string } }) => {
  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }
  const handleLogout = async () => {
    try {
      const result = await fetch("/api/auth/logout")
      window.location.href = "/"

    } catch (error) {
      console.log(error)
    }
  }

  const firstName = user.name.split(" ")[0] ?? ""
  const secName = user.name.split(" ")[1] ?? ""

  const [togglePopup, setTogglePopup] = useState<boolean>(false)

  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setTogglePopup(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTogglePopup(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
                      <button onClick={handleLogout}
                        className='w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-zinc-100'>
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


      <section className="pt-36 pb-28 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              AI Customer Support <br />
              Built for Modern Websites
            </h1>

            <p className="mt-6 text-lg text-zinc-600 max-w-xl">
              Add a powerful AI chatbot to your website in minutes.
              Let your customers get instant answers using your own
              business knowledge.
            </p>

            <div className="mt-10 flex gap-4">
              {user.name ?
                <button className="hero-btn hero-btn-primary">
                  Go to Dashboard
                </button>
                :
                <button className="hero-btn hero-btn-primary">
                  Get Started
                </button>
              }

              <a href='#feature'
                className="hero-btn hero-btn-secondary">
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="chat-preview">
              <div className="chat-header">
                Live Chat Preview
              </div>

              <div className="space-y-4">
                <div className="chat-message chat-message-user">
                  Do you offer cash on delivery?
                </div>

                <div className="chat-message chat-message-bot">
                  Yes, Cash On Delivery is available.
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                }}
                className="floating-chat-icon"
              >
                💬
              </motion.div>
            </div>


          </motion.div>

        </div>
      </section>

      <section
        id='feature'
        className=" bg-zinc-50 py-28 px-6 border-t border-zinc-200"
      >
        <div className='max-w-6xl mx-auto'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className='text-3xl font-semibold text-center'
          >
            Why Businesses Choose SupportAI
          </motion.h2>

          <div className='mt-16 grid grid-cols-1 md:grid-cols-3 gap-10'>
            {features.map((f, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="
        bg-white rounded-2xl
        p-8 shadow-lg
        border border-zinc-200
      "
              >
                <h1 className='text-lg font-medium'>{f.title}</h1>
                <p className='mt-3 text-zinc-600 text-sm'>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className='py-10 text-sm text-center text-zinc-500'>
        &copy;{new Date().getFullYear()} SupportAI. all rights reserved.
      </footer>
    </div >
  )
}

export default HomeClient