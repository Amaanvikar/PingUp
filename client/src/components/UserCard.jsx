import React from 'react'
import { useSelector } from 'react-redux'

const UserCard = ({ user }) => {

  const loggedInUser = useSelector((state) => state.user.user)
  const handleFollow = () => {
    console.log('Followed')
  }

  const handleConnectionRequest = () => {
    console.log('Connection request sent')
  }

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className='h-11 w-11 rounded-full object-cover'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-slate-900'>{user.full_name}</p>
          {user.username && <p className='truncate text-xs text-slate-500'>@{user.username}</p>}
          {user.bio && <p className='mt-1 line-clamp-2 text-xs text-slate-600'>{user.bio}</p>}
        </div>
      </div>

      <div className='mt-4 flex items-center gap-2'>
        <button
          type='button'
          onClick={handleFollow}
          className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100'
        >
          Follow
        </button>
        <button
          type='button'
          onClick={handleConnectionRequest}
          className='rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700'
        >
          Connect
        </button>
      </div>
    </div>
  )
}

export default UserCard