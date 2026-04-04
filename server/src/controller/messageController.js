import Message from '../models/Message.js';
import fs from 'fs';


// create a empty  object to store ss events

const connections = {};

// controller function for sse endpoint

export const sseController = async (req, res) => {
    const { userId } = req.params;
    console.log("new user connected: ", userId);

    // set headers for sse

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache'); f
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
        const { userId } = req.auth();
        const { toUserId, text } = req.body;

        const image = req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text';

        if (message_type === 'image' && image) {
            const fileBuffer = fs.readFileSync(image.path);
            const response = await ImageKit.upload({
                file: fileBuffer,
                filename: image.originalname
            });
            media_url = response.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' },
                ]
            })
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url,

        })

        // send message to to_user_id using sse

        const messagewithUserData = await Message.findById(message._id).populate('from_user_id').populate('to_user_id');


        if (connections[toUserId]) {
            connections[toUserId].write(`data: ${JSON.stringify(messagewithUserData)}\n\n`);
        }
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: e.Message })
    }
}


export const getChatMessages = async (req, res) => {
    try {

        const { userId } = req.auth()
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        }).sort({ createdAt: -1 })

        // mark message as seen 

        await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true })

        return res.json({ success: true, messages })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}


export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth()
        const messages = await Message.find({to_user_id: userId}).populate('from_user_id to_user_id').sort({createdAt: -1});
        return res.json({success: true, messages})
    } catch(e){
        console.log(e)
        return res.json({success: false, message: e.message})
    }
}