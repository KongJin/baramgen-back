import { PrismaClient } from "@prisma/client";
import express, { Express } from "express";
import morgan from "morgan";
import articleRouter from "./routers/articleRouter";
import commentRouter from "./routers/commentRouter";
import userRouter from "./routers/userRouter";
require("dotenv").config();

const app: Express = express();
const PORT = process.env.PORT || 4000;
const logger = morgan(process.env.PORT ? "short" : "dev");
export const client = new PrismaClient();

const handleListening = (): void => console.log(`Server Listening on: http://localhost:${PORT}`);

app.use(logger);
app.use("/user", userRouter);
app.use("/article", articleRouter);
app.use("/comment", commentRouter);

app.listen(PORT, handleListening);
