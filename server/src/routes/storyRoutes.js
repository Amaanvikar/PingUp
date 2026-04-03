import express from 'express';
import { upload } from '../configs/multer';
import { addStory, getUserStories } from '../controller/storyController';
import { protect } from '../middleware/auth';

const storyRouter = express.Router()

storyRouter.post('/create', upload.single('media'), protect, addStory)
storyRouter.post('/get', protect, getUserStories)

export default storyRouter;