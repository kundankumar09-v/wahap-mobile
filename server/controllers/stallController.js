const Stall = require("../models/stall");

// ✅ add marker
exports.addStall = async (req, res) => {
  try {
    const { eventId, name, type, x, y } = req.body;

    const stall = new Stall({ eventId, name, type, x, y });
    await stall.save();

    res.json({ success: true, stall });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ get markers of event
exports.getStalls = async (req, res) => {
  try {
    const { eventId } = req.params;
    const stalls = await Stall.find({ eventId });
    res.json(stalls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ delete stall
exports.deleteStall = async (req, res) => {
  try {
    const { stallId } = req.params;
    
    const deletedStall = await Stall.findByIdAndDelete(stallId);
    
    if (!deletedStall) {
      return res.status(404).json({ error: "Stall not found" });
    }
    
    res.json({ success: true, message: "Stall deleted successfully", stall: deletedStall });
  } catch (err) {
    console.error("DELETE STALL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};