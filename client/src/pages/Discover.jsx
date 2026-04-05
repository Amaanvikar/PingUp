import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import UserCard from '../components/UserCard'

/**
 * Discover people: loads from POST /api/user/discover with `{ input: string }`.
 * Empty string = broad search on the server (your API regex).
 */
const Discover = () => {
  const { getToken } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(
    async (input) => {
      setLoading(true)
      try {
        const token = await getToken()
        if (!token) {
          setUsers([])
          return
        }

        const { data } = await api.post(
          '/api/user/discover',
          { input: input.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (data.success) {
          setUsers(data.users ?? [])
        } else {
          toast.error(data.message ?? 'Search failed')
          setUsers([])
        }
      } catch (err) {
        toast.error(err.response?.data?.message ?? err.message ?? 'Search failed')
        setUsers([])
      } finally {
        setLoading(false)
      }
    },
    [getToken]
  )

  // First paint: show everyone (or whatever your API returns for empty `input`).
  useEffect(() => {
    loadUsers('')
  }, [loadUsers])

  const onSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    loadUsers(searchText)
  }

  return (
    <div className='h-full overflow-y-auto bg-slate-50 px-4 py-8 no-scrollbar sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-5xl space-y-6'>
        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          <div className='flex items-center gap-3'>
            <span className='rounded-lg bg-slate-100 p-2 text-slate-700'>
              <Users className='h-5 w-5' />
            </span>
            <h1 className='text-2xl font-bold text-slate-900'>Discover people</h1>
          </div>
          <p className='mt-1 text-sm text-slate-500'>
            Search by name, username, email, or location. Press Enter to search.
          </p>
        </div>

        <div className='rounded-2xl bg-white p-4 shadow-sm'>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'>
            <Search className='h-4 w-4 shrink-0 text-slate-400' />
            <input
              type='search'
              placeholder='Try a name or @username, then press Enter'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={onSearchKeyDown}
              className='w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400'
            />
          </div>
        </div>

        {loading ? (
          <p className='rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm'>Loading…</p>
        ) : users.length === 0 ? (
          <p className='rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm'>
            No users found. Change your search and press Enter.
          </p>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {users.map((u) => (
              <UserCard key={u._id} user={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
