const { seedUsers } = require("../seeders/userSeeder");
const { seedBlogs } = require("../seeders/blogSeeder");
const User = require("../models/User");
const Blog = require("../models/Blog");

// @desc    Seed database with sample data
// @route   POST /api/seed
// @access  Public (should be protected in production)
const seedDatabase = async (req, res) => {
  try {
    const { userCount = 10, blogCount = 100 } = req.body;

    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Seeding is not allowed in production environment",
      });
    }

    const users = await seedUsers(userCount);
    const blogs = await seedBlogs(users, blogCount);

    const publishedCount = blogs.filter((b) => b.state === "published").length;
    const draftCount = blogs.filter((b) => b.state === "draft").length;

    res.status(200).json({
      success: true,
      message: "Database seeded successfully",
      data: {
        users: users.length,
        blogs: blogs.length,
        published: publishedCount,
        drafts: draftCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clear all data from database
// @route   DELETE /api/seed
// @access  Public (should be protected in production)
const clearDatabase = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Clearing database is not allowed in production environment",
      });
    }

    await Blog.deleteMany({});
    await User.deleteMany({});

    res.status(200).json({
      success: true,
      message: "Database cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get database statistics
// @route   GET /api/seed/stats
// @access  Public
const getDatabaseStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const blogCount = await Blog.countDocuments();
    const publishedCount = await Blog.countDocuments({ state: "published" });
    const draftCount = await Blog.countDocuments({ state: "draft" });

    const tagStats = await Blog.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const userBlogCounts = await Blog.aggregate([
      {
        $group: {
          _id: "$author",
          blogCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: {
            $concat: ["$user.first_name", " ", "$user.last_name"],
          },
          email: "$user.email",
          blogCount: 1,
        },
      },
      { $sort: { blogCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        blogs: {
          total: blogCount,
          published: publishedCount,
          drafts: draftCount,
        },
        topTags: tagStats.map((tag) => ({
          tag: tag._id,
          count: tag.count,
        })),
        topAuthors: userBlogCounts.map((author) => ({
          name: author.name,
          email: author.email,
          blogCount: author.blogCount,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  seedDatabase,
  clearDatabase,
  getDatabaseStats,
};
