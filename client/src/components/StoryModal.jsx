import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = ['#4f46e5', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
  const [mode, setMode] = useState('text')
  const [backgroundColor, setBackgroundColor] = useState(bgColors[0])
  const [text, setText] = useState('')
  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMedia(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setMode('media')
  }

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setShowModal(false)
  }

  const handleCreateStory = async () => {
    // TODO: POST new story to API; then refresh list
    if (fetchStories) await fetchStories()
    handleClose()
  }

  const isImage = media?.type?.startsWith('image/')
  const isVideo = media?.type?.startsWith('video/')

  return (
    <div className='fixed inset-0 z-[110] min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'>
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
          <label className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm ${mode === 'media' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/80'}`}>
            Photo / Video
            <input type='file' accept='image/*,video/*' className='hidden' onChange={handleMediaUpload} />
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
          {mode === 'media' && previewUrl && media && !isImage && !isVideo && (
            <p className='p-4 text-center text-white/80 text-sm'>Use an image or video file.</p>
          )}
        </div>

        {mode === 'text' && (
          <div className='mt-4 flex flex-wrap gap-2'>
            {bgColors.map((color) => (
              <button
                key={color}
                type='button'
                onClick={() => setBackgroundColor(color)}
                className='size-8 rounded-full ring-2 ring-white/30'
                style={{ backgroundColor: color }}
                aria-label={`Background color ${color}`}
              />
            ))}
          </div>
        )}

        <button
          type='button'
          onClick={()=> toast.promise(handleCreateStory(),{
            loading: 'Creating story...',
            success: 'Story created successfully',
            error: 'Failed to create story',
          })}
          className='mt-4 w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-500'
        >
          Share story
        </button>
      </div>
    </div>
  )
}

export default StoryModal
