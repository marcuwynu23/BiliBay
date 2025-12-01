import {Request, Response} from "express";
import User from "../../models/user";

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "buyer") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for buyers"});
    }
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
