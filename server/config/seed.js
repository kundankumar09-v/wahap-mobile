const mongoose = require("mongoose");
const Event = require("../models/event");
const Stall = require("../models/stall");

const grid = [12.5, 37.5, 62.5, 87.5];

// get random unique grid position
function getRandomPosition(used) {
  while (true) {
    const x = grid[Math.floor(Math.random() * grid.length)];
    const y = grid[Math.floor(Math.random() * grid.length)];

    const key = `${x}-${y}`;

    if (!used.has(key)) {
      used.add(key);
      return { x, y };
    }
  }
}

const seedData = async () => {
  try {

    // Check if events already exist
    const existingEvents = await Event.countDocuments();
    
    if (existingEvents > 0) {
      console.log("✅ Database already seeded. Preserving existing events.");
      return;
    }

    console.log("Seeding database with default events...");

    // Only delete if completely empty (first initialization)
    await Event.deleteMany({});
    await Stall.deleteMany({});

    const defaultEvents = [

      {
        name: "Neon Lights Music Concert",
        type: "concert",
        city: "Hyderabad",
        address: "Gachibowli Stadium",
        duration: "4 hours",
        date: "2026-12-15",
        ticketType: "Paid",
        ageLimit: "18+",
        language: "English/Hindi",
        aboutEvent: "Electrifying music concert with top artists.",
        eventImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&h=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "Tech Innovators Exhibition",
        type: "exhibition",
        city: "Bangalore",
        address: "BIEC Grounds",
        duration: "3 Days",
        date: "2026-10-05",
        ticketType: "Free",
        ageLimit: "All Ages",
        language: "English",
        aboutEvent: "Explore AI and robotics innovations.",
        eventImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "Laughter Riot Comedy Show",
        type: "comedy",
        city: "Mumbai",
        address: "NCPA Nariman Point",
        duration: "2 hours",
        date: "2026-11-20",
        ticketType: "Paid",
        ageLimit: "16+",
        language: "Hindi",
        aboutEvent: "Standup comedy show featuring top comedians.",
        eventImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "Sunburn Festival 2026",
        type: "concert",
        city: "Pune",
        address: "Vagad Ground",
        duration: "3 Days",
        date: "2026-12-28",
        ticketType: "Paid",
        ageLimit: "18+",
        language: "English/Hindi",
        aboutEvent: "Asia's biggest EDM festival.",
        eventImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "India Art & Culture Fest",
        type: "exhibition",
        city: "Delhi",
        address: "Pragati Maidan",
        duration: "5 Days",
        date: "2026-09-12",
        ticketType: "Free",
        ageLimit: "All Ages",
        language: "Hindi/English",
        aboutEvent: "Celebration of Indian art and culture.",
        eventImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&h=1200&q=80",
        layoutImage: "https://images.unsplash.com/photo-1560523159-4a9692d222ef?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "Future of AI Summit",
        type: "exhibition",
        city: "Hyderabad",
        address: "Hyderabad International Convention Centre",
        duration: "2 Days",
        date: "2026-08-22",
        ticketType: "Paid",
        ageLimit: "All Ages",
        language: "English",
        aboutEvent: "Leading AI researchers showcase innovations.",
        eventImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "Bollywood Beats Live",
        type: "concert",
        city: "Mumbai",
        address: "Andheri Sports Complex",
        duration: "3 hours",
        date: "2026-12-05",
        ticketType: "Paid",
        ageLimit: "All Ages",
        language: "Hindi",
        aboutEvent: "Dance to Bollywood music performed live.",
        eventImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "Open Mic Madness",
        type: "comedy",
        city: "Hyderabad",
        address: "Lamakaan Cultural Space",
        duration: "3 hours",
        date: "2026-10-30",
        ticketType: "Free",
        ageLimit: "16+",
        language: "Telugu/English/Hindi",
        aboutEvent: "Open mic night featuring new comedians.",
        eventImage: "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
        createdBy: "Admin"
      },

      {
        name: "Ciencia College Fest",
        type: "festival",
        city: "Hyderabad",
        address: "CVR College of Engineering",
        duration: "1 Day",
        date: "2026-09-15",
        ticketType: "Free",
        ageLimit: "All Ages",
        language: "English/Telugu",
        aboutEvent: "College fest with VR games, archery, squid game challenge and food stalls.",
        eventImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        createdBy: "Admin"
      }

    ];

    for (let eventData of defaultEvents) {

      const event = new Event(eventData);
      await event.save();

      const used = new Set();
      let stalls = [];

      if (event.name === "Ciencia College Fest") {

        stalls = [
          { name:"Main Entry", type:"entry" },
          { name:"Information Desk", type:"help" },
          { name:"Dodge in the Dark", type:"game" },
          { name:"Archery Challenge", type:"game" },
          { name:"VR Gaming Arena", type:"game" },
          { name:"Squid Game Challenge", type:"game" },
          { name:"Burger Stall", type:"food" },
          { name:"Pizza Corner", type:"food" },
          { name:"Main Stage", type:"stage" },
          { name:"Restroom", type:"restroom" },
          { name:"Exit Gate", type:"exit" }
        ];

      } else {

        stalls = [
          { name:"Main Entry", type:"entry" },
          { name:"Information", type:"help" },
          { name:"VIP Lounge", type:"stall" },
          { name:"Food Court", type:"food" },
          { name:"Restroom", type:"restroom" },
          { name:"Main Stage", type:"stage" },
          { name:"Exit Gate", type:"exit" }
        ];

      }

      for (let stallData of stalls) {

        const pos = getRandomPosition(used);

        stallData.x = pos.x;
        stallData.y = pos.y;

        // force exit gate to corner
        if (stallData.name === "Exit Gate") {
          stallData.x = 87.5;
          stallData.y = 87.5;
        }

        stallData.eventId = event._id;

        const stall = new Stall(stallData);
        await stall.save();
      }

    }

    console.log("✅ Database seeded successfully!");

  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
};

module.exports = seedData;