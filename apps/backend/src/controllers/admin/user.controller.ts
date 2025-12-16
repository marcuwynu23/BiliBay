// controllers/admin/user.controller.ts
import {Request, Response} from "express";
import User from "../../models/user";

export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {role, page = 1, limit = 20} = req.query;

    const query: any = {};
    if (role) {
      query.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {id} = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    // Prevent disabling admin accounts
    if (user.role === "admin" && user._id.toString() === req.user.id) {
      return res.status(400).json({error: "Cannot disable your own admin account"});
    }

    user.isActive = !user.isActive;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

