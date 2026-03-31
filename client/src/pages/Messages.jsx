import React from 'react'
import { MessageSquare, Search, User, UserPlus } from 'lucide-react'
import { dummyConnectionsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Messages = () => {

  const navigate = useNavigate()

  return (
    <div className='h-full overflow-y-auto no-scrollbar py-8 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-4xl space-y-6'>
        {/* Title */}
        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          <h1 className='text-2xl font-bold text-slate-900'>Messages</h1>
          <p className='mt-1 text-sm text-slate-500'>
            See all your chats and stay connected with your people.
          </p>

          <div className='mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'>
            <Search className='h-4 w-4 text-slate-400' />
            <input
              type='text'
              placeholder='Search conversations'
              className='w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400'
            />
          </div>
        </div>

        {/* Connected users */}
        <div className='space-y-3'>
          {dummyConnectionsData.map((user) => (
            <div
              key={user._id}
              className='w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
            >
              <div className='flex items-center gap-4'>
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  className='h-14 w-14 rounded-full object-cover'
                />
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <h2 className='truncate text-base font-semibold text-slate-900'>
                      {user.full_name}
                    </h2>
                    <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'>
                      Online
                    </span>
                  </div>
                  <p className='mt-0.5 text-sm text-slate-500'>@{user.username}</p>
                  <p className='mt-1 line-clamp-1 text-sm text-slate-600'>{user.bio}</p>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className='rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'
                  >
                    <MessageSquare className='size-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className='rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'
                  >
                    <User className='size-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Messages