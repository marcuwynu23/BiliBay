import {Request, Response, NextFunction} from "express";
import {authMiddleware} from "../../middlewares/auth.middleware";
import jwt from "jsonwebtoken";

// This test doesn't need database, so we skip the setup
jest.setTimeout(10000);

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it("should call next() with valid token", () => {
    const token = jwt.sign({id: "123", role: "buyer"}, JWT_SECRET);
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toMatchObject({
      id: "123",
      role: "buyer",
    });
  });

  it("should return 401 if no authorization header", () => {
    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Unauthorized: No token provided",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token doesn't start with Bearer", () => {
    mockRequest.headers = {
      authorization: "Invalid token",
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Unauthorized: No token provided",
    });
  });

  it("should return 401 if token is invalid", () => {
    mockRequest.headers = {
      authorization: "Bearer invalid-token",
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Unauthorized: Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should handle different user roles", () => {
    const roles = ["buyer", "seller", "admin"] as const;

    roles.forEach((role) => {
      const token = jwt.sign({id: "123", role}, JWT_SECRET);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user?.role).toBe(role);
      // Reset for next iteration
      mockRequest.user = undefined;
    });
  });
});

