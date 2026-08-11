import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/instagram", (req, res) => {
  res.send("welcome to instagram page");
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// import routes

import healthcheckrouter from "./routes/healthcheck.routes.js"
import authrouter from "./routes/auth.routes.js"

app.use("/api/v1/healthcheck", healthcheckrouter);
app.use("/api/v1/auth", authrouter);

app.get("/", (req, res) => {
  res.send("welcome to basecampy")
});
export default app;