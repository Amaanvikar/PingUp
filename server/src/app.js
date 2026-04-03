// import express from 'express';
// import userRoutes from './routes/user.routes.js';
// import cors from 'cors';
// import { serve } from "inngest/express";
// import { inngest, functions } from "./inngest/index.js";
// import connectDB from "./configs/db.js";
// import { clerkMiddleware } from "@clerk/express";

// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(503).json({ message: "Service unavailable" });
//   }
// });


// app.use(express.json());
// app.use(cors())
// app.use('/api/inngest', serve({client: inngest, functions}));
// app.use(clerkMiddleware());


// app.get("/", (_req, res) => {
//   res.status(200).json({ message: "PingUp API is running" });
// });

// app.use('/api/users', userRoutes);

// export default app;



