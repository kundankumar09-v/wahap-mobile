const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    city: { type: String, required: true },
    address: String,
    duration: String,
    date: String,
    endDate: String,
    ticketType: String, // Free or Paid
    ageLimit: String,   // 5yrs+
    language: String,   // for concerts etc.
    aboutEvent: String,

    eventImage: String,
    bannerImage: String,
    layoutImage: String,

    createdBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);