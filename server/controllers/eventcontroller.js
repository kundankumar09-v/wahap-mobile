const Event = require("../models/event");


// CREATE EVENT
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      type,
      city,
      address,
      duration,
      date,
      endDate,
      ticketType,
      ageLimit,
      language,
      aboutEvent,
      eventImageUrl,
      bannerImageUrl,
      layoutImageUrl,
    } = req.body;

    const normalizedType = type?.toLowerCase().trim();
    const normalizedCity = city?.trim();

    const newEvent = new Event({
      name,
      type: normalizedType,
      city: normalizedCity,
      address,
      duration,
      date,
      endDate,
      ticketType,
      ageLimit,
      language,
      aboutEvent,
      eventImage: eventImageUrl || req.files?.eventImage?.[0]?.path || "uploads/placeholder_event.jpg",
      bannerImage: bannerImageUrl || req.files?.bannerImage?.[0]?.path || "uploads/placeholder_banner.jpg",
      layoutImage: layoutImageUrl || req.files?.layoutImage?.[0]?.path || "uploads/placeholder_layout.jpg",
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });

  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// GET ALL EVENTS
exports.getEvents = async (req, res) => {
  try {
    let { city, type, query } = req.query;

    const filter = {};

    if (city && city !== "All" && city !== "All Cities") {
        filter.city = city.trim();
    }
    
    if (type) filter.type = type.toLowerCase().trim();
    
    if (query) {
      const searchTerm = query.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { type: { $regex: searchTerm, $options: "i" } },
        { aboutEvent: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } }
      ];
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });

    // Filter out expired events - keep only events that haven't ended yet
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`🔍 Filtering events. Today's date: ${today.toISOString()}`);
    
    const activeEvents = events.filter((event) => {
      // Keep events without dates
      if (!event.date && !event.endDate) return true;
      
      // Use endDate if available, otherwise use date
      const eventDateStr = event.endDate || event.date;
      if (!eventDateStr) return true;
      
      try {
        // Parse the date - handle both YYYY-MM-DD and other formats
        const eventDate = new Date(eventDateStr);
        
        // Check if date is valid
        if (isNaN(eventDate.getTime())) return true;
        
        // Set to end of day for comparison (so event shows on its last day)
        eventDate.setHours(23, 59, 59, 999);
        
        const isActive = eventDate >= today;
        console.log(`  Event: "${event.name}" | Date: ${eventDateStr} | Parsed: ${eventDate.toISOString()} | Active: ${isActive}`);
        
        // Keep if event date is today or in the future
        return isActive;
      } catch (err) {
        console.error(`Error parsing event date: ${eventDateStr}`, err);
        return true; // Keep event if date parsing fails
      }
    });

    console.log(`📊 Total events: ${events.length}, Active events: ${activeEvents.length}`);
    res.json(activeEvents);

  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// GET SINGLE EVENT (needed for EventDetails page)
exports.getEventById = async (req, res) => {
  try {

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);

  } catch (error) {
    console.error("GET EVENT BY ID ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// DELETE EVENT
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// UPDATE EVENT
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};