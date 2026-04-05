import fs from 'fs'
import { getImageKit } from '../configs/imagekit.js'
import { inngest } from '../inngest/index.js'
import Story from '../models/Story.js'
import User from '../models/user.js'

/**
 * Multer `upload.single('media')` puts the file on `req.file` (not `req.files`).
 */
export const addStory = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, media_type, background_color } = req.body
        const file = req.file

        let media_url = ''

        const type = String(media_type || 'text').toLowerCase()

        if (type === 'image' || type === 'video') {
            if (!file?.path) {
                return res.status(400).json({
                    success: false,
                    message: 'A media file is required for image or video stories.',
                })
            }

            const ik = getImageKit()
            const buffer = fs.readFileSync(file.path)
            const response = await ik.upload({
                file: buffer,
                fileName: file.originalname || `story.${type === 'video' ? 'mp4' : 'jpg'}`,
                folder: 'stories',
            })

            // ImageKit: use transformations for images; videos use the uploaded file URL as-is.
            media_url =
                type === 'video'
                    ? ik.url({ path: response.filePath })
                    : ik.url({
                          path: response.filePath,
                          transformation: [
                              { quality: 'auto' },
                              { format: 'webp' },
                              { width: '720' },
                          ],
                      })
        }

        const story = await Story.create({
            user_id: userId,
            content: content ?? '',
            media_url,
            media_type: type,
            background_color: background_color ?? '#4f46e5',
        })

        try {
            await inngest.send({
                name: 'app/story.deleted',
                data: { storyId: String(story._id) },
            })
        } catch (inngestErr) {
            console.error('addStory: inngest.send failed', inngestErr)
        }

        return res.json({ success: true, message: 'Story created successfully' })
    } catch (error) {
        console.error('addStory', error)
        return res.json({ success: false, message: error.message })
    }
}

export const getUserStories = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const userIds = [userId, ...(user.connections ?? []), ...(user.following ?? [])]

        const raw = await Story.find({ user_id: { $in: userIds } })
            .populate('user_id')
            .sort({ createdAt: -1 })
            .lean()

        const stories = raw.map((s) => ({
            ...s,
            user: s.user_id ?? s.user,
        }))

        return res.json({ success: true, stories })
    } catch (e) {
        return res.json({ success: false, message: e.message })
    }
}
