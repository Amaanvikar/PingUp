import Message from '../models/Message.js'
import fs from 'fs'
import { getImageKit } from '../configs/imagekit.js'


// create a empty  object to store ss events

const connections = {};

// controller function for sse endpoint

export const sseController = async (req, res) => {
    const { userId } = req.params;
    console.log("new user connected: ", userId);

    // set headers for sse

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Add the clients res object to the connection object
    connections[userId] = res;


    // send and initial event to the client
    res.write(`data: welcome to the chat\n\n`);

    // handle client disconnection
    req.on('close', () => {
        // remove the client from the connections object
        delete connections[userId];
        console.log("client disconnected: ", userId);
    })
}


export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth()
        const toUserId = req.body.toUserId ?? req.body.to_user_id
        const text = req.body.text ?? ''

        if (!toUserId) {
            return res.status(400).json({ success: false, message: 'Recipient is required' })
        }

        const image = req.file
        let media_url = ''
        let message_type = image ? 'image' : 'text'

        if (message_type === 'image' && image) {
            const ik = getImageKit()
            const fileBuffer = fs.readFileSync(image.path)
            const response = await ik.upload({
                file: fileBuffer,
                fileName: image.originalname || 'message.jpg',
                folder: 'messages',
            })
            media_url = ik.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' },
                ],
            })
        }

        if (message_type === 'text' && !String(text).trim() && !image) {
            return res.status(400).json({ success: false, message: 'Message text or image is required' })
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id: toUserId,
            text: String(text).trim(),
            message_type,
            media_url,
        })

        const messagewithUserData = await Message.findById(message._id)
            .populate('from_user_id')
            .populate('to_user_id')

        if (connections[toUserId]) {
            connections[toUserId].write(`data: ${JSON.stringify(messagewithUserData)}\n\n`)
        }

        return res.json({ success: true, message: messagewithUserData })
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: e.message })
    }
}


export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth()
        const to_user_id = req.query.to_user_id ?? req.body?.to_user_id

        if (!to_user_id) {
            return res.status(400).json({ success: false, message: 'to_user_id is required' })
        }

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId },
            ],
        })
            .populate('from_user_id')
            .populate('to_user_id')
            .sort({ createdAt: -1 })

        await Message.updateMany(
            { from_user_id: to_user_id, to_user_id: userId },
            { seen: true }
        )

        return res.json({ success: true, messages })
    } catch (e) {
        return res.json({ success: false, message: e.message })
    }
}


/** Latest message per chat partner (messages you sent or received). */
export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth()
        const me = String(userId)

        const all = await Message.find({
            $or: [{ from_user_id: me }, { to_user_id: me }],
        })
            .populate('from_user_id')
            .populate('to_user_id')
            .sort({ createdAt: -1 })
            .limit(300)

        const idOf = (u) =>
            u && typeof u === 'object' && u._id != null ? String(u._id) : String(u ?? '')

        const peerId = (msg) => {
            const from = idOf(msg.from_user_id)
            const to = idOf(msg.to_user_id)
            if (from === me) return to
            if (to === me) return from
            return ''
        }

        const latestByPeer = new Map()
        for (const m of all) {
            const p = peerId(m)
            if (!p || p === me) continue
            if (!latestByPeer.has(p)) latestByPeer.set(p, m)
        }

        const messages = [...latestByPeer.values()].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )

        return res.json({ success: true, messages })
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: e.message })
    }
}