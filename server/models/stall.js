const mongoose = require("mongoose");

const stallSchema = new mongoose.Schema(
  {
    eventId: String,
    name: String,
    type: String, // stall, stage, restroom, etc.
    x: Number,
    y: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stall", stallSchema);