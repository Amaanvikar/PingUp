import React from 'react'
import { assets } from '../assets/assets'
import { Star } from 'lucide-react'

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-2 md:px-10 md:py-12">
        <aside className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white shadow-2xl md:p-12">
          <img className="mb-6 h-12 w-12 object-contain" src={assets.logo} alt="PingUp logo" />
          <h1 className="text-4xl font-black leading-tight md:text-5xl">More than just friends <br />truly connect</h1>
          <p className="mt-4 max-w-lg text-base text-blue-100 md:text-lg">Connect with global community on PingUp. Build relationships, share ideas, and make your social world richer.</p>

          <div className="mt-8 flex items-center gap-3">
            <img className="h-12 w-12 rounded-full border-2 border-white" src={assets.group_users} alt="community" />
            <div>
              <div className="flex items-center gap-1 text-amber-300">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="h-5 w-5" />
                ))}
              </div>
              <p className="text-sm text-blue-100">Used by developers</p>
            </div>
          </div>

          <img className="mt-8 w-full rounded-2xl object-cover" src={assets.bgImage} alt="community illustration" />
        </aside>

        <main className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Login to your account</h2>
            <p className="mb-6 text-sm text-slate-500">Enter your details to continue and connect with your network.</p>

            <form className="space-y-4">
              <input type="email" placeholder="Email" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              <input type="password" placeholder="Password" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition hover:opacity-95">Log in</button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">New here? <span className="font-semibold text-blue-600">Create an account</span></p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Login