import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"

const conectDb = async () => {
    try{
        const conectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected: ${conectionInstance.connection.host}`)
    }catch(err){
        console.error(`Error: ${err.message}`)
        process.exit(1)
    }
}
export default conectDb