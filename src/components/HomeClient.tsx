'use client'
import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { features, stats } from '@/lib/data'
import { useRouter } from 'next/navigation'

const HomeClient = ({ user }: { user: { name: string } }) => {

  const navigate = useRouter()

  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout")
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
    <div className='min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 text-zinc-900 overflow-x-hidden'>

      {/* ── Navbar ── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100/80'
      >
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>

          {/* Logo */}
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200'>
              N
            </div>
            <span className='text-lg font-semibold tracking-tight'>
              Nexa<span className='text-indigo-500'>Support</span>
            </span>
          </div>

          {/* Nav links — desktop */}
          <nav className='hidden md:flex items-center gap-7 text-sm text-zinc-500 font-medium'>
            <a href='#feature' className='hover:text-zinc-900 transition-colors'>Features</a>
            <a href='#cta' className='hover:text-zinc-900 transition-colors'>Pricing</a>
            <a href='#cta' className='hover:text-zinc-900 transition-colors'>Docs</a>
          </nav>

          {/* Auth */}
          {user.name ? (
            <div className='relative' ref={popupRef}>
              <button
                onClick={() => setTogglePopup(!togglePopup)}
                className='flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition-colors'
              >
                <span className='w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center'>
                  {firstName[0]?.toUpperCase()}{secName[0]?.toUpperCase()}
                </span>
                <span className='text-sm font-medium text-indigo-700'>{firstName}</span>
              </button>

              <AnimatePresence>
                {togglePopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className='absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-zinc-200/80 border border-zinc-100 overflow-hidden'
                  >
                    <div className='px-4 py-3 border-b border-zinc-100'>
                      <p className='text-xs text-zinc-400 font-medium'>Signed in as</p>
                      <p className='text-sm font-semibold text-zinc-800 truncate'>{user.name}</p>
                    </div>
                    <button onClick={()=>navigate.push("/dashboard")}
                      className='w-full text-left px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-2'>
                      <span>🗂️</span> Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className='w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-zinc-100'
                    >
                      <span>🚪</span> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className='px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center gap-1.5'
              onClick={handleLogin}
            >
              Get Started <span className='text-indigo-300'>→</span>
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className='pt-32 pb-20 px-6'>
        <div className='max-w-6xl mx-auto'>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex justify-center mb-8'
          >
            <span className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide'>
              <span className='w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse' />
              AI-Powered · Production Ready · No-Code Setup
            </span>
          </motion.div>

          {/* Headline + sub */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className='text-center max-w-3xl mx-auto'
          >
            <h1 className='text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight'>
              Intelligent Support,{' '}
              <span className='gradient-text'>Delivered Instantly</span>
            </h1>
            <p className='mt-6 text-lg text-zinc-500 leading-relaxed max-w-2xl mx-auto'>
              Embed a smart AI support agent into your website in minutes.
              Give your customers instant, accurate answers powered by your
              own business knowledge — no human intervention needed.
            </p>

            <div className='mt-9 flex flex-wrap items-center justify-center gap-4'>
              {user.name ? (
                <button onClick={()=>navigate.push("/dashboard")}
                  className='hero-btn hero-btn-primary text-base px-8 py-3.5'>
                  Go to Dashboard
                </button>
              ) : (
                <button onClick={handleLogin} className='hero-btn hero-btn-primary text-base px-8 py-3.5'>
                  Start for Free
                </button>
              )}
              <a href='#feature' className='hero-btn hero-btn-secondary text-base px-8 py-3.5'>
                See Features
              </a>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='mt-14 flex justify-center'
          >
            <div className='inline-flex divide-x divide-zinc-200 rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden'>
              {stats.map((s, i) => (
                <div key={i} className='stat-pill'>
                  <span className='text-xl font-bold text-zinc-900'>{s.value}</span>
                  <span className='text-xs text-zinc-400 mt-0.5 font-medium'>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chat mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className='mt-16 max-w-md mx-auto relative'
          >
            {/* Glow */}
            <div className='absolute inset-0 -z-10 rounded-3xl bg-indigo-400/20 blur-3xl scale-110' />

            <div className='chat-preview'>
              {/* Chat header bar */}
              <div className='flex items-center gap-3 pb-4 mb-4 border-b border-zinc-100'>
                <div className='w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm'>💬</div>
                <div>
                  <p className='text-sm font-semibold text-zinc-800'>NexaSupport</p>
                  <p className='text-xs text-green-500 font-medium flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 inline-block' />
                    Online
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='chat-message chat-message-bot'>
                  👋 Hi! How can I help you today?
                </div>
                <div className='chat-message chat-message-user'>
                  Do you offer cash on delivery?
                </div>
                <div className='chat-message chat-message-bot'>
                  Yes! Cash on Delivery is available on all orders. 🎉
                </div>
                {/* Typing indicator */}
                <div className='flex items-center gap-1.5 px-4 py-3 bg-zinc-100 rounded-2xl rounded-bl-sm w-fit'>
                  <span className='typing-dot' style={{ animationDelay: '0ms' }} />
                  <span className='typing-dot' style={{ animationDelay: '150ms' }} />
                  <span className='typing-dot' style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className='floating-chat-icon'
              >
                💬
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Features ── */}
      <section id='feature' className='py-24 px-6 border-t border-zinc-100'>
        <div className='max-w-6xl mx-auto'>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='text-center mb-14'
          >
            <span className='text-xs font-semibold text-indigo-500 uppercase tracking-widest'>Why NexaSupport</span>
            <h2 className='mt-3 text-3xl md:text-4xl font-bold tracking-tight'>
              Everything you need to support your customers
            </h2>
            <p className='mt-4 text-zinc-500 max-w-xl mx-auto'>
              A complete toolkit to deploy, manage, and scale AI-powered support — without writing a single line of backend code.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((f, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                viewport={{ once: true }}
                className='feature-card'
              >
                <div className='feature-icon'>{f.icon}</div>
                <h3 className='text-base font-semibold text-zinc-900'>{f.title}</h3>
                <p className='mt-2 text-sm text-zinc-500 leading-relaxed'>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section id='cta' className='py-20 px-6'>
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className='relative rounded-3xl bg-indigo-600 px-10 py-14 text-center overflow-hidden'
          >
            {/* Background decoration */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2' />
            <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />

            <span className='relative text-indigo-200 text-xs font-semibold uppercase tracking-widest'>Get started today</span>
            <h2 className='relative mt-3 text-3xl md:text-4xl font-bold text-white leading-tight'>
              Ready to transform your <br className='hidden md:block' /> customer support?
            </h2>
            <p className='relative mt-4 text-indigo-200 max-w-lg mx-auto'>
              Join businesses already using NexaSupport to deliver faster, smarter, and more consistent support experiences.
            </p>
            <div className='relative mt-8 flex flex-wrap justify-center gap-4'>
              {user.name ? (
                <button onClick={()=>navigate.push("/dashboard")}
                  className='px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors shadow-lg'>
                  Go to Dashboard
                </button >
              ) : (
                <button
                  onClick={handleLogin}
                  className='px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors shadow-lg'
                >
                  Start for Free
                </button>
              )}
              <a href='#feature' className='px-8 py-3.5 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-colors'>
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className='border-t border-zinc-100 py-10 px-6'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold'>N</div>
            <span className='text-sm font-semibold'>Nexa<span className='text-indigo-500'>Support</span></span>
          </div>
          <p className='text-xs text-zinc-400'>
            &copy;{new Date().getFullYear()} NexaSupport. All rights reserved.
          </p>
          <div className='flex items-center gap-5 text-xs text-zinc-400'>
            <a href='#' className='hover:text-zinc-600 transition-colors'>Privacy</a>
            <a href='#' className='hover:text-zinc-600 transition-colors'>Terms</a>
            <a href='#' className='hover:text-zinc-600 transition-colors'>Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default HomeClient
