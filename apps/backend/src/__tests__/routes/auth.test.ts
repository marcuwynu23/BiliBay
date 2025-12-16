import request from "supertest";
import app from "../app";
import User from "../../models/user";
import bcrypt from "bcryptjs";

describe("Auth Routes", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          role: "buyer",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toMatchObject({
        name: "Test User",
        email: "test@example.com",
        role: "buyer",
      });
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for duplicate email", async () => {
      await User.create({
        name: "Existing User",
        email: "existing@example.com",
        password: "hashedpassword",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "New User",
          email: "existing@example.com",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Email already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "buyer",
        isActive: true,
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toMatchObject({
        email: "test@example.com",
      });
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });

    it("should return 401 for invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid credentials");
    });
  });
});

