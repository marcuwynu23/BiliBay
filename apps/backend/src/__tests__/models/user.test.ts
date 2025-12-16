import User from "../../models/user";
import mongoose from "mongoose";

describe("User Model", () => {
  it("should create a new user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "buyer",
    };

    const user = await User.create(userData);

    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email.toLowerCase());
    expect(user.role).toBe(userData.role);
    expect(user.emailVerified).toBe(false);
    expect(user.isActive).toBe(true);
  });

  it("should lowercase email on save", async () => {
    const userData = {
      name: "Test User",
      email: "TEST@EXAMPLE.COM",
      password: "password123",
    };

    const user = await User.create(userData);
    expect(user.email).toBe("test@example.com");
  });

  it("should require name, email, and password", async () => {
    const userData = {
      name: "Test User",
      // Missing email and password
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it("should enforce unique email", async () => {
    const userData = {
      name: "Test User",
      email: "duplicate@example.com",
      password: "password123",
    };

    await User.create(userData);
    await expect(User.create(userData)).rejects.toThrow();
  });

  it("should default role to buyer", async () => {
    const userData = {
      name: "Test User",
      email: "buyer@example.com",
      password: "password123",
    };

    const user = await User.create(userData);
    expect(user.role).toBe("buyer");
  });

  it("should accept valid roles", async () => {
    const roles = ["buyer", "seller", "admin"] as const;

    for (const role of roles) {
      const userData = {
        name: `Test ${role}`,
        email: `${role}@example.com`,
        password: "password123",
        role,
      };

      const user = await User.create(userData);
      expect(user.role).toBe(role);
    }
  });

  it("should store shipping address", async () => {
    const userData = {
      name: "Test User",
      email: "shipping@example.com",
      password: "password123",
      defaultShippingAddress: {
        street: "123 Main St",
        city: "Manila",
        province: "Metro Manila",
        zipCode: "1000",
        country: "Philippines",
      },
    };

    const user = await User.create(userData);
    expect(user.defaultShippingAddress).toBeDefined();
    expect(user.defaultShippingAddress?.city).toBe("Manila");
  });
});

