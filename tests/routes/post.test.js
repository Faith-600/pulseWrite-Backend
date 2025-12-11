// tests/routes/post.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const postRoutes = require("../../routes/post");
const User = require("../../models/user");
const Post = require("../../models/post");

const app = express();
app.use(express.json());
app.use("/api/posts", postRoutes);

// Middleware to simulate auth
app.use((req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
    } catch (err) {}
  }
  next();
});

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Post API - Update & Delete", () => {
  let userA, userB, tokenA, tokenB, postA;

  beforeAll(async () => {
    // Clear collections
    await User.deleteMany({});
    await Post.deleteMany({});

    // Create users
    userA = await User.create({
      name: "User A",
      email: "usera@test.com",
      password: "password123",
    });
    userB = await User.create({
      name: "User B",
      email: "userb@test.com",
      password: "password123",
    });

    // Generate JWT tokens
    tokenA = jwt.sign({ user: { id: userA._id } }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    tokenB = jwt.sign({ user: { id: userB._id } }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  beforeEach(async () => {
    await Post.deleteMany({});
    postA = await Post.create({
      title: "Post by A",
      content: "Content by A",
      author: userA._id,
    });
  });

  describe("PUT /api/posts/:id", () => {
    it("should allow the author to update their own post", async () => {
      const updatedData = {
        title: "Updated Title",
        content: "Updated Content",
      };
      const res = await request(app)
        .put(`/api/posts/${postA._id}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe("Updated Title");

      const updatedPost = await Post.findById(postA._id);
      expect(updatedPost.content).toBe("Updated Content");
    });

    it("should NOT allow a different user to update the post", async () => {
      const updatedData = { title: "Malicious Update", content: "Hacked" };
      const res = await request(app)
        .put(`/api/posts/${postA._id}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send(updatedData);

      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("User not authorized");
    });
  });

  describe("DELETE /api/posts/:id", () => {
    it("should allow the author to delete their own post", async () => {
      const res = await request(app)
        .delete(`/api/posts/${postA._id}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe("Post removed");

      const deletedPost = await Post.findById(postA._id);
      expect(deletedPost).toBeNull();
    });

    it("should NOT allow a different user to delete the post", async () => {
      const res = await request(app)
        .delete(`/api/posts/${postA._id}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("User not authorized");
    });
  });
});
