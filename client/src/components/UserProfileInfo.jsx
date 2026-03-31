import { BadgeCheck, Calendar, MapPin, SquarePen } from 'lucide-react'
import moment from 'moment'
import React from 'react'

const UserProfileInfo = ({ user, isOwnProfile, setShowEdit, postsCount = 0 }) => {
  const followersCount = Array.isArray(user.followers) ? user.followers.length : 0
  const followingCount = Array.isArray(user.following) ? user.following.length : 0

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
      <div className='min-w-0 flex-1 space-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='text-xl font-semibold text-slate-900 sm:text-2xl'>{user.full_name}</h1>
          {user.is_verified && <BadgeCheck className='h-5 w-5 shrink-0 text-indigo-600' aria-hidden />}
        </div>
        <p className='text-sm text-slate-500'>{user.username ? `@${user.username}` : 'Add username'}</p>
        <p className='text-sm leading-relaxed text-slate-600'>{user.bio || 'No bio yet.'}</p>

        <div className='flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm text-slate-600'>
          <span className='inline-flex items-center gap-1.5'>
            <MapPin className='h-4 w-4 shrink-0 text-slate-400' />
            {user.location || 'Add location'}
          </span>
          {user.createdAt && (
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='h-4 w-4 shrink-0 text-slate-400' />
              Joined {moment(user.createdAt).fromNow()}
            </span>
          )}
        </div>

        <div className='mt-4 border-t border-slate-200 pt-4'>
          <div className='flex flex-wrap justify-between gap-4 sm:justify-start sm:gap-10'>
            <div className='text-center sm:text-left'>
              <p className='text-lg font-bold text-slate-900'>{postsCount}</p>
              <p className='text-sm text-slate-500'>Posts</p>
            </div>
            <div className='text-center sm:text-left'>
              <p className='text-lg font-bold text-slate-900'>{followersCount}</p>
              <p className='text-sm text-slate-500'>Followers</p>
            </div>
            <div className='text-center sm:text-left'>
              <p className='text-lg font-bold text-slate-900'>{followingCount}</p>
              <p className='text-sm text-slate-500'>Following</p>
            </div>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <button
          type='button'
          onClick={() => setShowEdit(true)}
          className='inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto'
        >
          <SquarePen className='h-4 w-4' />
          Edit
        </button>
      )}
    </div>
  )
}

export default UserProfileInfo
