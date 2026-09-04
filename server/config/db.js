const mongoose = require("mongoose");
const seedDB = require("./seed");
const fs = require("fs");
const path = require("path");

// Auto-load .env.development for team development
const devEnvPath = path.join(__dirname, "../.env.development");
if (fs.existsSync(devEnvPath)) {
  require("dotenv").config({ path: devEnvPath });
  console.log("📋 Loaded configuration from: .env.development (Team shared database)");
} else {
  require("dotenv").config();
  console.log("📋 Loaded configuration from: .env (Local override)");
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not set. Make sure .env.development exists or set MONGODB_URI environment variable.");
    }

    // Log first 50 chars of URI (for debugging without exposing credentials)
    const uriPreview = mongoURI.substring(0, 50) + "...";
    console.log(`📦 Connecting to: ${uriPreview}`);

    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected");
    await seedDB();
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;