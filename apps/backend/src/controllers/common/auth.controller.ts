import {Request, Response} from "express";
import User from "../../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const {name, email, password, role} = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({name, email, password: hashed, role});
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) return res.status(404).json({error: "User not found"});

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({error: "Invalid credentials"});

    const token = jwt.sign({id: user._id, role: user.role}, "SECRET_KEY", {
      expiresIn: "1d",
    });
    res.json({token});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
