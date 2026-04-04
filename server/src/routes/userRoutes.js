import express from 'express';
import {getUserData, syncClerkUser, updateUserData, discoverUsers, followUser, unfollowUser, sendConnectionRequest, acceptConnectionRequest, getUserConnections, getUserProfiles} from '../controller/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { getUserRecentMessages } from '../controller/messageController.js';

const userRouter = express.Router();

userRouter.post('/sync', syncClerkUser);
userRouter.get('/data', getUserData);
userRouter.post('/update', upload.fields([{name: 'profile', maxCount: 1}, {name: 'cover', maxCount: 1}]), protect, updateUserData);
userRouter.post('/discover', discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/connect', protect, sendConnectionRequest);
userRouter.post('/accept', protect, acceptConnectionRequest);
userRouter.get('/connections', protect, getUserConnections);
userRouter.get('/profiles', protect, getUserProfiles);
userRouter.get('/recent-messages', protect, getUserRecentMessages);

export default userRouter;