import express from "express";
import cors from "cors";
import cathingoryRoutes from "./routes/cathingory.routes.js";
impo

const app = express()

app.use(cors())
app.use(express.json())
app.use(cathingoryRoutes)

app.listen(3000)