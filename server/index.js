const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const stallRoutes = require("./routes/stallRoutes");
const visitRoutes = require("./routes/visitRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://10.0.2.2:") || origin.startsWith("http://192.168.")) {
      return callback(null, true);
    }
    callback(null, true); // Permissive for hybrid mobile app connectivity
  },
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/banners", bannerRoutes);

app.get("/", (req, res) => {
  res.send("✅ WAHAP API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));