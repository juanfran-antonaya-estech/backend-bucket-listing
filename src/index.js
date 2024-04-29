import express from "express";
import cors from "cors";
import cathingoryRoutes from "./routes/cathingory.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express()

app.use(cors())
app.use(express.json())
app.use(cathingoryRoutes)
app.use(profileRoutes)

app.listen(3000)