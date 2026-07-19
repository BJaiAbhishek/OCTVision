import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import diagnosisRoutes from "./routes/diagnosisRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

// Increase request body size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.use("/auth", authRoutes);
app.use("/diagnoses", diagnosisRoutes);
app.use("/support", supportRoutes);

app.use((error, _req, res, _next) => {
  if (error.name === "MulterError") {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image must be 10MB or smaller"
        : "Only one JPG or PNG image may be uploaded";
    return res.status(400).json({ error: message });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ error: "Unexpected server error" });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log("backend is running");
    });
  } catch (err) {
    console.error("failed to start the server", err);
    process.exit(1);
  }
}

startServer();
