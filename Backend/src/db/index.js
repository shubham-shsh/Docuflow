import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import {Document} from "../models/document.model.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);

    await Document.syncIndexes();
    console.log("Indexes synced for Document model");
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDb;
