import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import StoriesBar from '../components/StoriesBar'

const Feed = () => {

  const [feeds, setFeeds] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  return !isLoading ? (
    <div
      className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* stories and post */}
      <div>
        <StoriesBar/>
        <div
          className='p-4 space-y-6'>
          {feeds.map((post)=> (<PostCard key={post._id} post={post}/>))}
        </div>
      </div>

      {/* right sidebar */}
      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
        <h3 className='text-sm slate-800 font-semibold'>Sponsored</h3>
        <img src={assets.sponsored_img} alt="" className='-75 h-50 rounded-md'/>
        <p className='text-slate-600'>Email Marketing Software</p>
        <p className='text-slate-400'>Boost your email marketing with our powerful tools.</p>
        </div>
        <RecentMessages />
      </div>

    </div>
  ) : <Loading />
}

export default Feed