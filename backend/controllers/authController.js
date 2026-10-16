import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  provider: user.provider || null,
});

// ==============================
// REGISTER USER
// ==============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public sign-up always creates a customer. Provider accounts are linked to
    // a provider profile, so they are created by the seed script (or an admin),
    // never by choosing a role on the sign-up form.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "customer",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: createToken(user),
      user: userPayload(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ==============================
// LOGIN USER
// ==============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: createToken(user),
      user: userPayload(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ==============================
// GET CURRENT USER
// ==============================
export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      ...userPayload(req.user),
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
    },
  });
};

// ==============================
// UPDATE PROFILE (name, phone)
// ==============================
export const updateProfile = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name and phone are required",
    });
  }

  if (!/^[+\d][\d\s-]{6,19}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid phone number",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { returnDocument: "after", runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile updated",
    user: userPayload(user),
  });
};

// ==============================
// CHANGE PASSWORD
// ==============================
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current and new password are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  const user = await User.findById(req.user._id);
  const matches = await bcrypt.compare(currentPassword, user.password);

  if (!matches) {
    return res.status(400).json({
      success: false,
      message: "Your current password is incorrect",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed",
  });
};
