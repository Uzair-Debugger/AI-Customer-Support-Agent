import { useState, useRef, useEffect } from "react"
import React from 'react'
import { toast } from 'sonner'

const FileUploader = ({ userId }: { userId: string }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [hasFiles, setHasFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/chunkfile?ownerId=${encodeURIComponent(userId)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!cancelled) setHasFiles(data?.exists === true)
      })
      .catch(() => { })
    return () => { cancelled = true }
  }, [userId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast.error('File size exceeds 3MB limit.');
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
        setHasFiles(true)
      } else if (res.status === 409) {
        const data = await res.json().catch(() => ({ message: 'A file is already uploaded.' }))
        toast.error(data.message || 'A file is already uploaded. Delete it first.')
        setHasFiles(true)
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

  const handleFileDelete = async () => {
    try {
      const res = await fetch('/api/chunkfile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success('All files deleted successfully!')
        setHasFiles(false)
        setUploadStatus('idle')
      } else if (res.status === 404) {
        const data = await res.json().catch(() => ({ message: 'No files found.' }))
        toast.error(data.message || 'No files found to delete.')
        setHasFiles(false)
      } else {
        toast.error('Failed to delete files.')
      }
    } catch {
      toast.error('Something went wrong while deleting files.')
    }
  }

  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-base font-semibold text-zinc-900'>Knowledge Files</h2>
        <p className='text-sm text-zinc-400 mt-0.5'>Upload .pdf, .docx, .txt or .md file — they&apos;ll be chunked and stored for AI retrieval</p>
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
          disabled={uploadStatus === 'uploading' || hasFiles}
          title={hasFiles ? 'Delete the existing file before uploading a new one' : undefined}
          className='px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {uploadStatus === 'uploading' ? 'Uploading…' : '📄 Upload File'}
        </button>
      </div>

      <div className='flex flex-wrap items-center gap-3 sm:gap-4'>
        <button
          type='button'
          onClick={handleFileDelete}
          disabled={!hasFiles}
          title={!hasFiles ? 'No files uploaded yet' : undefined}
          className='px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
        >
          🗑️ Delete All Files
        </button>
      </div>
    </section >
  )
}

export default FileUploader
