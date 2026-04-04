import React, { useEffect, useState } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { dummyUserData } from '../assets/assets'
import { useSelector } from 'react-redux'

/** One picked image: creates a blob URL and revokes it on unmount or when `file` changes. */
function ImageThumb({ file, onRemove }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!url) return null

  return (
    <div className='relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100'>
      <img src={url} alt='' className='h-full w-full object-cover' />
      <button
        type='button'
        onClick={onRemove}
        className='absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition hover:bg-black/70'
        aria-label='Remove image'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  )
}

const CreatePost = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e) => {
    const picked = e.target.files
    if (!picked?.length) return
    setImages((prev) => [...prev, ...Array.from(picked)])
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleShare = async () => {
    const text = content.trim()
    if (!text && images.length === 0) {
      toast.error('Write something or add at least one image.')
      return
    }

    setLoading(true)
    try {
      // Replace with your API call (FormData with text + files).
      await new Promise((r) => setTimeout(r, 500))
      toast.success('Post shared (demo)')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-full overflow-y-auto no-scrollbar bg-slate-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-xl space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Create post</h1>
          <p className='mt-1 text-sm text-slate-500'>Share an update with your followers.</p>
        </div>

        <div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
          <div className='flex items-center gap-3'>
            <img
              src={user.profile_picture}
              alt=''
              className='h-11 w-11 rounded-full object-cover ring-2 ring-slate-100'
            />
            <div className='min-w-0'>
              <h2 className='truncate text-base font-semibold text-slate-900'>{user.full_name}</h2>
              <p className='truncate text-sm text-slate-500'>@{user.username}</p>
            </div>
          </div>

          <textarea
            className='min-h-[120px] w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
            placeholder='What are you thinking?'
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {images.length > 0 && (
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {images.map((file, index) => (
                <ImageThumb key={`${file.name}-${index}`} file={file} onRemove={() => removeImage(index)} />
              ))}
            </div>
          )}

          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4'>
            <label
              htmlFor='post-images'
              className='inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
            >
              <ImageIcon className='h-5 w-5 text-slate-500' />
              Add photos
            </label>
            <input
              id='post-images'
              type='file'
              className='sr-only'
              accept='image/*'
              multiple
              onChange={handleImageUpload}
            />
            <button
              type='button'
              onClick={handleShare}
              disabled={loading}
              className='rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading ? 'Sharing…' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
