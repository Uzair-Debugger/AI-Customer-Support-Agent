'use client'
import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import FileUploader from './FileUploader'

type Settings = {
  businessName: string
  supportEmail: string
  chatbotName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  widgetPosition: 'bottom-right' | 'bottom-left'
  greetingMessage: string
  isActive: boolean
  knowledge: string
}

function hexLuminance(hex: string) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return 0
  const c = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: string, b: string) {
  const l1 = hexLuminance(a), l2 = hexLuminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

const MIN_CONTRAST = 2.5

const DashboardClient = ({ user, initialSettings }: {
  user: { ownerId: string; name: string }
  initialSettings: Settings
}) => {
  const navigate = useRouter()
  const [togglePopup, setTogglePopup] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const firstName = user.name.split(' ')[0] ?? ''
  const secName = user.name.split(' ')[1] ?? ''

  const [form, setForm] = useState<Settings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const contrast = contrastRatio(form.primaryColor, form.secondaryColor)
  const contrastOk = contrast >= MIN_CONTRAST

  const handleSave = async () => {
    if (!contrastOk) return
    setSaving(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: user.ownerId, ...form }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout')
      window.location.href = '/'
    } catch (error) { console.log(error) }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setTogglePopup(false)
    }
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setTogglePopup(false) }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const isSvg = form.logo.trimStart().startsWith('<')

  return (
    <div className='min-h-screen bg-linear-to-br from-white via-indigo-50/30 to-violet-50/40 text-zinc-900'>

      {/* ── Navbar ── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100/80'
      >
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate.push('/')}>
            <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200'>N</div>
            <span className='text-lg font-semibold tracking-tight'>Nexa<span className='text-indigo-500'>Support</span></span>
          </div>

          <nav className='hidden md:flex items-center gap-7 text-sm text-white font-medium'>
            <button onClick={() => navigate.push('/embed')}
              className='px-4 py-2 rounded-1g border border-zinc-300 text-sm transition hover:bg-indigo-600 bg-indigo-500'>
              Embed Chat<span aria-label='robot-logo' className='text-xl'>🤖</span></button>
          </nav>

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
                  <button
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2'
                  >
                    <span>🚪</span> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* ── Content ── */}
      <div className='flex justify-center px-4 py-14 mt-16'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className='w-full max-w-4xl'
        >
          {/* Page header */}
          <div className='mb-8'>
            <span className='text-xs font-semibold text-indigo-500 uppercase tracking-widest'>Dashboard</span>
            <h1 className='mt-2 text-3xl font-bold tracking-tight'>ChatBot Settings</h1>
            <p className='text-zinc-500 mt-1'>Manage your AI chatbot knowledge and business details</p>
          </div>

          {/* Card */}
          <div className='bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100/60 p-8 space-y-10'>

            {/* ── Business Details ── */}
            <section className='space-y-4'>
              <div>
                <h2 className='text-base font-semibold text-zinc-900'>Business Details</h2>
                <p className='text-sm text-zinc-400 mt-0.5'>Basic info shown to your customers</p>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Business Name</label>
                  <input
                    type='text'
                    value={form.businessName}
                    onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                    placeholder='e.g. Acme Store'
                    className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-zinc-400'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Support Email</label>
                  <input
                    type='email'
                    value={form.supportEmail}
                    onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))}
                    placeholder='support@yourbusiness.com'
                    className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-zinc-400'
                  />
                </div>
              </div>
            </section>

            <div className='border-t border-zinc-100' />

            {/* ── Chatbot Appearance ── */}
            <section className='space-y-6'>
              <div>
                <h2 className='text-base font-semibold text-zinc-900'>Chatbot Appearance</h2>
                <p className='text-sm text-zinc-400 mt-0.5'>Customize how the widget looks on your site</p>
              </div>

              {/* Chatbot Name + Greeting */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Chatbot Name</label>
                  <input
                    type='text'
                    value={form.chatbotName}
                    onChange={e => setForm(f => ({ ...f, chatbotName: e.target.value }))}
                    placeholder='e.g. SupportBot'
                    className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-zinc-400'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Greeting Message</label>
                  <input
                    type='text'
                    value={form.greetingMessage}
                    onChange={e => setForm(f => ({ ...f, greetingMessage: e.target.value }))}
                    placeholder='👋 Hi! How can I help you today?'
                    className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-zinc-400'
                  />
                </div>
              </div>

              {/* Logo */}
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>
                  Logo <span className='normal-case text-zinc-400'>(emoji or SVG code)</span>
                </label>
                <div className='flex gap-3 items-start'>
                  <textarea
                    rows={3}
                    value={form.logo}
                    onChange={e => setForm(f => ({ ...f, logo: e.target.value }))}
                    placeholder={'💬   or   <svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>'}
                    className='flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-mono resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-zinc-400'
                  />
                  {/* Live preview */}
                  <div className='w-14 h-14 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center flex-shrink-0 overflow-hidden'>
                    {form.logo
                      ? isSvg
                        ? <span className='w-8 h-8 [&>svg]:w-full [&>svg]:h-full' dangerouslySetInnerHTML={{ __html: form.logo }} />
                        : <span className='text-2xl leading-none'>{form.logo}</span>
                      : <span className='text-2xl leading-none'>💬</span>
                    }
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className='space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* Primary */}
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Primary Color</label>
                    <div className='flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5'>
                      <input
                        type='color'
                        value={form.primaryColor}
                        onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                        className='w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0'
                      />
                      <span className='text-sm font-mono text-zinc-600'>{form.primaryColor}</span>
                    </div>
                  </div>
                  {/* Secondary */}
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Secondary Color</label>
                    <div className='flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5'>
                      <input
                        type='color'
                        value={form.secondaryColor}
                        onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                        className='w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0'
                      />
                      <span className='text-sm font-mono text-zinc-600'>{form.secondaryColor}</span>
                    </div>
                  </div>
                </div>

                {/* Gradient preview */}
                <div
                  className='h-8 rounded-xl w-full'
                  style={{ background: `linear-gradient(90deg, ${form.primaryColor}, ${form.secondaryColor})` }}
                />

                {/* Contrast feedback */}
                <p className={`text-xs flex items-center gap-1.5 font-medium ${contrastOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {contrastOk
                    ? `✓ Good contrast (${contrast.toFixed(1)}:1)`
                    : `⚠ Low contrast (${contrast.toFixed(1)}:1) — minimum ${MIN_CONTRAST}:1 required`}
                </p>
              </div>

              {/* Widget Position + Active toggle */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Widget Position</label>
                  <div className='flex rounded-xl border border-zinc-200 overflow-hidden text-sm font-medium'>
                    {(['bottom-right', 'bottom-left'] as const).map(pos => (
                      <button
                        key={pos}
                        type='button'
                        onClick={() => setForm(f => ({ ...f, widgetPosition: pos }))}
                        className={`flex-1 py-2.5 transition-colors ${form.widgetPosition === pos
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                          }`}
                      >
                        {pos === 'bottom-right' ? '↘ Bottom Right' : '↙ Bottom Left'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Chatbot Status</label>
                  <button
                    type='button'
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-full py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                      }`}
                  >
                    {form.isActive ? '🟢 Active' : '⚫ Inactive'}
                  </button>
                </div>
              </div>
            </section>

            <div className='border-t border-zinc-100' />

            {/* ── Knowledge Base ── */}
            <section className='space-y-4'>
              <div>
                <h2 className='text-base font-semibold text-zinc-900'>Knowledge Base</h2>
                <p className='text-sm text-zinc-400 mt-0.5'>Add FAQs, policies, delivery info, refunds, etc.</p>
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-zinc-500 uppercase tracking-wide'>Content</label>
                <textarea
                  rows={10}
                  value={form.knowledge}
                  onChange={e => setForm(f => ({ ...f, knowledge: e.target.value }))}
                  placeholder={`• Refund policy: 7 days return available\n• Delivery time: 3–5 working days\n• Cash on Delivery available\n• Support hours: Mon–Fri 9am–6pm`}
                  className='w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-zinc-400'
                />
              </div>
            </section>

            <FileUploader userId={user.ownerId} />
            {/* ── Footer ── */}
            <div className='flex items-center justify-between pt-2'>
              <AnimatePresence mode='wait'>
                {status === 'success' && (
                  <motion.p
                    key='success'
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className='text-sm text-emerald-600 font-medium flex items-center gap-1.5'
                  >
                    <span>✓</span> Settings saved
                  </motion.p>
                )}
                {status === 'error' && (
                  <motion.p
                    key='error'
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className='text-sm text-red-500 font-medium flex items-center gap-1.5'
                  >
                    <span>✕</span> Failed to save
                  </motion.p>
                )}
                {status === 'idle' && <span key='idle' />}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving || !contrastOk}
                title={!contrastOk ? `Increase color contrast to at least ${MIN_CONTRAST}:1 before saving` : undefined}
                className='px-7 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </motion.button>
            </div>

          </div>
        </motion.div>
      </div>

    </div>
  )
}

export default DashboardClient
