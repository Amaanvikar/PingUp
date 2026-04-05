import express from 'express';
import { sendMessage, sseController ,getChatMessages} from '../controller/messageController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const messageRouter = express.Router()

// Static paths before `/:userId` so `/get` is not captured as userId "get"
messageRouter.get('/get', protect, getChatMessages)
messageRouter.post('/send', upload.single('image'), protect, sendMessage)
messageRouter.get('/:userId', sseController)

export default messageRouter;