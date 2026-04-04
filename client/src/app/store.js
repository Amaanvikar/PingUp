import { configureStore } from '@reduxjs/toolkit';
import  userReducer  from '../features/user/userSlice.js';
import  connectionsReducer  from '../features/connections/connectionsSlice.js';
import  messageReducer  from '../features/messages/messagesSlice.js';


const store = configureStore({
    reducer: {
        user: userReducer,
        connections: connectionsReducer,
        messages: messageReducer
    }
})

export default store;