import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MessageSquare, User, UserCheck, UserPlus, UserRoundPen } from 'lucide-react'
import api from '../api/axios'
import { fetchConnections } from '../features/connections/connectionsSlice'

const TABS = [
  { label: 'Followers', key: 'followers', icon: User },
  { label: 'Following', key: 'following', icon: UserCheck },
  { label: 'Pending', key: 'pendingConnections', icon: UserRoundPen },
  { label: 'Connections', key: 'connections', icon: UserPlus },
]

const Connections = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { getToken } = useAuth()

  const connectionsState = useSelector((state) => state.connections)
  const [activeKey, setActiveKey] = useState('followers')

  const load = useCallback(async () => {
    const token = await getToken()
    dispatch(fetchConnections(token))
  }, [dispatch, getToken])

  useEffect(() => {
    load()
  }, [load])

  const tabRows = TABS.map((tab) => ({
    ...tab,
    list: Array.isArray(connectionsState[tab.key]) ? connectionsState[tab.key] : [],
  }))

  const activeTab = tabRows.find((t) => t.key === activeKey) ?? tabRows[0]
  const people = activeTab.list

  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken()
      const { data } = await api.post('/api/user/unfollow', { id: userId }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        toast.success(data.message)
        await load()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message ?? error.message)
    }
  }

  const handleAccept = async (userId) => {
    try {
      const token = await getToken()
      const { data } = await api.post('/api/user/accept', { id: userId }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        toast.success(data.message)
        await load()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message ?? error.message)
    }
  }

  return (
    <div className='h-full overflow-y-auto bg-slate-50 px-4 py-8 no-scrollbar sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-5xl space-y-6'>
        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          <h1 className='text-2xl font-bold text-slate-900'>Connections</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Followers, following, pending requests, and connections in one place.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {tabRows.map((tab) => (
            <button
              key={tab.key}
              type='button'
              onClick={() => setActiveKey(tab.key)}
              className={`rounded-xl border px-4 py-3 text-center shadow-sm transition ${
                activeKey === tab.key
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <p className='text-lg font-semibold text-slate-900'>{tab.list.length}</p>
              <p className='mt-0.5 text-xs font-medium text-slate-500'>{tab.label}</p>
            </button>
          ))}
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <div className='mb-4 flex flex-wrap gap-2'>
            {tabRows.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => setActiveKey(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeKey === tab.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className='size-4' />
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeKey === tab.key ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {tab.list.length}
                  </span>
                </button>
              )
            })}
          </div>

          {people.length === 0 ? (
            <p className='py-8 text-center text-sm text-slate-500'>No one in this list yet.</p>
          ) : (
            <ul className='flex flex-col gap-4 sm:flex-row sm:flex-wrap'>
              {people.map((person) => {
                const bio = (person.bio ?? '').trim()
                const bioPreview = bio.length > 30 ? `${bio.slice(0, 30)}…` : bio

                return (
                  <li
                    key={person._id}
                    className='w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm'
                  >
                    <div className='flex gap-3'>
                      <img
                        src={person.profile_picture || ''}
                        alt=''
                        className='size-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100'
                      />
                      <div className='min-w-0 flex-1'>
                        <h2 className='font-semibold text-slate-900'>{person.full_name}</h2>
                        <p className='text-sm text-slate-500'>@{person.username}</p>
                        {bioPreview ? <p className='mt-1 text-sm text-slate-600'>{bioPreview}</p> : null}

                        <div className='mt-3 flex flex-wrap gap-2'>
                          <button
                            type='button'
                            onClick={() => navigate(`/profile/${person._id}`)}
                            className='rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700'
                          >
                            View profile
                          </button>

                          {activeKey === 'following' && (
                            <button
                              type='button'
                              onClick={() => handleUnfollow(person._id)}
                              className='rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700'
                            >
                              Unfollow
                            </button>
                          )}

                          {activeKey === 'pendingConnections' && (
                            <button
                              type='button'
                              onClick={() => handleAccept(person._id)}
                              className='rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700'
                            >
                              Accept
                            </button>
                          )}

                          {activeKey === 'connections' && (
                            <button
                              type='button'
                              onClick={() => navigate(`/messages/${person._id}`)}
                              className='inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-900'
                            >
                              <MessageSquare className='size-4' />
                              Message
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Connections
