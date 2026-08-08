'use client'
import React, { useState } from 'react'
import { NEXT_PUBLIC_APP_URL } from '@/config/client-env'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import "dotenv/config"
import { toast } from 'sonner'

const EmbedClient = ({ ownerId }: { ownerId: string }) => {
    const navigate = useRouter()
    const [copied, setCopied] = useState(false)

    const snippet = `<script src="${NEXT_PUBLIC_APP_URL}/chatbot.js" data-owner-id="${ownerId}"></script>`

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet)
        setCopied(true)
        toast.success('Embed snippet copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

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
                        <span className='text-lg font-semibold tracking-tight hidden sm:inline'>Nexa<span className='text-indigo-500'>Support</span></span>
                    </div>
                    <button
                        onClick={() => navigate.push('/dashboard')}
                        className='hidden sm:flex px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors items-center gap-1'
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate.push('/dashboard')}
                        className='sm:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-100 transition-colors'
                        aria-label='Back to Dashboard'
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </button>
                </div>
            </motion.header>

            {/* ── Content ── */}
            <div className='flex justify-center px-4 py-14 mt-16'>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className='w-full max-w-3xl'
                >
                    <div className='mb-6 sm:mb-8'>
                        <span className='text-xs font-semibold text-indigo-500 uppercase tracking-widest'>Embed</span>
                        <h1 className='mt-2 text-2xl sm:text-3xl font-bold tracking-tight'>Add Chat to Your Website</h1>
                        <p className='text-zinc-500 mt-1 text-sm sm:text-base'>Copy the snippet below and paste it before the closing <code className='text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded text-xs'>&lt;/body&gt;</code> tag</p>
                    </div>

                    {/* Card */}
                    <div className='bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100/60 p-5 sm:p-8 space-y-6 sm:space-y-8'>

                        {/* Step 1 */}
                        <section className='space-y-3'>
                            <div className='flex items-center gap-3'>
                                <span className='w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-indigo-200'>1</span>
                                <h2 className='text-base font-semibold text-zinc-900'>Copy your embed snippet</h2>
                            </div>
                            <div className='relative rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden'>
                                <pre className='text-sm text-indigo-300 px-5 py-4 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed'>
                                    {snippet}
                                </pre>
                                <button
                                    onClick={handleCopy}
                                    className='absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-md shadow-indigo-900/40'
                                >
                                    {copied ? '✓ Copied!' : 'Copy'}
                                </button>
                            </div>
                        </section>

                        <div className='border-t border-zinc-100' />

                        {/* Step 2 */}
                        <section className='space-y-3'>
                            <div className='flex items-center gap-3'>
                                <span className='w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-indigo-200'>2</span>
                                <h2 className='text-base font-semibold text-zinc-900'>Paste it into your HTML</h2>
                            </div>
                            <div className='rounded-2xl bg-zinc-950 border border-zinc-800 px-5 py-4 overflow-x-auto'>
                                <pre className='text-sm leading-relaxed whitespace-pre text-zinc-400'>{`<html>
  <body>
    <!-- your page content -->

    <script src="..." data-owner-id="..."></script>
  </body>
</html>`}
                                </pre>
                            </div>
                        </section>

                        <div className='border-t border-zinc-100' />

                        {/* Info row */}
                        <section className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            {[
                                { icon: '⚡', title: 'Instant Setup', desc: 'No build step or npm install required' },
                                { icon: '🔒', title: 'Scoped to You', desc: 'Your owner ID keeps responses isolated' },
                                { icon: '🎨', title: 'Auto Styled', desc: 'Widget matches any site out of the box' },
                            ].map((item) => (
                                <div key={item.title} className='rounded-2xl border border-zinc-100 bg-zinc-50 p-4 space-y-1'>
                                    <span className='text-xl'>{item.icon}</span>
                                    <p className='text-sm font-semibold text-zinc-800'>{item.title}</p>
                                    <p className='text-xs text-zinc-400 leading-relaxed'>{item.desc}</p>
                                </div>
                            ))}
                        </section>

                    </div>
                </motion.div>
            </div>

        </div>
    )
}

export default EmbedClient
