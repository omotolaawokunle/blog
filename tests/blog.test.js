const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const Blog = require("../src/models/Blog");

let authToken;
let userId;
let blogId;

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/blogging-api-test",
  );

  // Create test user and get token
  const signupRes = await request(app).post("/api/auth/signup").send({
    first_name: "Blog",
    last_name: "Author",
    email: "author@example.com",
    password: "password123",
  });

  authToken = signupRes.body.data.token;
  userId = signupRes.body.data._id;
});

afterAll(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Blog Endpoints", () => {
  describe("POST /api/blogs", () => {
    it("should create a new blog when authenticated", async () => {
      const res = await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "My First Blog Post",
          description: "This is a test blog",
          body: "This is the body of my first blog post. It contains some content to test the reading time calculation.",
          tags: ["test", "first"],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.state).toBe("draft");
      expect(res.body.data.reading_time).toBeGreaterThan(0);
      blogId = res.body.data._id;
    });

    it("should not create blog without authentication", async () => {
      const res = await request(app).post("/api/blogs").send({
        title: "Unauthorized Blog",
        body: "This should fail",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/blogs", () => {
    beforeAll(async () => {
      // Create a published blog
      await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Published Blog",
          body: "This is published",
          tags: ["published"],
        })
        .then(async (res) => {
          await request(app)
            .patch(`/api/blogs/${res.body.data._id}/state`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ state: "published" });
        });
    });

    it("should get published blogs without authentication", async () => {
      const res = await request(app).get("/api/blogs");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should paginate results", async () => {
      const res = await request(app)
        .get("/api/blogs")
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("page");
      expect(res.body).toHaveProperty("pages");
    });
  });

  describe("GET /api/blogs/:id", () => {
    let publishedBlogId;

    beforeAll(async () => {
      const createRes = await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Single Blog Test",
          body: "Testing single blog retrieval",
        });

      publishedBlogId = createRes.body.data._id;

      await request(app)
        .patch(`/api/blogs/${publishedBlogId}/state`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ state: "published" });
    });

    it("should get a single blog and increment read count", async () => {
      const res1 = await request(app).get(`/api/blogs/${publishedBlogId}`);
      const firstReadCount = res1.body.data.read_count;

      const res2 = await request(app).get(`/api/blogs/${publishedBlogId}`);

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data.read_count).toBe(firstReadCount + 1);
      expect(res2.body.data).toHaveProperty("author");
    });
  });

  describe("GET /api/blogs/me/posts", () => {
    it("should get user own blogs when authenticated", async () => {
      const res = await request(app)
        .get("/api/blogs/me/posts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should filter by state", async () => {
      const res = await request(app)
        .get("/api/blogs/me/posts")
        .query({ state: "draft" })
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      res.body.data.forEach((blog) => {
        expect(blog.state).toBe("draft");
      });
    });
  });

  describe("PATCH /api/blogs/:id/state", () => {
    it("should update blog state", async () => {
      const res = await request(app)
        .patch(`/api/blogs/${blogId}/state`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ state: "published" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.state).toBe("published");
    });
  });

  describe("PUT /api/blogs/:id", () => {
    it("should update blog content", async () => {
      const res = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          description: "Updated description",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe("Updated Title");
    });

    it("should not update blog by non-owner", async () => {
      // Create another user
      const otherUserRes = await request(app).post("/api/auth/signup").send({
        first_name: "Other",
        last_name: "User",
        email: "other@example.com",
        password: "password123",
      });

      const res = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set("Authorization", `Bearer ${otherUserRes.body.data.token}`)
        .send({ title: "Hacked Title" });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/blogs/:id", () => {
    it("should delete blog by owner", async () => {
      const res = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
