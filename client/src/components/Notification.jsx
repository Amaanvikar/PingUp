import React from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

/** `from_user_id` may be a populated user or a plain id string. */
function getSender(message) {
  const from = message?.from_user_id
  if (from && typeof from === 'object') return from
  return null
}

function getSenderId(message) {
  const from = message?.from_user_id
  if (from && typeof from === 'object') return from._id
  return from ?? ''
}

const Notification = ({ t, message }) => {
  const navigate = useNavigate()
  const sender = getSender(message)
  const senderId = getSenderId(message)

  const text = (message?.text ?? '').trim()
  const preview = text.length > 20 ? `${text.slice(0, 20)}…` : text || 'New message'

  const handleReply = () => {
    if (senderId) navigate(`/messages/${senderId}`)
    toast.dismiss(t.id)
  }

  return (
    <div className='flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-md'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <img
          src={sender?.profile_picture || ''}
          alt=''
          className='h-10 w-10 shrink-0 rounded-full object-cover'
        />
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-slate-900'>{sender?.full_name ?? 'Someone'}</p>
          <p className='truncate text-xs text-slate-500'>{preview}</p>
        </div>
      </div>
      <button
        type='button'
        onClick={handleReply}
        className='shrink-0 text-sm font-medium text-indigo-600 hover:underline'
      >
        Reply
      </button>
    </div>
  )
}

export default Notification
