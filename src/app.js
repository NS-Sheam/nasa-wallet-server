//app.ts
import express from "express";

import cors from "cors";
import router from "./app/routes/index.js";
import config from "./app/config/index.js";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://nasa-wallet.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

export default app;
