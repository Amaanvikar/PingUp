import userRouter from "./src/routes/user.routes.js"; 
import { clerkMiddleware } from "@clerk/express";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import { inngest, functions } from "./src/inngest/index.js";
import express from "express";
import cors from "cors";
import connectDB from "./src/configs/db.js";
dotenv.config();


const app = express();
await connectDB();
app.use(express.json());
app.use(cors())
app.use(clerkMiddleware());

app.get("/", (_req, res) => {
  res.json({ message: "Server is running" });
});
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Server running at port " + PORT);
  });
}
