import { User } from "../models/userModel.js";
import { hashPassword, comparePassword, signToken } from "../Utils/auth.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = signToken({ id: user._id, email: user.email });

    res.json({
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ id: user._id, email: user.email });

    res.json({
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Unable to fetch user" });
  }
}

export async function updatePassword(req, res) {
  try {
    const { newPassword } = req.body;
    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.trim().length < 6
    ) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = newPassword.trim();
    await user.save();

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ error: "Unable to update password" });
  }
}

export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return res
        .status(500)
        .json({ error: "Google login is not configured on the server" });
    }
    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res
        .status(401)
        .json({ error: "Google account email could not be verified" });
    }

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.findOne({ email: payload.email.toLowerCase() });
      if (user) {
        user.googleId = payload.sub;
        await user.save();
      } else {
        user = await User.create({
          name: payload.name || payload.email.split("@")[0],
          email: payload.email.toLowerCase(),
          googleId: payload.sub,
        });
      }
    }

    const token = signToken({ id: user._id, email: user.email });
    res.json({ token, user: userResponse(user) });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(401).json({ error: "Google sign-in could not be verified" });
  }
}
