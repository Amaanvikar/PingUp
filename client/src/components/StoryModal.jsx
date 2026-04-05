import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const BG_COLORS = ['#4f46e5', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
const MAX_VIDEO_SECONDS = 60
const MAX_VIDEO_MB = 50
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024

/** Returns true if the video is at most `maxSeconds` long (browser checks duration after load). */
function videoIsShortEnough(file, maxSeconds) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(Number.isFinite(video.duration) && video.duration <= maxSeconds)
    }
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(false)
    }

    video.src = objectUrl
  })
}

const StoryModal = ({ setShowModal, fetchStories }) => {
  const { getToken } = useAuth()

  const [mode, setMode] = useState('text') // 'text' | 'media'
  const [backgroundColor, setBackgroundColor] = useState(BG_COLORS[0])
  const [text, setText] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setMediaFile(null)
  }

  const handleClose = () => {
    clearPreview()
    setShowModal(false)
  }

  /**
   * User picked a file from "Photo / Video".
   * Images: show preview right away.
   * Videos: check file size, then length in seconds, then show preview.
   */
  const handlePickMedia = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    clearPreview()

    if (file.type.startsWith('image/')) {
      setMediaFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setText('')
      setMode('media')
      return
    }

    if (file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error(`Video must be smaller than ${MAX_VIDEO_MB} MB.`)
        return
      }
      const shortEnough = await videoIsShortEnough(file, MAX_VIDEO_SECONDS)
      if (!shortEnough) {
        toast.error(`Video must be shorter than ${MAX_VIDEO_SECONDS} seconds.`)
        return
      }
      setMediaFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setText('')
      setMode('media')
      return
    }

    toast.error('Please choose an image or a video.')
  }

  /**
   * What we tell the server: text-only, or image, or video (matches server `media_type`).
   */
  function storyMediaType() {
    if (mode === 'text') return 'text'
    if (!mediaFile) return null
    if (mediaFile.type.startsWith('image/')) return 'image'
    if (mediaFile.type.startsWith('video/')) return 'video'
    return null
  }

  /**
   * Build FormData and POST to create the story.
   */
  const handleSubmit = async () => {
    const mediaType = storyMediaType()
    if (!mediaType) {
      toast.error('Pick text or a photo/video.')
      return
    }
    if (mediaType === 'text' && !text.trim()) {
      toast.error('Write something for your story.')
      return
    }
    if (mediaType !== 'text' && !mediaFile) {
      toast.error('Add a photo or video.')
      return
    }

    const token = await getToken()
    if (!token) {
      toast.error('You must be signed in.')
      return
    }

    const formData = new FormData()
    formData.append('content', text.trim())
    formData.append('media_type', mediaType)
    formData.append('background_color', backgroundColor)
    if (mediaType !== 'text') {
      formData.append('media', mediaFile)
    }

    setSubmitting(true)
    try {
      const { data } = await api.post('/api/Story/create', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!data.success) {
        toast.error(data.message ?? 'Could not create story')
        return
      }

      toast.success('Story created')
      handleClose()
      fetchStories?.()
    } catch (err) {
      toast.error(err.response?.data?.message ?? err.message ?? 'Could not create story')
    } finally {
      setSubmitting(false)
    }
  }

  const isImage = mediaFile?.type?.startsWith('image/')
  const isVideo = mediaFile?.type?.startsWith('video/')

  return (
    <div className='fixed inset-0 z-[110] flex min-h-screen items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-xl bg-slate-900 p-4 shadow-xl'>
        <div className='mb-3 flex items-center justify-between gap-2 text-white'>
          <button type='button' onClick={handleClose} className='rounded-lg p-2 hover:bg-white/10' aria-label='Close'>
            <ArrowLeft className='size-5' />
          </button>
          <h2 className='text-lg font-semibold'>Create Story</h2>
          <span className='w-9' />
        </div>

        <div className='mb-3 flex gap-2'>
          <button
            type='button'
            onClick={() => setMode('text')}
            className={`rounded-lg px-3 py-1.5 text-sm ${mode === 'text' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/80'}`}
          >
            Text
          </button>
          <label
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm ${mode === 'media' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/80'}`}
          >
            Photo / Video
            <input type='file' accept='image/*,video/*' className='hidden' onChange={handlePickMedia} />
          </label>
        </div>

        <div
          className='relative flex h-96 items-center justify-center overflow-hidden rounded-lg'
          style={{ backgroundColor: mode === 'text' ? backgroundColor : '#0f172a' }}
        >
          {mode === 'text' && (
            <textarea
              className='h-full w-full resize-none bg-transparent p-6 text-lg text-white placeholder:text-white/50 focus:outline-none'
              placeholder='Write your story here...'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
          {mode === 'media' && previewUrl && isImage && (
            <img src={previewUrl} alt='' className='max-h-full max-w-full object-contain' />
          )}
          {mode === 'media' && previewUrl && isVideo && (
            <video src={previewUrl} className='h-full w-full object-cover' controls playsInline />
          )}
          {mode === 'media' && previewUrl && mediaFile && !isImage && !isVideo && (
            <p className='p-4 text-center text-sm text-white/80'>Use an image or video file.</p>
          )}
        </div>

        {mode === 'text' && (
          <div className='mt-4 flex flex-wrap gap-2'>
            {BG_COLORS.map((color) => (
              <button
                key={color}
                type='button'
                onClick={() => setBackgroundColor(color)}
                className='size-8 rounded-full ring-2 ring-white/30'
                style={{ backgroundColor: color }}
                aria-label={`Background ${color}`}
              />
            ))}
          </div>
        )}

        <button
          type='button'
          onClick={handleSubmit}
          disabled={submitting}
          className='mt-4 w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-60'
        >
          {submitting ? 'Sharing…' : 'Share story'}
        </button>
      </div>
    </div>
  )
}

export default StoryModal
