import getImageKit from "../configs/imagekit.js";
import fs from 'fs';
import Story from "../models/Story.js";
import User from "../models/user.js";

export const addStory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.files ?? [];

        let media_url = '';

        // upload media to imagekit
        if (media_type == 'image' || media_type == 'video') {
            const fileBuffer = fs.readFileSync(media.path);
            const imagekit = await imagekit.upload({
                file: fileBuffer,
                FileName: media.originalname,

            });
            media_url = response.url
        }

        // create story
        const story = await Story.create({
            user_id: userId,
            content,
            media_url,
            media_type,
            background_color,
        })

        // trigger inngest function to delete story after 24 hours

        await inngest.send({
            name: 'app/story.deleted',
            data: {
                storyId: story._id,
            }
        })

        res.json({ success: true })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}


//get user stories

export const getUserStories = async (req, res) => {

    try {
        const { userId } = req.auth();
        const user = await User.findById(userId)

        const userIds = [userId, ...user.connections, ...user.following]

        const stories = await Story.find({
            user: { $in: userIds }
        }).populate('user').sort({ createdAt: -1 });
        return res.json({ success: true, stories })

    }
    catch (e) {
        return res.json({ success: false, message: e.message })
    }
}