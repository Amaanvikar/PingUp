import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'
import api from '../api/axios'
import Loading from '../components/Loading'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import StoriesBar from '../components/StoriesBar'

function mapPostForCard(raw) {
  if (!raw) return raw
  const likes = raw.likes_count ?? raw.like_count ?? []
  return {
    ...raw,
    user: raw.user ?? raw.user_id,
    image_urls: raw.image_urls ?? raw.image_url ?? [],
    likes_count: Array.isArray(likes) ? likes : [],
  }
}

const Feed = () => {
  const { getToken } = useAuth()
  const [feeds, setFeeds] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFeeds = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      const { data } = await api.get('/api/post/feed', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (data.success) {
        setFeeds((data.posts ?? []).map(mapPostForCard))
      } else {
        toast.error(data.message ?? 'Could not load feed')
        setFeeds([])
      }
    } catch (error) {
      toast.error(error.response?.data?.message ?? error.message ?? 'Could not load feed')
      setFeeds([])
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className='flex h-full items-start justify-center overflow-y-scroll py-10 no-scrollbar xl:gap-8 xl:pr-5'>
      <div>
        <StoriesBar />
        <div className='space-y-6 p-4'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      <div className='sticky top-0 max-xl:hidden'>
        <div className='inline-flex max-w-xs flex-col gap-2 rounded-md bg-white p-4 text-xs shadow'>
          <h3 className='text-sm font-semibold text-slate-800'>Sponsored</h3>
          <img src={assets.sponsored_img} alt='' className='h-50 rounded-md' />
          <p className='text-slate-600'>Email Marketing Software</p>
          <p className='text-slate-400'>Boost your email marketing with our powerful tools.</p>
        </div>
        <RecentMessages />
      </div>
    </div>
  )
}

export default Feed
