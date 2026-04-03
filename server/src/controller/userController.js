import { getAuth, clerkClient } from "@clerk/express";
import { getImageKit } from "../configs/imagekit.js";
import User from "../models/user.js";
import fs from 'fs';
import Connection from "../models/Connection.js";
import { connection } from "mongoose";

async function pickUniqueUsernameForEmail(email, keepExisting) {
    if (keepExisting) return keepExisting;
    const local = email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "user";
    let username = local;
    while (await User.exists({ username })) {
        username = `${local}${Math.floor(Math.random() * 1000000)}`;
    }
    return username;
}

/** Load Clerk user and upsert into MongoDB. Returns Mongoose doc or null if Clerk user has no email. */
async function upsertUserFromClerkById(userId) {
    const clerkUser = await clerkClient.users.getUser(userId);
    const primary =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId) ??
        clerkUser.emailAddresses[0];
    const email = primary?.emailAddress;
    if (!email) {
        return null;
    }

    const existing = await User.findById(userId);
    const first = clerkUser.firstName ?? "";
    const last = clerkUser.lastName ?? "";
    const full_name = `${first} ${last}`.trim() || email;
    const username = await pickUniqueUsernameForEmail(email, existing?.username);
    const profile_picture = clerkUser.imageUrl ?? "";

    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                full_name,
                email,
                username,
                profile_picture,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return User.findById(userId);
}

/** Upsert MongoDB user from Clerk (explicit sync from client after sign-in). */
export const syncClerkUser = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await upsertUserFromClerkById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "Clerk user has no email" });
        }
        return res.json({ success: true, user });
    } catch (e) {
        console.error("syncClerkUser", e);
        return res.status(500).json({ success: false, message: e.message });
    }
};

// get User data — creates MongoDB row from Clerk on first request if missing
export const getUserData = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let user = await User.findById(userId);
        if (!user) {
            user = await upsertUserFromClerkById(userId);
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Could not sync user: Clerk account has no verified email yet",
            });
        }

        return res.json({ success: true, user });
    } catch (e) {
        console.error("getUserData", e);
        return res.status(500).json({ success: false, message: e.message });
    }
};

// update User data 
export const updateUserData = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        let { username, bio, location, full_name } = req.body
        const tempUser = await User.findById( userId )

        !username && (username = tempUser.username)


        if (tempUser.username != username){
            const user = await User.findOne({username})

            if (user){
                username = tempUser.username;
            }
        }

        const updatedData = {
            username,
            bio,
            location,
            full_name,
        }

        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.profile[0]

        if(profile){
            const imagekit = getImageKit();
            const buffer = fs.readFileSync(profile.path)
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: 512},
                ]
            })

            updatedData.profile_picture = url;
        }

        if(cover){
            const imagekit = getImageKit();
            const buffer = fs.readFileSync(cover.path)
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: 1280},
                ]
            })

            updatedData.cover_photo = url;
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, {new: true})

        res.json ({success: true, user, message: 'User data updated successfully'})

    } catch (e) {
        console.log(e)
        res.json({ success: false, message: e.message })
    }
}

// find users by username or full name

export const discoverUsers = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { input } = req.body;

        const allUser = await User.find(
            {

            $or:[
                {username: new RegExp(input, "i")},
                {email: new RegExp(input, "i")},
                {full_name: new RegExp(input, "i")},
                {location: new RegExp(input, "i")}
                ]   
            }
    )
        const filteredUsers = allUser.filter(user => user._id !== userId);

        res.json({success: true, users: filteredUsers})
        
    } catch (e) {
        console.log(e)
        res.json({ success: false, message: e.message })
    }
}

// Follow user

export const followUser = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { id } = req.body;

        const user = await User.findById(userId)

        if(user.following.includes(id)){
            return res.json({success: false, message: 'You are already following this user'})
        }

        user.following.push(id);
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers.push(userId)
        await toUser.save()

        res.json({success: false, message: 'User followed successfully'})
    } catch (e) {
        console.log(e)
        res.json({ success: false, message: e.message })
    }
}

// Unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { id } = req.body;

        const user = await User.findById(userId)

       user.following  = user.following.filter(user => user != id);
       await user.save()

       const toUser = await User.findById(id)
       toUser.followers = toUser.followers.filter(user => user != userId);
       await toUser.save()

        res.json({success: false, message: 'You are now unfollowed this user'})
    } catch (e) {
        console.log(e)
        res.json({ success: false, message: e.message })
    }
}


// Send connection request

export const sendConnectionRequest = async (req, res) => {
    try {
        const {userId} = req.auth()
        const { id} = req.body

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const connectionRequest = await Connection.find(
            {
                from_user_id: userId, 
                to_user_id: id, 
                createdAt: {$gt: last24Hours}
            })

            if(connectionRequest.length >= 20){
                return res.json({success: false, message: 'You have already sent a connection request to this user in the last 24 hours'})
            }

            const connection = await connection.findOne({
                $or:
                [
                    {from_user_id: userId, to_user_id: id},
                    {from_user_id: id, to_user_id: userId}
                ]
            })

            if(!connection){
                return res.json({success: true, message: 'connection request sent successfully'})
            } else if( connection && connection.status === 'accepted'){
                return res.json({success: false, message: 'You are already connected to this user'})
            } return res.json({success: false, message: 'connection request already pending'})

    } catch (e) {
        console.log(e)
        return res.json({success: false, message: e.message}) 
    }
}
 // Get user connections

export const getUserConnections = async (req, res) => {
    try{
        const {userId} =req.auth()
        const user = await findById(userId).populate('connection connections')

        const connections = user.connections
        const followers = user.followers
        const following = user.following


        const pendingConnections = (await Connection.find({to_user_id: userId, status: 'pending'}).populate('from_user_id')).
        map(connection => connection.from_user_id)

        res.josn({success: true, connections, followers, following , pendingConnections})
    } catch(error){
        res.json({success: false, message : error.message})
    }
}

// Accept connection request


export const acceptConnectionRequest = async(res, res) =>{
    try {
        const { userId } = req.auth()
        const { id } = req.body;

        const connnection = await Connection.findOne({from_user_id: id, to_user_id: userId})

        if(!connection){
            res.json({success: false, message: 'Connection not found'})
        }

        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save()

        const toUser = await User.findById(id);
        user.connections.push(userId);
        await toUser.save()

        connection.status = 'accepted';
        await connection.save()

        res.json({success: true, message: 'Connection accepted successfully'})

    } catch (e) {
        console.log(e)
        res.json({success: false, message : e.message})
    }
}