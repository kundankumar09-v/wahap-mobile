const express = require("express");

const {
  getBanners,
  createBanner,
  deleteBanner,
  moveBanner,
  resetBanners,
} = require("../controllers/bannerController");

const router = express.Router();

router.get("/", getBanners);
router.post("/", createBanner);
router.delete("/:id", deleteBanner);
router.patch("/:id/move", moveBanner);
router.post("/reset", resetBanners);

module.exports = router;
