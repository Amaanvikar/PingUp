import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Plus } from 'lucide-react'
import moment from 'moment'
import toast from 'react-hot-toast'
import api from '../api/axios'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'

/** Author on a story: API adds `user`; older dummy data may use the same shape. */
function storyAuthor(story) {
  return story?.user ?? story?.user_id
}

/** Thumbnail for one story in the horizontal list. */
function StoryThumb({ story, onOpen }) {
  const author = storyAuthor(story)

  return (
    <button
      type='button'
      onClick={() => onOpen(story)}
      className='relative aspect-[3/4] w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border-0 bg-slate-200 p-0 text-left shadow-sm transition-shadow hover:shadow-md sm:w-32'
    >
      {story.media_type === 'image' && story.media_url && (
        <img src={story.media_url} alt='' className='h-full w-full object-cover' />
      )}
      {story.media_type === 'video' && story.media_url && (
        <video src={story.media_url} className='h-full w-full object-cover' muted playsInline preload='metadata' />
      )}
      {story.media_type === 'text' && (
        <div
          className='relative flex h-full w-full items-end p-2'
          style={{ backgroundColor: story.background_color ?? '#4f46e5' }}
        >
          <p className='line-clamp-4 text-sm text-white/90'>{story.content}</p>
          <p className='absolute bottom-1 right-2 text-xs text-white'>{moment(story.createdAt).fromNow()}</p>
        </div>
      )}

      <img
        src={author?.profile_picture}
        alt=''
        className='absolute left-2 top-2 size-8 rounded-full border-2 border-white bg-white object-cover'
      />
    </button>
  )
}

const StoriesBar = () => {
  const { getToken } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [viewStory, setViewStory] = useState(null)

  const loadStories = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        setStories([])
        return
      }

      // Server: POST /api/Story/get (not GET; path has capital "Story")
      const { data } = await api.post(
        '/api/Story/get',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setStories(data.stories ?? [])
      } else {
        toast.error(data.message ?? 'Could not load stories')
        setStories([])
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? err.message ?? 'Could not load stories')
      setStories([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadStories()
  }, [loadStories])

  if (loading) {
    return (
      <div className='px-4 pb-5'>
        <div className='h-40 max-w-2xl animate-pulse rounded-lg bg-slate-100' />
      </div>
    )
  }

  return (
    <div className='w-full overflow-x-auto px-4 no-scrollbar sm:w-[calc(100vw-15rem)] lg:max-w-2xl'>
      <div className='flex gap-4 pb-5'>
        <button
          type='button'
          onClick={() => setShowModal(true)}
          className='flex aspect-[3/4] min-h-40 min-w-28 max-w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-indigo-300 bg-gradient-to-b from-indigo-50 to-white p-2 shadow-sm transition hover:shadow-lg'
        >
          <div className='mb-3 flex size-10 items-center justify-center rounded-full bg-indigo-500'>
            <Plus className='size-5 text-white' />
          </div>
          <p className='text-center text-sm font-medium text-slate-700'>Create Story</p>
        </button>

        {stories.map((story) => (
          <StoryThumb key={story._id} story={story} onOpen={setViewStory} />
        ))}
      </div>

      {showModal && <StoryModal setShowModal={setShowModal} fetchStories={loadStories} />}

      {viewStory && (
        <StoryViewer viewStory={viewStory} setViewStory={setViewStory} stories={stories} />
      )}
    </div>
  )
}

export default StoriesBar
