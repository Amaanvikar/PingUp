import { createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios.js'

const initialState = {
  user: null,
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
  const { data } = await api.get('/api/user/data', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.success ? data.user : null
})

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ formData, token }) => {
    const { data } = await api.post('/api/user/update', formData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (data.success) {
      toast.success(data.message)
      return data.user
    }
    toast.error(data.message)
    return null
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (action.payload) state.user = action.payload
      })
  },
})

export default userSlice.reducer
