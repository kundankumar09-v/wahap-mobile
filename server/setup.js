#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const envPath = path.join(__dirname, ".env");

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log("✅ .env file already exists. Skipping setup.");
  process.exit(0);
}

console.log("\n⚠️  Setting up MongoDB Atlas connection for your team...\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("📋 Ask your team lead for the MONGODB_URI connection string:\n> ", (mongodbUri) => {
  if (!mongodbUri.trim()) {
    console.log("❌ MONGODB_URI is required!");
    process.exit(1);
  }

  const envContent = `# Created by setup.js - Team database connection
# ⚠️ NEVER commit this file to git (it contains sensitive credentials)
MONGODB_URI=${mongodbUri.trim()}
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ .env file created successfully!");
  console.log("✅ You can now run: node index.js\n");
  
  rl.close();
});

