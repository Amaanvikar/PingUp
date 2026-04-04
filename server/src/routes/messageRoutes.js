import express from 'express';
import { sendMessage, sseController ,getChatMessages} from '../controller/messageController';
import { protect } from '../middleware/auth';
import { upload } from '../configs/multer';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController);
messageRouter.post('/send',upload.single('image') ,protect, sendMessage);
messageRouter.get('/get', protect, getChatMessages);

export default messageRouter;