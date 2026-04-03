// import crypto from "crypto";
// import bcrypt from "bcryptjs";
// import User from "../models/user.js";

// async function pickUniqueUsername(email) {
//     const local = email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "user";
//     let username = local;
//     while (await User.exists({ username })) {
//         username = `${local}${Math.floor(Math.random() * 1000000)}`;
//     }
//     return username;
// }

// export const register = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         if (!name || !email || !password) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         const existing = await User.findOne({ email });
//         if (existing) {
//             return res.status(409).json({ message: "Email already registered" });
//         }

//         const username = await pickUniqueUsername(email);
//         const hashed = await bcrypt.hash(password, 10);
//         const user = await User.create({
//             _id: crypto.randomUUID(),
//             full_name: name,
//             email,
//             username,
//             password: hashed,
//         });

//         return res
//             .status(201)
//             .json({ id: user._id, name: user.full_name, email: user.email });
//     } catch (error) {
//         console.error("register error", error);
//         return res.status(500).json({ message: "Server error" });
//     }
// };

// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ message: "Email and password required" });
//         }

//         const user = await User.findOne({ email }).select("+password");
//         if (!user || !user.password) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         const valid = await bcrypt.compare(password, user.password);
//         if (!valid) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         return res.json({
//             message: "Login successful",
//             user: { id: user._id, name: user.full_name, email: user.email },
//         });
//     } catch (error) {
//         console.error("login error", error);
//         return res.status(500).json({ message: "Server error" });
//     }
// };

// export const logout = async (_req, res) => {
//     return res.json({ message: "Logout successful" });
// };

// export const getAllUsers = async (_req, res) => {
//     try {
//         const users = await User.find({}).select("-password");
//         return res.json(users);
//     } catch (error) {
//         console.error("getAllUsers error", error);
//         return res.status(500).json({ message: "Server error" });
//     }
// };
