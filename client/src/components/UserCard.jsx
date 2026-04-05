import React from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { fetchUser } from '../features/user/userSlice'

/**
 * Card for one user on Discover (and similar lists).
 * Follow / Connect call your API; errors show as toasts.
 */
const UserCard = ({ user }) => {
  const me = useSelector((state) => state.user.user)
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const myId = me?._id
  const theirId = user?._id
  const isMe = Boolean(myId && theirId && myId === theirId)

  const iFollowThem = Boolean(
    myId && theirId && Array.isArray(me?.following) && me.following.includes(theirId)
  )
  const weAreConnected = Boolean(
    myId && theirId && Array.isArray(me?.connections) && me.connections.includes(theirId)
  )

  const authHeader = async () => {
    const token = await getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const handleFollow = async () => {
    if (!theirId || isMe) return
    try {
      const headers = await authHeader()
      const { data } = await api.post('/api/user/follow', { id: theirId }, { headers })

      if (data.success) {
        toast.success(data.message ?? 'Following')
        dispatch(fetchUser(await getToken()))
      } else {
        toast.error(data.message ?? 'Could not follow')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? err.message ?? 'Could not follow')
    }
  }

  const handleConnect = async () => {
    if (!theirId || isMe) return

    // Already connected → go to messages instead of sending another request
    if (weAreConnected) {
      navigate(`/messages/${theirId}`)
      return
    }

    try {
      const headers = await authHeader()
      const { data } = await api.post('/api/user/connect', { id: theirId }, { headers })

      if (data.success) {
        toast.success(data.message ?? 'Request sent')
        dispatch(fetchUser(await getToken()))
      } else {
        toast.error(data.message ?? 'Could not connect')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? err.message ?? 'Could not connect')
    }
  }

  if (!user) return null

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <img
          src={user.profile_picture || ''}
          alt=''
          className='h-11 w-11 rounded-full object-cover ring-2 ring-slate-100'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-slate-900'>{user.full_name}</p>
          {user.username && <p className='truncate text-xs text-slate-500'>@{user.username}</p>}
          {user.bio && <p className='mt-1 line-clamp-2 text-xs text-slate-600'>{user.bio}</p>}
        </div>
      </div>

      {!isMe && (
        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={handleFollow}
            disabled={iFollowThem}
            className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {iFollowThem ? 'Following' : 'Follow'}
          </button>
          <button
            type='button'
            onClick={handleConnect}
            className='rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700'
          >
            {weAreConnected ? 'Message' : 'Connect'}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserCard
