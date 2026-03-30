import React, { useEffect, useState } from 'react'
import { dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import PostCard from '../components/PostCard'
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
      <div>
        <div>
        <h1>Sponsored</h1>
        </div>
        <h1>Recent Message </h1>
      </div>

    </div>
  ) : <Loading />
}

export default Feed