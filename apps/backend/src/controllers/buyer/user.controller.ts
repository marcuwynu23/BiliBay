import {Request, Response} from "express";
import User from "../../models/user";
import bcrypt from "bcryptjs";

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "buyer") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for buyers"});
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({error: "User not found"});
    res.json(user);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "buyer") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for buyers"});
    }

    const {firstName, middleName, lastName, birthday, phone, defaultShippingAddress} = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({error: "User not found"});

    if (firstName) user.firstName = firstName;
    if (middleName !== undefined) user.middleName = middleName || undefined;
    if (lastName) user.lastName = lastName;
    if (birthday) {
      const birthdayDate = new Date(birthday);
      if (!isNaN(birthdayDate.getTime())) {
        user.birthday = birthdayDate;
      }
    }
    if (phone) user.phone = phone;
    if (defaultShippingAddress) user.defaultShippingAddress = defaultShippingAddress;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    // Add full name for backward compatibility
    const fullName = user.middleName 
      ? `${user.firstName} ${user.middleName} ${user.lastName}`
      : `${user.firstName} ${user.lastName}`;
    userResponse.name = fullName;
    res.json(userResponse);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "buyer") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for buyers"});
    }

    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({error: "Current password and new password are required"});
    }

    if (newPassword.length < 6) {
      return res.status(400).json({error: "New password must be at least 6 characters"});
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({error: "User not found"});

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({error: "Current password is incorrect"});
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({message: "Password updated successfully"});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
