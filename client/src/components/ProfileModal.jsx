import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { updateUser } from '../features/user/userSlice'

const ProfileModal = ({ open, onClose, user, onSave }) => {
  const dispatch = useDispatch()
  const { getToken } = useAuth()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [previewProfile, setPreviewProfile] = useState('')
  const [previewCover, setPreviewCover] = useState('')
  const [saving, setSaving] = useState(false)

  const profileBlobRef = useRef(null)
  const coverBlobRef = useRef(null)
  const profileFileRef = useRef(null)
  const coverFileRef = useRef(null)

  const revokePreviews = useCallback(() => {
    if (profileBlobRef.current) {
      URL.revokeObjectURL(profileBlobRef.current)
      profileBlobRef.current = null
    }
    if (coverBlobRef.current) {
      URL.revokeObjectURL(coverBlobRef.current)
      coverBlobRef.current = null
    }
    profileFileRef.current = null
    coverFileRef.current = null
  }, [])

  useEffect(() => {
    if (!open || !user) return
    revokePreviews()
    setFullName(user.full_name ?? '')
    setUsername(user.username ?? '')
    setBio(user.bio ?? '')
    setLocation(user.location ?? '')
    setPreviewProfile(user.profile_picture ?? '')
    setPreviewCover(user.cover_photo ?? '')
  }, [open, user, revokePreviews])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      revokePreviews()
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, revokePreviews])

  const onPickProfile = (file) => {
    if (!file) return
    profileFileRef.current = file
    if (profileBlobRef.current) URL.revokeObjectURL(profileBlobRef.current)
    profileBlobRef.current = URL.createObjectURL(file)
    setPreviewProfile(profileBlobRef.current)
  }

  const onPickCover = (file) => {
    if (!file) return
    coverFileRef.current = file
    if (coverBlobRef.current) URL.revokeObjectURL(coverBlobRef.current)
    coverBlobRef.current = URL.createObjectURL(file)
    setPreviewCover(coverBlobRef.current)
  }

  const close = () => {
    revokePreviews()
    onClose()
  }

  const save = async () => {
    const token = await getToken()
    if (!token) {
      toast.error('You must be signed in to save.')
      return
    }

    const formData = new FormData()
    formData.append('full_name', fullName.trim())
    formData.append('username', username.trim())
    formData.append('bio', bio.trim())
    formData.append('location', location.trim())
    if (profileFileRef.current) formData.append('profile', profileFileRef.current)
    if (coverFileRef.current) formData.append('cover', coverFileRef.current)

    setSaving(true)
    try {
      const updated = await dispatch(updateUser({ formData, token })).unwrap()
      if (!updated) return
      revokePreviews()
      onSave?.(updated)
      onClose()
    } catch (err) {
      toast.error(err?.message ?? 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  if (!open || !user) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
      <button
        type='button'
        className='absolute inset-0 bg-slate-900/40'
        onClick={close}
        aria-label='Close dialog'
      />

      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='edit-profile-title'
        className='relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id='edit-profile-title' className='text-lg font-bold text-slate-900'>
          Edit Profile
        </h2>

        <div className='mt-6 space-y-6'>
          <div>
            <p className='mb-2 text-xs font-medium text-slate-500'>Profile Picture</p>
            <label className='flex cursor-pointer flex-col items-start gap-2'>
              <div className='h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200'>
                {previewProfile ? (
                  <img src={previewProfile} alt='' className='h-full w-full object-cover' />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-xs text-slate-400'>No photo</div>
                )}
              </div>
              <span className='text-xs text-indigo-600 hover:underline'>Change photo</span>
              <input
                type='file'
                accept='image/*'
                className='sr-only'
                onChange={(e) => {
                  onPickProfile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          <div>
            <p className='mb-2 text-xs font-medium text-slate-500'>Cover Photo</p>
            <label className='block cursor-pointer'>
              <div className='h-32 w-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200'>
                {previewCover ? (
                  <img src={previewCover} alt='' className='h-full w-full object-cover' />
                ) : (
                  <div className='flex h-full items-center justify-center text-sm text-slate-400'>Add cover</div>
                )}
              </div>
              <span className='mt-1 inline-block text-xs text-indigo-600 hover:underline'>Change cover</span>
              <input
                type='file'
                accept='image/*'
                className='sr-only'
                onChange={(e) => {
                  onPickCover(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          <div>
            <label htmlFor='edit-name' className='mb-1 block text-xs font-medium text-slate-500'>
              Name
            </label>
            <input
              id='edit-name'
              type='text'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
            />
          </div>

          <div>
            <label htmlFor='edit-username' className='mb-1 block text-xs font-medium text-slate-500'>
              Username
            </label>
            <input
              id='edit-username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
            />
          </div>

          <div>
            <label htmlFor='edit-bio' className='mb-1 block text-xs font-medium text-slate-500'>
              Bio
            </label>
            <textarea
              id='edit-bio'
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className='w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
            />
          </div>

          <div>
            <label htmlFor='edit-location' className='mb-1 block text-xs font-medium text-slate-500'>
              Location
            </label>
            <input
              id='edit-location'
              type='text'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
            />
          </div>
        </div>

        <div className='mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6'>
          <button
            type='button'
            onClick={close}
            disabled={saving}
            className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={save}
            disabled={saving}
            className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50'
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
