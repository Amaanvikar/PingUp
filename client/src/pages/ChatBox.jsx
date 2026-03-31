import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { dummyConnectionsData, dummyMessagesData, dummyUserData } from '../assets/assets'

const meId = dummyUserData._id

/** Sample messages in assets use this id instead of `user_2`; only merge for that peer. */
const LEGACY_PEER_ID = 'user_2zwZSCMRXQ9GaEEVLgm6akQo96i'

function normalizeUserId(value) {
  if (value == null) return ''
  if (typeof value === 'object' && value._id) return value._id
  return String(value)
}

function peerIdsForThread(peerId) {
  const ids = new Set([peerId])
  if (peerId === 'user_2') ids.add(LEGACY_PEER_ID)
  return ids
}

function isInThread(msg, peerId) {
  const fromId = normalizeUserId(msg.from_user_id)
  const toId = normalizeUserId(msg.to_user_id)
  const aliases = peerIdsForThread(peerId)

  const a = fromId === meId && aliases.has(toId)
  const b = toId === meId && aliases.has(fromId)
  return a || b
}

const ChatBox = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const endRef = useRef(null)

  const peer = useMemo(
    () => dummyConnectionsData.find((u) => u._id === userId),
    [userId]
  )

  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!peer) {
      setMessages([])
      return
    }
    const thread = dummyMessagesData
      .filter((m) => isInThread(m, peer._id))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    setMessages(thread)
  }, [peer])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !peer) return

    const newMsg = {
      _id: `local_${Date.now()}`,
      from_user_id: meId,
      to_user_id: peer._id,
      text,
      message_type: 'text',
      media_url: '',
      seen: false,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMsg])
    setDraft('')
  }

  if (!userId) {
    return (
      <div className='p-6 text-center text-sm text-slate-600'>
        Missing chat user.{' '}
        <Link to='/messages' className='font-medium text-indigo-600 hover:underline'>
          Back to messages
        </Link>
      </div>
    )
  }

  if (!peer) {
    return (
      <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center'>
        <p className='text-sm text-slate-600'>We couldn&apos;t find that user.</p>
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
          src={peer.profile_picture}
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
            const fromId = normalizeUserId(msg.from_user_id)
            const mine = fromId === meId
            const time = new Date(msg.createdAt).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })

            return (
              <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    mine ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
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

      <form
        onSubmit={sendMessage}
        className='shrink-0 border-t border-slate-200 bg-white p-3'
      >
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
