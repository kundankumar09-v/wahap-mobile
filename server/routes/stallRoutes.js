
const express = require("express");
const router = express.Router();

const {
  addStall,
  getStalls,
  deleteStall,
} = require("../controllers/stallController");

router.post("/add", addStall);
router.delete("/delete/:stallId", deleteStall);
router.get("/:eventId", getStalls);

module.exports = router;