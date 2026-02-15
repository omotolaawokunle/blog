const express = require("express");
const {
  seedDatabase,
  clearDatabase,
  getDatabaseStats,
} = require("../controllers/seedController");

const router = express.Router();

router.post("/", seedDatabase);
router.delete("/", clearDatabase);
router.get("/stats", getDatabaseStats);

module.exports = router;
