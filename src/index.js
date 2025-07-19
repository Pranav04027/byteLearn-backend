//starts the server {app.listen()}, connects DB

import dotenv from "dotenv"
dotenv.config()// Imp to use. Otherwise dotenv will not work.

import {app} from "./app.js"
import connectDB from "./db/index.js"

const PORT = process.env.PORT || 8001

connectDB()
.then(() => {
    app.listen(PORT , () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection error" , err)
})