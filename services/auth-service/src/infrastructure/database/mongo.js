import mongoose from "mongoose";
import { getServiceEnv } from "@finboard/config";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(getServiceEnv().mongoUri);
  console.log("MongoDB connected");
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

