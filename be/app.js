import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { residentRoutes } from "./src/routes/residentRoutes.js";
import { userRoutes } from "./src/routes/userRoutes.js";
import { systemLogRoutes } from "./src/routes/systemLogRoutes.js";
import { certificateRecordRoutes } from "./src/routes/certificateRoutes.js";

// ! FOR WEB HOSTING
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

let app = express();
dotenv.config();
app.listen(process.env.PORT);

// * MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// * connecting to the mongodb server
const connectMongoDB = async () => {
  try {
    const URL = process.env.MONGODB;
    const connected = await mongoose.connect(URL);
    if (connected) {
      console.log("CONNECTED TO MONGO DB");
      console.log(URL);
    } else {
      console.log("CANNOT CONNECT TO MONGO DB");
    }
  } catch (error) {
    console.error(error);
  }
};
await connectMongoDB();

// * dir for images (if applicable)
app.use("/api/images", express.static("./public/images"));
app.use("/api/files", express.static("./public/files"));

app.use("/api/residents", residentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/system-logs", systemLogRoutes);
app.use("/api/certificates", certificateRecordRoutes);

// ! TO RENDER FRONTEND ON WEB HOSTING
app.use(express.static(path.join(__dirname, "/fe/build/")));

// ! RENDER FRONTEND ON ANY PATH
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/fe/build/index.html"))
);

// * start server
app.get("/", async (req, res) => {
  res.json({ message: "Server Started", port: process.env.PORT });
});
