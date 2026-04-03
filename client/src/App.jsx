import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import { useUser , useAuth} from '@clerk/clerk-react'
import Layout from './pages/Layout'
import toast, { Toaster } from 'react-hot-toast'

const App = () => {

  const { user, isLoaded: userLoaded } = useUser()
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!userLoaded || !authLoaded || !isSignedIn || !user || typeof getToken !== 'function') {
      return
    }

    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(
      /\/$/,
      ''
    )

    let cancelled = false
    getToken()
      .then(async (token) => {
        if (cancelled || !token) return
        const res = await fetch(`${apiBase}/api/user/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.success) {
          console.warn('MongoDB user sync failed:', data.message || res.status)
        }
      })
      .catch((err) => {
        console.error('Clerk getToken / sync failed:', err)
      })

    return () => {
      cancelled = true
    }
  }, [userLoaded, authLoaded, isSignedIn, user, getToken])
  return (
    <>
    <Toaster/>
      <Routes>
        <Route path='/' element={ !user ?  <Login /> : <Layout /> }>
          <Route index element={<Feed/>}/>
          <Route path='messages' element={<Messages/>}/>
           <Route path='messages/:userId' element={<ChatBox/>}/>
           <Route path='connections' element={<Connections/>}/>
           <Route path='discover' element={<Discover/>}/>
           <Route path='profile' element={<Profile/>}/>
           <Route path='profile/:profileId' element={<Profile/>}/>
           <Route path='create-post' element={<CreatePost/>}/>

        </Route>
      </Routes>
    </>

  )
}

export default App