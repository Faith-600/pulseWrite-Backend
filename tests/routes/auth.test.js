const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const authRoutes = require("../../routes/auth");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../../services/emailService");
const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

let mongoServer;
jest.mock("../../services/emailService");

// This function runs once before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// This function runs once after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// This function runs before each test to clear the database
beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth API", () => {
  describe("POST /register", () => {
    // Test case 1: Successful registration
    it("should register a new user and call sendVerificationEmail", async () => {
      sendVerificationEmail.mockClear();
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
      });

      // Check the response
      expect(res.statusCode).toEqual(201);
      expect(res.body.msg).toBe(
        "Registration successful. Please check your email for a verification code."
      );

      // Check if the user was actually created in the database
      const user = await User.findOne({ email: "test@example.com" });
      expect(user).not.toBeNull();
      expect(user.email).toBe("test@example.com");
      expect(user.verificationCode).toBeDefined();
      expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        user.email,
        user.verificationCode
      );
    });

    // Test case 2: User already exists
    it("should return 400 if user already exists", async () => {
      // First, create a user
      const existingUser = new User({
        email: "test@example.com",
        password: "password123",
      });
      await existingUser.save();

      // Then, try to register with the same email
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe("User already exists");
    });
  });

  describe("POST /verify", () => {
    let testUser;
    const verificationCode = "1234";

    // Before each test in this block, create a new unverified user
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      testUser = await new User({
        email: "verify@example.com",
        password: hashedPassword,
        isVerified: false,
        verificationCode: verificationCode,
        // Set expiry to 10 minutes from now
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      }).save();
    });

    it("should verify the user with a correct code", async () => {
      const res = await request(app).post("/api/auth/verify").send({
        email: "verify@example.com",
        code: verificationCode,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toBe(
        "Email verified successfully. You can now log in."
      );

      // Check the database to confirm the user is verified
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.verificationCode).toBeUndefined();
    });

    it("should return 400 for an incorrect verification code", async () => {
      const res = await request(app).post("/api/auth/verify").send({
        email: "verify@example.com",
        code: "9999", // Incorrect code
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe("Invalid verification code.");

      // Make sure the user is still unverified
      const user = await User.findById(testUser._id);
      expect(user.isVerified).toBe(false);
    });

    it("should return 400 if the verification code has expired", async () => {
      // Manually set the user's code to be expired (10 minutes in the past)
      testUser.verificationCodeExpires = new Date(Date.now() - 10 * 60 * 1000);
      await testUser.save();

      const res = await request(app).post("/api/auth/verify").send({
        email: "verify@example.com",
        code: verificationCode,
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe("Verification code has expired.");
    });
  });

  describe("POST /login", () => {
    // Before each test in this block, create a verified user
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await new User({
        email: "login@example.com",
        password: hashedPassword,
        isVerified: true, // This user is already verified
      }).save();
    });

    it("should log in a verified user with correct credentials and return a token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token"); // Check that a token is returned
    });

    it("should return 400 for incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe("Invalid Credentials");
      expect(res.body).not.toHaveProperty("token");
    });

    it("should return 401 for an unverified user", async () => {
      // Create a separate, unverified user for this specific test
      const hashedPassword = await bcrypt.hash("password123", 10);
      await new User({
        email: "unverified@example.com",
        password: hashedPassword,
        isVerified: false, // Explicitly unverified
      }).save();

      const res = await request(app).post("/api/auth/login").send({
        email: "unverified@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.msg).toBe("Please verify your email first.");
      expect(res.body).not.toHaveProperty("token");
    });
  });
});
