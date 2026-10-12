const OTP = require("../models/OTP");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "10d" });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return res.status(400).json({
      success: false,
      message: "User already exist",
    });
  }

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`otp for ${email} is ${otp}`);

    await OTP.create({ email, otp, action: "account_verification" });

    const emailSent = await sendOtpEmail(email, otp, "account_verification");

    if (!emailSent) {
      await User.deleteOne({ _id: user._id });
      await OTP.deleteMany({ email, action: "account_verification" });
      return res.status(500).json({
        success: false,
        message: "Could not send OTP email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User registered successfully and OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User does not exist",
    });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "Incorrect credentials",
    });
  }

  if (!user.isVerified && user.role === "user") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email, action: "account_verification" });

    await OTP.create({ email, otp, action: "account_verification" });

    const emailSent = await sendOtpEmail(email, otp, "account_verification");

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Could not send OTP email. Please try again later.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "User is not verified. OTP sent to your email",
    });
  }

  res.json({
    message: "User logged in successfully",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await OTP.findOne({
    email,
    otp,
    action: "account_verification",
  });

  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  const user = await User.findOneAndUpdate({ email }, { isVerified: true });
  await OTP.deleteMany({ email, action: "account_verification" });

  res.json({
    message: "User verified successfully",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
};
