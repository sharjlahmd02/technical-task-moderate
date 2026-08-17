import express from "express"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import { connectDB } from "./config/db.js"
import { User } from "./models/User.js"
import cors from "cors";


//configuer dotenv
dotenv.config()

//mongodb connection
connectDB()

//initialize express
const app = express()

//middleware
app.use(express.json())
app.use(cors())


//routes
app.get("/", async(req,res)=>{
    res.send("API is running...")
})

//register new user
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  //email and pass validation
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "email already registered" });

  //password hashing
  const passwordHash = await bcrypt.hash(password, 10);

  //create user
  await User.create({ email, passwordHash });

  res.json({ message: "registered, please log in to set up 2FA" });
});

//port
const PORT = process.env.PORT || 5000

//listen backend server
app.listen(PORT, 
    console.log(`Server running on port ${PORT}`)
)