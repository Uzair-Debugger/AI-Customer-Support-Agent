import { useState, useRef } from "react"
import React from 'react'
import { toast } from 'sonner'

const FileUploader = ({ userId }: { userId: string }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }
    setUploadStatus('uploading')
    const loadingToast = toast.loading('Uploading file...')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('ownerId', userId)
      const res = await fetch('/api/chunkfile', { method: 'POST', body: fd })
      toast.dismiss(loadingToast)
      if (res.ok) {
        setUploadStatus('success')
        toast.success('File uploaded and indexed successfully!')
      } else {
        setUploadStatus('error')
        toast.error('File upload failed. Please try again.')
      }
    } catch {
      toast.dismiss(loadingToast)
      setUploadStatus('error')
      toast.error('Something went wrong during upload.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <section className='space-y-4'>
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
      </div>
    </section >

  )
}

export default FileUploader
