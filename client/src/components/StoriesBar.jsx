import React, { useEffect, useState } from 'react'
import { dummyStoriesData } from '../assets/assets'
import { Plus } from 'lucide-react'
import moment from 'moment'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'



const StoriesBar = () => {

    const [stories, setStories] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [viewStory, setViewStory] = useState(null)


    const [isLoading, setIsLoading] = useState(true)

    const fetchStories = async () => {
        setStories(dummyStoriesData)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchStories()
    }, [])

    if (isLoading) {
        return (
            <div className='px-4 pb-5'>
                <div className='h-40 max-w-2xl rounded-lg bg-slate-100 animate-pulse' />
            </div>
        )
    }

    return (
        <div className='w-full sm:w-[calc(100vw-15rem)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>
            <div className='flex gap-4 pb-5'>
                <div onClick={()=> setShowModal(true)}
                    className='rounded-lg shadow-sm min-w-28 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-indigo-300 bg-gradient-to-b from-indigo-50 to-white'
                >
                    <div className='h-full flex flex-col items-center justify-center p-2'>
                        <div className='size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3'>
                            <Plus className='w-5 h-5 text-white' />
                        </div>
                        <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
                    </div>
                </div>
                {/* stories cards*/}
                {stories.map((story) => (
                    <button
                        key={story._id}
                        type='button'
                        onClick={() => setViewStory(story)}
                        className='relative shrink-0 w-28 sm:w-32 aspect-[3/4] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left border-0 p-0 cursor-pointer bg-slate-200'
                    >
                        {story.media_type === 'image' && story.media_url ? (
                            <img src={story.media_url} alt='' className='h-full w-full object-cover' />
                        ) : story.media_type === 'video' && story.media_url ? (
                            <video
                                src={story.media_url}
                                className='h-full w-full object-cover'
                                muted
                                playsInline
                                preload='metadata'
                            />
                        ) : (
                            <div className='relative h-full w-full flex items-end p-2' style={{ backgroundColor: story.background_color }}>
                               
                                <p 
                                className='absolute top-18 left-3 text-white/60 text-sm truncate max-w-24'>
                                    {story.content}</p>
                                
                                <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>{moment(story.createdAt).fromNow()}</p>
                                {
                                    story.media_type === 'text' && (
                                        <div className='absolute bottom-2 right-2'>
                                            {
                                                story.media_type === 'image' ?
                                                    <img src={story.media_url} alt='' className='absolute bottom-2 right-2 w-10 h-10 rounded-full border-2 border-white object-cover bg-white' />
                                                    :
                                                    <video src={story.media_url} className='absolute bottom-2 right-2 w-10 h-10 rounded-full border-2 border-white object-cover bg-white' />
                                            }
                                        </div>
                                    )
                                }

                            </div>
                        )}
                        <img
                            src={story.user?.profile_picture}
                            alt=''
                            className='absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white object-cover bg-white'
                        />
                    </button>
                ))}
            </div>
            {/* story modal */}
            {
                showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />
            }
             {/* view story modal */}
             {viewStory && (
                <StoryViewer viewStory={viewStory} setViewStory={setViewStory} stories={stories} />
             )}
        </div>
    )
}

export default StoriesBar
