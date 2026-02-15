require("dotenv").config();
const mongoose = require("mongoose");
const { seedUsers } = require("./userSeeder");
const { seedBlogs } = require("./blogSeeder");

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...\n");

    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blogging-api";

    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const userCount = 10;
    const blogCount = 100;

    const users = await seedUsers(userCount);
    await seedBlogs(users, blogCount);

    console.log("\n Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n Error seeding database:", error.message);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    console.log("Clearing database...\n");

    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blogging-api";

    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const User = require("../models/User");
    const Blog = require("../models/Blog");

    await Blog.deleteMany({});
    console.log("✓ Blogs cleared");

    await User.deleteMany({});
    console.log("✓ Users cleared");

    console.log("\n Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n Error clearing database:", error.message);
    process.exit(1);
  }
};

const command = process.argv[2];

if (command === "clear") {
  clearDatabase();
} else {
  seedDatabase();
}
