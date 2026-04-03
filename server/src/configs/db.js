import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const globalForMongoose = globalThis;
let cached = globalForMongoose.mongoose;
if (!cached) {
  cached = globalForMongoose.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  try {
    const mongoUri = process.env.MONGODB_URL;
    if (!mongoUri) {
      throw new Error("MONGODB_URL is not defined in environment variables");
    }
    if (!cached.promise) {
      cached.promise = mongoose.connect(mongoUri, { dbName: "pingup" }).then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      });
    }
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cached.promise = null;
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
