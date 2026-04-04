import { cron, Inngest } from "inngest";
import User from "../models/user.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodemailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

export const inngest = new Inngest({ id: "pingup-app" });

/**
 * Clerk → Inngest: `event.data` is normally the Clerk User object from the webhook `data` field.
 * Some docs show a nested `{ user }` shape — support both.
 */
function clerkUserFromEventData(data) {
    if (!data || typeof data !== "object") return null;
    if (data.user && typeof data.user === "object" && data.user.id) return data.user;
    if (data.id && Array.isArray(data.email_addresses)) return data;
    return null;
}

/** User-shaped or minimal objects (e.g. user.deleted may only include `id`). */
function clerkEntityFromEventData(data) {
    const user = clerkUserFromEventData(data);
    if (user) return user;
    if (data && typeof data === "object" && data.id) return data;
    return null;
}

function primaryEmail(user) {
    if (!user?.email_addresses?.length) return "";
    const primaryId = user.primary_email_address_id;
    const match = primaryId
        ? user.email_addresses.find((e) => e.id === primaryId)
        : null;
    const picked = match ?? user.email_addresses[0];
    return picked?.email_address ?? picked?.email ?? "";
}

async function pickUniqueUsername(email) {
    const local = email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "user";
    let username = local;
    while (await User.exists({ username })) {
        username = `${local}${Math.floor(Math.random() * 1000000)}`;
    }
    return username;
}

const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
        triggers: [{ event: "clerk/user.created" }],
    },
    async ({ event }) => {
        const user = clerkUserFromEventData(event.data);
        if (!user) {
            console.warn(
                "[inngest sync-user-from-clerk] skipped: could not parse Clerk user from event.data",
                JSON.stringify(event.data)?.slice(0, 500)
            );
            return;
        }

        const { id, first_name, last_name, image_url } = user;
        const email = primaryEmail(user);
        if (!id || !email) {
            console.warn(
                "[inngest sync-user-from-clerk] skipped: missing id or primary email",
                { id, hasEmail: Boolean(email) }
            );
            return;
        }

        const username = await pickUniqueUsername(email);
        const full_name =
            `${first_name || ""} ${last_name || ""}`.trim() || email;

        await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    full_name,
                    email,
                    username,
                    profile_picture: image_url || "",
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
        );
        console.log("[inngest sync-user-from-clerk] upserted user", id);
    }
);

const syncUserUpdate = inngest.createFunction(
    {
        id: "update-user-from-clerk",
        triggers: [{ event: "clerk/user.updated" }],
    },
    async ({ event }) => {
        const user = clerkUserFromEventData(event.data);
        if (!user?.id) {
            console.warn(
                "[inngest update-user-from-clerk] skipped: could not parse Clerk user",
                JSON.stringify(event.data)?.slice(0, 500)
            );
            return;
        }

        const { id, first_name, last_name, image_url } = user;
        const email = primaryEmail(user);
        const full_name = `${first_name || ""} ${last_name || ""}`.trim();

        const $set = { profile_picture: image_url || "" };
        if (email) $set.email = email;
        if (full_name) $set.full_name = full_name;

        await User.findByIdAndUpdate(id, { $set });
        console.log("[inngest update-user-from-clerk] updated user", id);
    }
);

const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-from-clerk",
        triggers: [{ event: "clerk/user.deleted" }],
    },
    async ({ event }) => {
        const entity = clerkEntityFromEventData(event.data);
        const id = entity?.id;
        if (!id) return;
        await User.findByIdAndDelete(id);
    }
);


const sendNewConnectionRequestReminder = inngest.createFunction(
    {
        id: "send-new-connection-request-reminder",
        triggers: [{ event: "user/connection-request-sent" }],
    },
    async ({ event, step }) => {
        const { connectionId } = event.data;

        await step.run('send-connection-reques-mail', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
            const subject = `👋🏻 New Connection Request`;
            const body = `
            <p>Hello ${connection.to_user_id.full_name},</p>
            <p>You have a new connection request from ${connection.from_user_id.full_name}.</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections">here</a> to view your connections.</p>
            <p>Best regards,</p>
            <p>The PingUp Team</p>
            `;
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            });
        });

        await step.sleep("wait-for-24-hours", "24h");
        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');

            if (connection.status === 'accepted') {
                return { message: 'Connection already accepted' };
            }

            const subject = `👋🏻 New Connection Request`;
            const body = `
            <p>Hello ${connection.to_user_id.full_name},</p>
            <p>You have a new connection request from ${connection.from_user_id.full_name}.</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections">here</a> to view your connections.</p>
            <p>Best regards,</p>
            <p>The PingUp Team</p>
            `;
            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            });

            return { message: 'Reminder Sent' };
        });
    }
);

// delete function for user deletion after 24 hours


export const deleteUserStory = inngest.createFunction(
    {
        id: "delete-user-story",
        triggers: [{ event: "app/story.deleted" }],
    }, async ({ event, step }) => {
        const { storyId } = event.data;
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUnit("wait-for-24-hours", in24Hours)
        await step.run('delete-story', async () => {
            await Story.findByIdAndDelete(storyId);
            return { message: "Story deleted" }
        })
    });

const sendUserNotificationOfUnseenMessages = inngest.createFunction(
    {
        id: "send-unseen-messages-notification",
        triggers: [{ cron: "TZ=Asia/Kolkata 0 0 * * *" }]
    },
    async ({ step }) => {
        const message = await Message.find({ seen: false }).populate('to_user_id');
        const unseenCount = {}

        message.map(message => {
            unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0) + 1;
        })
        for (const userId in unseenCount) {
            const user = await User.findById(userId);

            const subject = `👋🏻 You have ${unseenCount[userId]} unseen messages`;

            const body = `
                <p>Hello ${user.full_name},</p>
                <p>You have ${unseenCount[userId]} unseen messages.</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/messages">here</a> to view your messages.</p>
                <p>Best regards,</p>
                <p>The PingUp Team</p>
                `;
            await sendEmail({
                to: user.email,
                subject,
                body
            })
        }

        return { message: "Notification sent" }
    }
)


export const functions = [
    syncUserCreation,
    syncUserUpdate,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteUserStory,
    sendUserNotificationOfUnseenMessages
];