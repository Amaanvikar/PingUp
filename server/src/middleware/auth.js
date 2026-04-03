import { getAuth } from "@clerk/express";

export const protect = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        next();
    } catch (e) {
        return res.status(401).json({ success: false, message: e.message });
    }
};
