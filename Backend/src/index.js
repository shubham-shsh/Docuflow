import dotenv from "dotenv"
import conectDb from "./db/index.js"
dotenv.config({
    path : './.env'
})

conectDb()
