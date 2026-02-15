const express = require("express");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Blogging API",
    version: "1.0.0",
    endpoints: {
      auth: {
        signup: "POST /api/auth/signup",
        login: "POST /api/auth/login",
      },
      blogs: {
        getAll: "GET /api/blogs",
        getById: "GET /api/blogs/:id",
        create: "POST /api/blogs (auth required)",
        update: "PUT /api/blogs/:id (auth required)",
        updateState: "PATCH /api/blogs/:id/state (auth required)",
        delete: "DELETE /api/blogs/:id (auth required)",
        myBlogs: "GET /api/blogs/me/posts (auth required)",
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
