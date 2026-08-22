import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import cors from "cors";
import {
  generateSecret,
  buildUri,
  createVault,
  verifyTotpWithDelta,
} from "2fa-kit";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

//configuer dotenv
dotenv.config();

//mongodb connection
connectDB();

//initialize express
const app = express();

//middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

//routes
app.get("/", async (req, res) => {
  res.send("API is running...");
});

//register new user
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  //email and pass validation
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ error: "email already registered" });

  //password hashing
  const passwordHash = await bcrypt.hash(password, 10);

  //create user
  await User.create({ email, passwordHash });

  res.json({ message: "registered, please log in to set up 2FA" });
});

//login route
app.post("/login", async (req, res) => {
  const { email, password, code } = req.body;

  //validate email
  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ error: "invalid email or password" });

  //check user exist
  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk)
    return res.status(401).json({ error: "invalid email or password" });

  const vault = await createVault(process.env.MASTER_KEY);

  // if use is not enrolled, no secret yet --> first time, show QR
  if (!user.isEnrolled && !user.totpSecretEncrypted) {
    const secret = await generateSecret();
    const uri = buildUri({ label: user.email, secret, issuer: "MyApp" });
    const { encrypted, salt } = await vault.encrypt(secret);

    user.totpSecretEncrypted = encrypted;
    user.totpSalt = salt;
    await user.save();

    const qrBuffer = await QRCode.toBuffer(uri);
    return res.type("image/png").send(qrBuffer);
  }

  //if user is enrolled then ask for code
  if (!code) {
    return res.status(200).json({ requiresCode: true });
  }

  //decrypt secret
  const secret = await vault.decrypt(user.totpSecretEncrypted, user.totpSalt);
  const { valid, step } = await verifyTotpWithDelta(secret, code);

  //validate code
  if (!valid || step === undefined || step <= user.totpLastStep) {
    return res.status(401).json({ error: "invalid code" });
  }

  //jwt token
  user.totpLastStep = step;
  if (!user.isEnrolled) user.isEnrolled = true;
  await user.save();

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "48h",
    },
  );

  res.json({ message: "login successful", token });
});

//port
const PORT = process.env.PORT || 5000;

//listen backend server
app.listen(PORT, console.log(`Server running on port ${PORT}`));
