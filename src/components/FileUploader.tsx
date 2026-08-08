import { div } from "motion/react-client"
import { motion, AnimatePresence } from "motion/react"
import { useState, useRef } from "react"


import React from 'react'

const FileUploader = ({ userId } :{ userId: string }) => {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadStatus('uploading')
        try {
            const fd = new FormData()
            fd.append('file', file)
            fd.append('ownerId', userId)
            const res = await fetch('/api/chunkfile', { method: 'POST', body: fd })
            setUploadStatus(res.ok ? 'success' : 'error')
        } catch {
            setUploadStatus('error')
        } finally {
            e.target.value = ''
        }
    }

    return (
        <section className = 'space-y-4'>
              <div>
                <h2 className='text-base font-semibold text-zinc-900'>Knowledge Files</h2>
                <p className='text-sm text-zinc-400 mt-0.5'>Upload .txt or .md files — they'll be chunked and stored for AI retrieval</p>
              </div>
              <div className='flex flex-wrap items-center gap-3 sm:gap-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.txt,.md,.pdf,.docx'
                  onChange={handleFileUpload}
                  className='hidden'
                />
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadStatus === 'uploading'}
                  className='px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {uploadStatus === 'uploading' ? 'Uploading…' : '📄 Upload File'}
                </button>
                <AnimatePresence mode='wait'>
                  {uploadStatus === 'success' && (
                      <motion.p key='ok' initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className='text-sm text-emerald-600 font-medium'>✓ File uploaded & indexed</motion.p>
                    )}
                  {uploadStatus === 'error' && (
                      <motion.p key='err' initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className='text-sm text-red-500 font-medium'>✕ Upload failed</motion.p>
                    )}
                </AnimatePresence>
              </div>
            </section >
 
  )  
}

export default FileUploader
