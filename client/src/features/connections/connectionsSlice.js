import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const empty = {
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
}

const initialState = { ...empty }

export const fetchConnections = createAsyncThunk(
  'connections/fetchConnections',
  async (token) => {
    if (!token) return empty
    const { data } = await api.get('/api/user/connections', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!data.success) return empty
    return {
      connections: data.connections ?? [],
      followers: data.followers ?? [],
      following: data.following ?? [],
      pendingConnections: data.pendingConnections ?? [],
    }
  }
)

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      state.connections = action.payload.connections
      state.pendingConnections = action.payload.pendingConnections
      state.followers = action.payload.followers
      state.following = action.payload.following
    })
  },
})

export default connectionsSlice.reducer
