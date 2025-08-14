import dotenv from "dotenv"
import conectDb from "./db/index.js"
import { app } from "./app.js"
dotenv.config({
    path : './.env'
})

conectDb()
.then(() => {
app.on("error", (error) => {
    console.log("ERRR", error)
})
app.listen(process.env.PORT || 8000, () => {
    console.log(`server is running at port :  ${process.env.PORT}`)
})
})
.catch((error) => {
console.log("MONGO db connection failed !!!", error)
})
