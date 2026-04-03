import { Inngest } from "inngest";
import User from "../models/user.js";

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

export const functions = [syncUserCreation, syncUserUpdate, syncUserDeletion];
