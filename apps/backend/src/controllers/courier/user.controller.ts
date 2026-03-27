import {Request, Response} from "express";
import User from "../../models/user";

export const getCourierProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "courier") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for courier"});
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({error: "User not found"});
    res.json(user);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

