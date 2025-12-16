import {Request, Response} from "express";
import {register, login} from "../../controllers/common/auth.controller";
import User from "../../models/user";
import bcrypt from "bcryptjs";

// Mock request and response
const createMockRequest = (body: any): Partial<Request> => ({
  body,
});

const createMockResponse = (): Partial<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const req = createMockRequest({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "buyer",
      }) as Request;

      const res = createMockResponse() as Response;

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            name: "Test User",
            email: "test@example.com",
            role: "buyer",
          }),
        })
      );

      // Verify user was created in database
      const user = await User.findOne({email: "test@example.com"});
      expect(user).toBeDefined();
      expect(user?.name).toBe("Test User");
    });

    it("should reject registration with missing fields", async () => {
      const req = createMockRequest({
        name: "Test User",
        // Missing email and password
      }) as Request;

      const res = createMockResponse() as Response;

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Name, email, and password are required",
        })
      );
    });

    it("should reject registration with short password", async () => {
      const req = createMockRequest({
        name: "Test User",
        email: "test@example.com",
        password: "12345", // Less than 6 characters
      }) as Request;

      const res = createMockResponse() as Response;

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Password must be at least 6 characters",
        })
      );
    });

    it("should reject duplicate email", async () => {
      await User.create({
        name: "Existing User",
        email: "existing@example.com",
        password: "hashedpassword",
      });

      const req = createMockRequest({
        name: "New User",
        email: "existing@example.com",
        password: "password123",
      }) as Request;

      const res = createMockResponse() as Response;

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Email already registered",
        })
      );
    });

    it("should default role to buyer if not provided", async () => {
      const req = createMockRequest({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }) as Request;

      const res = createMockResponse() as Response;

      await register(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            role: "buyer",
          }),
        })
      );
    });
  });

  describe("login", () => {
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
      const req = createMockRequest({
        email: "test@example.com",
        password: "password123",
      }) as Request;

      const res = createMockResponse() as Response;

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: "test@example.com",
          }),
        })
      );
    });

    it("should reject login with missing fields", async () => {
      const req = createMockRequest({
        email: "test@example.com",
        // Missing password
      }) as Request;

      const res = createMockResponse() as Response;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Email and password are required",
        })
      );
    });

    it("should reject login with invalid email", async () => {
      const req = createMockRequest({
        email: "nonexistent@example.com",
        password: "password123",
      }) as Request;

      const res = createMockResponse() as Response;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "User not found",
        })
      );
    });

    it("should reject login with invalid password", async () => {
      const req = createMockRequest({
        email: "test@example.com",
        password: "wrongpassword",
      }) as Request;

      const res = createMockResponse() as Response;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Invalid credentials",
        })
      );
    });

    it("should reject login for inactive account", async () => {
      await User.findOneAndUpdate(
        {email: "test@example.com"},
        {isActive: false}
      );

      const req = createMockRequest({
        email: "test@example.com",
        password: "password123",
      }) as Request;

      const res = createMockResponse() as Response;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Account is disabled",
        })
      );
    });
  });
});

