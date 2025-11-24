import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true 
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// global routes 
import userRouter from './routes/user.routes.js'
import documentRouter from './routes/documents.routes.js'
import whatsappRoutes from "./routes/whatsapp.routes.js";

app.use("/api/v1/Users" , userRouter);
app.use("/api/v1/Documents", documentRouter);
app.use("/api/v1/whatsapp", whatsappRoutes);

// global error handler (should be last)
app.use(errorHandler);

export { app };
