const Banner = require("../models/banner");

const DEFAULT_BANNERS = [
  {
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&h=460",
    alt: "Crowd enjoying a live show",
  },
  {
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&h=460",
    alt: "Music performance stage",
  },
  {
    image:
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&h=460",
    alt: "Festival lights and audience",
  },
];

const ensureDefaultBanners = async () => {
  const count = await Banner.countDocuments();
  if (count > 0) return;

  await Banner.insertMany(
    DEFAULT_BANNERS.map((item, index) => ({ ...item, order: index }))
  );
};

const normalizeOrder = async () => {
  const banners = await Banner.find().sort({ order: 1, createdAt: 1 });

  await Promise.all(
    banners.map((banner, index) => {
      if (banner.order === index) return null;
      banner.order = index;
      return banner.save();
    })
  );
};

exports.getBanners = async (_req, res) => {
  try {
    await ensureDefaultBanners();
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json(banners);
  } catch (error) {
    console.error("GET BANNERS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { image, alt } = req.body;

    if (!image || !image.trim()) {
      return res.status(400).json({ message: "Image URL is required." });
    }

    const last = await Banner.findOne().sort({ order: -1, createdAt: -1 });
    const order = last ? last.order + 1 : 0;

    await Banner.create({
      image: image.trim(),
      alt: (alt || "Website hero banner").trim(),
      order,
    });

    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.status(201).json(banners);
  } catch (error) {
    console.error("CREATE BANNER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const removed = await Banner.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: "Banner not found." });
    }

    await normalizeOrder();
    await ensureDefaultBanners();

    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json(banners);
  } catch (error) {
    console.error("DELETE BANNER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.moveBanner = async (req, res) => {
  try {
    const { direction } = req.body;
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    const index = banners.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Banner not found." });
    }

    const offset = direction === "up" ? -1 : direction === "down" ? 1 : 0;
    if (offset === 0) {
      return res.status(400).json({ message: "Direction must be 'up' or 'down'." });
    }

    const target = index + offset;
    if (target < 0 || target >= banners.length) {
      return res.status(400).json({ message: "Cannot move banner further." });
    }

    const currentBanner = banners[index];
    const swapBanner = banners[target];
    const currentOrder = currentBanner.order;

    currentBanner.order = swapBanner.order;
    swapBanner.order = currentOrder;

    await Promise.all([currentBanner.save(), swapBanner.save()]);

    const updated = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json(updated);
  } catch (error) {
    console.error("MOVE BANNER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.resetBanners = async (_req, res) => {
  try {
    await Banner.deleteMany({});
    await Banner.insertMany(
      DEFAULT_BANNERS.map((item, index) => ({ ...item, order: index }))
    );

    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json(banners);
  } catch (error) {
    console.error("RESET BANNERS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
