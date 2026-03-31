import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyConnectionsData, dummyPostsData, dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'
import PostCard from '../components/PostCard'
import UserProfileInfo from '../components/UserProfileInfo'

const currentUserId = dummyUserData._id

const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'media', label: 'Media' },
  { id: 'likes', label: 'Likes' },
]

const Profile = () => {
  const { profileId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => {
    const resolved =
      profileId != null
        ? dummyConnectionsData.find((u) => u._id === profileId) ?? dummyUserData
        : dummyUserData

    setUser(resolved)
    const userPosts = dummyPostsData.filter((p) => p.user?._id === resolved._id)
    setPosts(userPosts)
  }, [profileId])

  const mediaItems = useMemo(() => {
    const items = []
    posts.forEach((post) => {
      ;(post.image_urls ?? []).forEach((url, i) => {
        items.push({ key: `${post._id}-${i}`, url, post })
      })
    })
    return items
  }, [posts])

  const isOwnProfile = user?._id === currentUserId

  if (!user) {
    return <Loading />
  }

  return (
    <div className='h-full overflow-y-auto no-scrollbar bg-slate-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-3xl space-y-6'>
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='relative h-40 bg-slate-200 sm:h-48'>
            {user.cover_photo ? (
              <img src={user.cover_photo} alt='' className='h-full w-full object-cover' />
            ) : (
              <div className='h-full w-full bg-gradient-to-r from-slate-200 to-slate-100' />
            )}
          </div>

          <div className='px-5 pb-6 pt-0 sm:px-8'>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8'>
              <div className='relative z-10 shrink-0 -mt-12 sm:-mt-16'>
                <img
                  src={user.profile_picture}
                  alt=''
                  className='h-24 w-24 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-slate-200/80 sm:h-32 sm:w-32'
                />
              </div>
              <div className='min-w-0 flex-1 sm:pb-1'>
                <UserProfileInfo
                  user={user}
                  postsCount={posts.length}
                  isOwnProfile={isOwnProfile}
                  setShowEdit={setShowEdit}
                />
              </div>
            </div>
          </div>
        </div>

        {showEdit && (
          <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm'>
            Placeholder: add your edit-profile form when <strong>showEdit</strong> is true.
          </div>
        )}

        <div className='flex justify-center'>
          <div className='inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm'>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <p className='text-sm text-slate-500'>No posts yet.</p>
              ) : (
                <div className='flex flex-col gap-5'>
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'media' && (
            <>
              {mediaItems.length === 0 ? (
                <p className='text-sm text-slate-500'>No photos or media on posts yet.</p>
              ) : (
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3'>
                  {mediaItems.map(({ key, url }) => (
                    <div
                      key={key}
                      className='aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-100'
                    >
                      <img src={url} alt='' className='h-full w-full object-cover' />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'likes' && (
            <p className='text-sm text-slate-500'>
              Liked posts will show here once you connect them to your API.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default Profile
