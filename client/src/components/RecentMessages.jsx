import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/** Who is the other person in this message? (not the logged-in user) */
function getOtherUser(message, myId) {
  const from = message.from_user_id
  const to = message.to_user_id
  const fromId = typeof from === 'object' ? from._id : from
  const toId = typeof to === 'object' ? to._id : to

  if (String(fromId) === String(myId)) {
    return typeof to === 'object' ? to : null
  }
  return typeof from === 'object' ? from : null
}

const RecentMessages = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setMessages([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const token = await getToken()
        const { data } = await api.get('/api/user/recent-messages', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (cancelled) return

        if (data.success) {
          setMessages(data.messages ?? [])
        } else {
          toast.error(data.message ?? 'Could not load messages')
          setMessages([])
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err.response?.data?.message ?? err.message ?? 'Could not load messages')
          setMessages([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user?.id, getToken])

  if (!user?.id) return null

  return (
    <div className='mt-6'>
      <h2 className='text-sm font-semibold text-gray-900'>Recent messages</h2>

      {loading ? (
        <p className='mt-3 text-xs text-gray-500'>Loading…</p>
      ) : messages.length === 0 ? (
        <p className='mt-3 text-xs text-gray-500'>No conversations yet.</p>
      ) : (
        <ul className='mt-3 space-y-1'>
          {messages.map((msg) => {
            const other = getOtherUser(msg, user.id)
            if (!other) return null

            const preview =
              msg.text?.trim() || (msg.message_type === 'image' ? 'Photo' : 'Message')

            const fromId = typeof msg.from_user_id === 'object' ? msg.from_user_id._id : msg.from_user_id
            const isUnread = !msg.seen && String(fromId) !== String(user.id)

            return (
              <li key={msg._id}>
                <Link
                  to={`/messages/${other._id}`}
                  className='group flex gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50'
                >
                  <img
                    src={other.profile_picture}
                    alt=''
                    className='size-10 shrink-0 rounded-full object-cover ring-2 ring-gray-100'
                  />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-baseline justify-between gap-2'>
                      <span className='truncate text-sm font-medium text-gray-900 group-hover:text-indigo-700'>
                        {other.full_name ?? other.username}
                      </span>
                      <span className='shrink-0 text-[11px] text-gray-400'>
                        {moment(msg.createdAt).fromNow(true)}
                      </span>
                    </div>
                    <p className='mt-0.5 truncate text-xs text-gray-500'>
                      {isUnread && (
                        <span
                          className='mr-1 inline-block size-1.5 rounded-full bg-indigo-500 align-middle'
                          aria-hidden
                        />
                      )}
                      {preview}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default RecentMessages
