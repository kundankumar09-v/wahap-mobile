const express = require("express");
const router = express.Router();
const { recordVisit, getStallFeedback } = require("../controllers/visitController");

router.post("/record", recordVisit);
router.get("/feedback/:stallId", getStallFeedback);

module.exports = router;
