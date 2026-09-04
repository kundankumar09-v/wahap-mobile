const Visit = require("../models/Visit");

exports.recordVisit = async (req, res) => {
  try {
    const { username, stallId, eventId, feedback, rating } = req.body;
    
    const newVisit = new Visit({
      username,
      stallId,
      eventId,
      feedback,
      rating
    });

    await newVisit.save();
    res.status(201).json({ success: true, message: "Visit recorded!", visit: newVisit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStallFeedback = async (req, res) => {
  try {
    const { stallId } = req.params;
    const visits = await Visit.find({ stallId }).sort({ createdAt: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
