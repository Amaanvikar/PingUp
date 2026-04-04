import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { inngest, functions } from "./src/inngest/index.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import connectDB from "./src/configs/db.js";
import postRouter from "./src/routes/postRoutes.js";
import storyRouter from "./src/routes/storyRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import messageRouter from "./src/routes/messageRoutes.js";

const app = express();
await connectDB();



app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (_req, res) =>
  res.send("Server is running"))
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/Story", storyRouter);
app.use("/api/message", messageRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at port=${PORT}`)
)

