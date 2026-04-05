import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  messages: [],
}

/** Load chat history with one user. Server: GET /api/message/get?to_user_id=… */
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ token, peerId }) => {
    if (!token || !peerId) return { success: false, messages: [] }
    const { data } = await api.get('/api/message/get', {
      params: { to_user_id: peerId },
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }
)

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessages: (state, action) => {
      const next = Array.isArray(action.payload) ? action.payload : [action.payload]
      state.messages = [...state.messages, ...next]
    },
    resetMessages: (state) => {
      state.messages = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      const data = action.payload
      if (!data?.success) {
        state.messages = []
        return
      }
      const list = data.messages ?? []
      // API returns newest first; show oldest at top in the UI
      state.messages = [...list].reverse()
    })
  },
})

export const { addMessages, resetMessages } = messagesSlice.actions
export default messagesSlice.reducer
