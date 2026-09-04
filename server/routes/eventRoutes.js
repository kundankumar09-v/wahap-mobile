const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createEvent,
  getEvents,
  getEventById,
  deleteEvent,
  updateEvent
} = require("../controllers/eventcontroller");

router.post(
  "/create",
  upload.fields([
    { name: "eventImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
    { name: "layoutImage", maxCount: 1 }
  ]),
  createEvent
);

router.get("/", getEvents);

router.delete("/:id", deleteEvent);

router.put("/:id", updateEvent);

router.get("/:id", getEventById);

module.exports = router;