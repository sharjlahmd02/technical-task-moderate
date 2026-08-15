import express from "express"
import dotenv from "dotenv"


//configuer dotenv
dotenv.config()

//initialize express
const app = express()

//middleware
app.use(express.json())

//routes
app.get("/", async(req,res)=>{
    res.send("API is running...")
})

//port
const PORT = process.env.PORT || 5000

//listen backend server
app.listen(PORT, 
    console.log(`Server running on port ${PORT}`)
)