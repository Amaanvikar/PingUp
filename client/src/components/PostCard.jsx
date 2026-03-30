import React, { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, Heart, X } from 'lucide-react'
import moment from 'moment'

/** Renders plain text with #hashtags wrapped for styling (no raw HTML). */
function contentWithHashtags(text) {
  if (text == null || text === '') return null
  const parts = text.split(/(#\w+)/g)
  return parts.map((part, i) =>
    /^#\w+$/.test(part) ? (
      <span key={i} className='font-medium text-indigo-600'>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}

const PostModal = ({ post, onClose }) => {
  const user = post?.user

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  if (!post) return null

  const likes = Array.isArray(post.likes_count) ? post.likes_count.length : 0

  return (
    <div
      className='fixed inset-0 z-[115] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6'
      role='dialog'
      aria-modal='true'
      aria-label='Post'
      onClick={onClose}
    >
      <div
        className='relative my-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl sm:my-0 sm:max-w-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-700 shadow-md hover:bg-gray-100'
          aria-label='Close'
        >
          <X className='size-5' />
        </button>

        <div className='border-b border-gray-100 p-4 pr-14'>
          <div className='flex gap-3'>
            <img
              src={user?.profile_picture}
              alt=''
              className='size-12 shrink-0 rounded-full object-cover ring-2 ring-gray-100'
            />
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-1.5'>
                <span className='font-semibold text-gray-900'>{user?.full_name}</span>
                {user?.is_verified && (
                  <BadgeCheck className='size-5 shrink-0 fill-indigo-600 text-white' aria-hidden />
                )}
              </div>
              <p className='text-sm text-gray-500'>
                @{user?.username} · {moment(post.createdAt).format('MMM D, YYYY · h:mm A')}
              </p>
            </div>
          </div>
        </div>

        <div className='max-h-[min(70vh,720px)] overflow-y-auto'>
          {post.content ? (
            <p className='whitespace-pre-wrap px-4 pb-4 pt-3 text-gray-800 leading-relaxed'>
              {contentWithHashtags(post.content)}
            </p>
          ) : null}

          {post.image_urls?.length > 0 && (
            <div className='space-y-2 px-4 pb-4'>
              {post.image_urls.map((url, i) => (
                <img
                  key={`${post._id}-img-${i}`}
                  src={url}
                  alt=''
                  className='w-full rounded-xl object-cover'
                />
              ))}
            </div>
          )}

          <div className='flex items-center gap-2 border-t border-gray-100 px-4 py-3 text-gray-600'>
            <Heart className='size-5 text-rose-500' aria-hidden />
            <span className='text-sm'>
              {likes} {likes === 1 ? 'like' : 'likes'}
            </span>
            <span className='text-xs text-gray-400'>· {post.post_type?.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const PostCard = ({ post }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const handleClose = useCallback(() => setModalOpen(false), [])
  const user = post?.user
  const previewImage = post?.image_urls?.[0]
  const likes = Array.isArray(post?.likes_count) ? post.likes_count.length : 0

  return (
    <>
      <article
        className='max-w-xl cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md'
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setModalOpen(true)
          }
        }}
        role='button'
        tabIndex={0}
        aria-label='Open post'
      >
        <div className='flex gap-3 p-4'>
          <img
            src={user?.profile_picture}
            alt=''
            className='size-11 shrink-0 rounded-full object-cover ring-2 ring-gray-100'
          />
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='font-semibold text-gray-900'>{user?.full_name}</span>
              {user?.is_verified && (
                <BadgeCheck className='size-4 shrink-0 fill-indigo-600 text-white' aria-hidden />
              )}
            </div>
            <p className='text-sm text-gray-500'>
              @{user?.username} · {moment(post.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {post.content ? (
          <p className='line-clamp-4 whitespace-pre-wrap px-4 pb-3 text-gray-800'>
            {contentWithHashtags(post.content)}
          </p>
        ) : null}

        {previewImage && (
          <div className='px-4 pb-4'>
            <img src={previewImage} alt='' className='max-h-80 w-full rounded-xl object-cover' />
            {post.image_urls?.length > 1 && (
              <p className='mt-2 text-center text-xs text-gray-500'>+{post.image_urls.length - 1} more in full post</p>
            )}
          </div>
        )}

        <div className='flex items-center gap-2 border-t border-gray-100 px-4 py-3 text-gray-600'>
          <Heart className='size-4 text-rose-500' aria-hidden />
          <span className='text-sm'>
            {likes} {likes === 1 ? 'like' : 'likes'}
          </span>
        </div>
      </article>

      {modalOpen && <PostModal post={post} onClose={handleClose} />}
    </>
  )
}

export default PostCard
