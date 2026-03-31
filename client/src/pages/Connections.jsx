import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, UserPlus, UserCheck, UserRoundPen, MessageSquare } from 'lucide-react'
import {
  dummyPendingConnectionsData as pendingConnections,
  dummyFollowersData as followers,
  dummyFollowingData as following,
  dummyConnectionsData as connections,

} from '../assets/assets'

const Connections = () => {

  const [activeTab, setActiveTab] = useState('Followers')
  const navigate = useNavigate()

  const dataArray = [
    { label: 'Followers', data: followers, icon: User },
    { label: 'Following', data: following, icon: UserCheck },
    { label: 'Pending', data: pendingConnections, icon: UserRoundPen },
    { label: 'Connections', data: connections, icon: UserPlus },
  ]



  return (
    <div className='h-full overflow-y-auto no-scrollbar bg-slate-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-5xl space-y-6'>
        {/* Title */}

        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          <h1 className='text-2xl font-bold text-slate-900'>Connections</h1>
          <p className='mt-1 text-sm text-slate-500'>
            See your network in one place and manage each connection type.
          </p>
        </div>

        {/* Counts */}

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {dataArray.map((item, index) => (
            <div key={index} className='rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm'>
              <b className='text-lg font-semibold text-slate-900'>{item.data.length}</b>
              <p className='mt-0.5 text-xs font-medium text-slate-500'>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}

        <div className='rounded-2xl border border-slate-200 bg-white p-2 shadow-sm'>
          {dataArray.map((tab) => (
            <button
              onClick={() => setActiveTab(tab.label)}
              key={tab.label}
              className={`mr-2 mb-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeTab === tab.label
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <tab.icon className='w-4 h-4' />
              <span>{tab.label}</span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.label ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
              >
                {tab.data.length}
              </span>
            </button>
          ))}
        </div>

        {/* Connections */}

        <div className='flex flex-wrap gap-6 mt-6'>
          {dataArray.find((items) => items.label === activeTab).data.map((User) => (
            <div key={User._id} className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <img src={User.profile_picture} alt={User.full_name} className='w-10 h-10 rounded-full object-cover' />

              <div className='flex-1'>
                <h2 className='text-lg font-semibold text-slate-900'>{User.full_name}</h2>
                <p className='text-sm text-slate-500'>@{User.username}</p>
                <p className='text-sm text-slate-500'>{User.bio.slice(0, 30)}...</p>
                <div>
                  {
                    <button onClick={() => navigate(`/profile/${User._id}`)} className='rounded-lg bg-indigo-600 text-white px-4 py-2'>View Profile</button>
                  }
                  {
                    activeTab === 'Following' && (
                      <button className='rounded-lg bg-red-600 text-white px-4 py-2'>
                        Unfollow
                      </button>
                    )

                  }
                  {
                    activeTab === 'Pending' && (
                      <button className='rounded-lg bg-red-600 text-white px-4 py-2'>
                        Accept
                      </button>
                    )

                  }{
                    activeTab === 'Conections' && (
                      <button onClick={() => navigate(`/messages/${User._id}`)}
                        className='rounded-lg bg-red-600 text-white px-4 py-2'>
                        Message
                        <MessageSquare className='w-4 h-4' />
                      </button>
                    )

                  }
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Connections