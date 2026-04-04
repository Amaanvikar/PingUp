import express from 'express';
import { sendMessage, sseController ,getChatMessages} from '../controller/messageController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController);
messageRouter.post('/send',upload.single('image') ,protect, sendMessage);
messageRouter.get('/get', protect, getChatMessages);

export default messageRouter;