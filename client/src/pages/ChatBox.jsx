import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { addMessages, fetchMessages, resetMessages } from '../features/messages/messagesSlice'

/** `from_user_id` / `to_user_id` may be a string id or a populated user object. */
function userIdFromRef(ref) {
  if (ref == null) return ''
  if (typeof ref === 'object' && ref._id != null) return String(ref._id)
  return String(ref)
}

const ChatBox = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { getToken } = useAuth()

  const me = useSelector((state) => state.user.user)
  const connections = useSelector((state) => state.connections.connections)
  const messages = useSelector((state) => state.messages.messages)

  const [peer, setPeer] = useState(null)
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)

  const myId = me?._id

  // Who you are chatting with: from Redux connections, or load profile by URL id.
  useEffect(() => {
    const fromList = connections.find((c) => c._id === userId)
    if (fromList) {
      setPeer(fromList)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const token = await getToken()
        if (!token || !userId) return
        const { data } = await api.get('/api/user/profiles', {
          params: { profileId: userId },
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!cancelled && data.success) setPeer(data.profile)
        else if (!cancelled) setPeer(null)
      } catch {
        if (!cancelled) setPeer(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId, connections, getToken])

  // Load messages for this thread; clear when leaving the chat.
  useEffect(() => {
    ;(async () => {
      const token = await getToken()
      if (!token || !userId) return
      dispatch(fetchMessages({ token, peerId: userId }))
    })()

    return () => {
      dispatch(resetMessages())
    }
  }, [userId, dispatch, getToken])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !userId) return

    try {
      const token = await getToken()
      if (!token) {
        toast.error('Sign in required')
        return
      }

      const formData = new FormData()
      formData.append('toUserId', userId)
      formData.append('text', text)

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success && data.message) {
        setDraft('')
        dispatch(addMessages([data.message]))
      } else {
        toast.error(data?.message ?? 'Could not send')
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? err.message ?? 'Could not send')
    }
  }

  if (!peer) {
    return (
      <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center'>
        <p className='text-sm text-slate-600'>Loading chat… or user not found.</p>
        <Link
          to='/messages'
          className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700'
        >
          Back to messages
        </Link>
      </div>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col bg-slate-100'>
      <header className='flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3'>
        <button
          type='button'
          onClick={() => navigate('/messages')}
          className='rounded-lg p-2 text-slate-600 hover:bg-slate-100'
          aria-label='Back to messages'
        >
          <ArrowLeft className='h-5 w-5' />
        </button>
        <img
          src={peer.profile_picture || ''}
          alt=''
          className='h-10 w-10 rounded-full object-cover ring-2 ring-slate-100'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold text-slate-900'>{peer.full_name}</p>
          <p className='truncate text-xs text-slate-500'>@{peer.username}</p>
        </div>
        <Link
          to={`/profile/${peer._id}`}
          className='shrink-0 text-sm font-medium text-indigo-600 hover:underline'
        >
          Profile
        </Link>
      </header>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4'>
        <div className='mx-auto flex max-w-2xl flex-col gap-3'>
          {messages.length === 0 && (
            <p className='text-center text-sm text-slate-500'>No messages yet. Say hello.</p>
          )}
          {messages.map((msg) => {
            const fromId = userIdFromRef(msg.from_user_id)
            const mine = myId != null && fromId === String(myId)
            const time = new Date(msg.createdAt).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })

            return (
              <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-indigo-600 text-white'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {msg.message_type === 'image' && msg.media_url ? (
                    <img
                      src={msg.media_url}
                      alt=''
                      className='mb-2 max-h-48 w-full rounded-lg object-cover'
                    />
                  ) : null}
                  {msg.text ? <p className='whitespace-pre-wrap'>{msg.text}</p> : null}
                  {!msg.text && msg.message_type === 'image' ? (
                    <span className='text-xs opacity-80'>Photo</span>
                  ) : null}
                  <p className={`mt-1 text-[10px] ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {time}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className='shrink-0 border-t border-slate-200 bg-white p-3'>
        <div className='mx-auto flex max-w-2xl gap-2'>
          <input
            type='text'
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder='Type a message…'
            className='min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
          />
          <button
            type='submit'
            disabled={!draft.trim()}
            className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Send className='h-4 w-4' />
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatBox
