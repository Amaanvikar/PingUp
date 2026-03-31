import { Menu, X } from 'lucide-react'
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'
import AppSidebar from '../components/Sidebar'

const Layout = () => {

  const user = dummyUserData
  const [sidebarOpen, setsidebarOpen] = useState(false);

  return user ? (
    <div className='w-full flex h-screen'>
      <AppSidebar  sidebarOpen={sidebarOpen} setsidebarOpen={setsidebarOpen}/>

      <div className='flex min-h-0 flex-1 flex-col bg-slate-50'>
        <Outlet />
      </div>

      {
        sidebarOpen ?
          <X className='absolute top-3 right-3 g-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'
            onClick={() => setsidebarOpen(false)} />

          : <Menu className='absolute top-3 right-3 g-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'
            onClick={() => setsidebarOpen(true)} />
      }
    </div>
  ) : (
    <h1>
      <Loading />
    </h1>
  )
}

export default Layout