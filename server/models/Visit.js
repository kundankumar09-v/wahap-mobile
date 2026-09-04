const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema({
  username: { type: String, required: true },
  stallId: { type: mongoose.Schema.Types.ObjectId, ref: "Stall", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  feedback: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Visit", VisitSchema);
