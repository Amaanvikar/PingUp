import React, { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import moment from 'moment'

const StoryViewer = ({ viewStory, setViewStory, stories = [] }) => {
  const index = stories.findIndex((s) => s._id === viewStory?._id)
  const story = viewStory
  const user = story?.user ?? story?.user_id

  const close = () => setViewStory(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setViewStory(null)
        return
      }
      const idx = stories.findIndex((s) => s._id === viewStory?._id)
      if (e.key === 'ArrowRight') {
        if (idx >= 0 && idx < stories.length - 1) setViewStory(stories[idx + 1])
        else setViewStory(null)
      }
      if (e.key === 'ArrowLeft') {
        if (idx > 0) setViewStory(stories[idx - 1])
        else setViewStory(null)
      }
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [viewStory, stories, setViewStory])

  if (!story) return null

  const goNext = () => {
    if (index >= 0 && index < stories.length - 1) setViewStory(stories[index + 1])
    else close()
  }

  const goPrev = () => {
    if (index > 0) setViewStory(stories[index - 1])
    else close()
  }

  return (
    <div
      className='fixed inset-0 z-[120] flex flex-col bg-black'
      role='dialog'
      aria-modal='true'
      aria-label='Story viewer'
    >
      <div className='flex shrink-0 gap-1 px-2 pt-3 sm:px-4'>
        {stories.map((s, i) => (
          <div key={s._id} className='h-0.5 flex-1 overflow-hidden rounded-full bg-white/25'>
            <div
              className='h-full rounded-full bg-white transition-[width] duration-300 ease-out'
              style={{ width: index >= 0 && i <= index ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      <div className='flex shrink-0 items-center gap-3 px-3 py-3 sm:px-4'>
        <img
          src={user?.profile_picture}
          alt=''
          className='size-9 shrink-0 rounded-full border border-white/30 object-cover'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold text-white'>{user?.full_name ?? user?.username ?? 'User'}</p>
          <p className='text-xs text-white/70'>{moment(story.createdAt).fromNow()}</p>
        </div>
        <button
          type='button'
          onClick={close}
          className='rounded-full p-2 text-white hover:bg-white/10'
          aria-label='Close story'
        >
          <X className='size-6' />
        </button>
      </div>

      <div className='relative min-h-0 flex-1'>
        {story.media_type === 'image' && story.media_url ? (
          <img src={story.media_url} alt='' className='h-full w-full object-contain' />
        ) : story.media_type === 'video' && story.media_url ? (
          <video
            src={story.media_url}
            className='h-full w-full object-contain'
            controls
            autoPlay
            playsInline
          />
        ) : (
          <div
            className='flex h-full w-full items-center justify-center p-8 sm:p-12'
            style={{ backgroundColor: story.background_color ?? '#4f46e5' }}
          >
            <p className='max-w-lg text-center text-lg leading-relaxed text-white sm:text-xl'>
              {story.content || 'Story'}
            </p>
          </div>
        )}

        <button
          type='button'
          onClick={goPrev}
          className='absolute inset-y-0 left-0 z-10 w-[20%] border-0 bg-transparent'
          aria-label='Previous story'
        />
        <button
          type='button'
          onClick={goNext}
          className='absolute inset-y-0 right-0 z-10 w-[20%] border-0 bg-transparent'
          aria-label='Next story'
        />

        {index > 0 && (
          <button
            type='button'
            onClick={goPrev}
            className='absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:block'
            aria-label='Previous'
          >
            <ChevronLeft className='size-8' />
          </button>
        )}
        {index >= 0 && index < stories.length - 1 && (
          <button
            type='button'
            onClick={goNext}
            className='absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:block'
            aria-label='Next'
          >
            <ChevronRight className='size-8' />
          </button>
        )}
      </div>
    </div>
  )
}

export default StoryViewer
