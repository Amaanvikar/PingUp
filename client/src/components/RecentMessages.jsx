import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { dummyRecentMessagesData, dummyUserData } from '../assets/assets'

const meId = dummyUserData._id

function getOtherUser(message) {
  const from = message.from_user_id
  const to = message.to_user_id
  const fromId = typeof from === 'object' ? from._id : from
  if (fromId !== meId) {
    return typeof from === 'object' ? from : null
  }
  return typeof to === 'object' ? to : null
}

const RecentMessages = () => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    setMessages(dummyRecentMessagesData)
  }, [])

  return (
    <div className='mt-6'>
      <h2 className='text-sm font-semibold text-gray-900'>Recent messages</h2>
      <ul className='mt-3 space-y-1'>
        {messages.map((msg) => {
          const other = getOtherUser(msg)
          if (!other) return null
          const preview = msg.text?.trim() || (msg.message_type === 'image' ? 'Photo' : 'Message')
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
                    {!msg.seen && <span className='mr-1 inline-block size-1.5 rounded-full bg-indigo-500 align-middle' aria-hidden />}
                    {preview}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RecentMessages
