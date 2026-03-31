import React, { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import UserCard from '../components/UserCard'
import { dummyConnectionsData } from '../assets/assets'

const Discover = () => {
  const [input, setInput] = useState('')

  const filteredUsers = useMemo(() => {
    const query = input.trim().toLowerCase()
    if (!query) return dummyConnectionsData

    return dummyConnectionsData.filter((user) =>
      `${user.full_name} ${user.username} ${user.bio}`.toLowerCase().includes(query)
    )
  }, [input])

  return (
    <div className='h-full overflow-y-auto no-scrollbar bg-slate-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-5xl space-y-6'>
        {/* Title */}
        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          <div className='flex items-center gap-3'>
            <span className='rounded-lg bg-slate-100 p-2 text-slate-700'>
              <Users className='h-5 w-5' />
            </span>
            <h1 className='text-2xl font-bold text-slate-900'>Discover People</h1>
          </div>
          <p className='mt-1 text-sm text-slate-500'>
            Find new people to connect with and expand your network.
          </p>
        </div>

        {/* search */}
        <div className='rounded-2xl bg-white p-4 shadow-sm'>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'>
            <Search className='h-4 w-4 text-slate-400' />
            <input
              type='text'
              placeholder='Search by name, username, or bio'
              onChange={(e) => setInput(e.target.value)}
              value={input}
              className='w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400'
            />
          </div>
        </div>

        {/* users */}
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className='rounded-xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm'>
            No users found for this search.
          </p>
        )}

        
      </div>
    </div>
  )
}

export default Discover