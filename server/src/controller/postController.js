import nodemailer from 'nodemailer';
import Post from '../models/Post.js';
import User from '../models/user.js';
import { getImageKit } from '../configs/imagekit.js';
import fs from 'fs';


export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, post_type } = req.body
        const images = req.files ?? []

        let image_url = []
        if (images.length) {
            const ik = getImageKit()
            image_url = await Promise.all(
                images.map(async (image) => {
                    const response = await ik.upload({
                        file: fs.readFileSync(image.path),
                        fileName: image.originalname,
                        folder: 'posts',
                    })
                    return ik.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '1280' },
                        ],
                    })
                })
            )
        }

        const allowed = ['text', 'image', 'text_with_image']
        const type = allowed.includes(post_type)
            ? post_type
            : image_url.length
              ? (String(content ?? '').trim() ? 'text_with_image' : 'image')
              : 'text'

        await Post.create({ user_id: userId, content, image_url, post_type: type })

        res.json({ success: true, message: 'Post created successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// get post 

export const getFeedPost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const me = await User.findById(userId)
        if (!me) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const userIds = [
            userId,
            ...(me.following ?? []),
            ...(me.connections ?? []),
        ]
        const posts = await Post.find({ user_id: { $in: userIds } })
            .populate('user_id')
            .sort({ createdAt: -1 })

        return res.json({ success: true, posts })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}

// like post 

export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { postId } = req.body;

        const postDoc = await Post.findById(postId)
        if (!postDoc) {
            return res.status(404).json({ success: false, message: 'Post not found' })
        }

        const likes = postDoc.like_count ?? []
        if (likes.includes(userId)) {
            postDoc.like_count = likes.filter((id) => id !== userId)
            await postDoc.save()
            return res.json({ success: true, message: 'Post Unliked' })
        }

        postDoc.like_count = [...likes, userId]
        await postDoc.save()
        return res.json({ success: true, message: 'Post Liked' })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}