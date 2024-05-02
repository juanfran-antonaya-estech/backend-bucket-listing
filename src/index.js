import express from "express";
import cors from "cors";
import cathingoryRoutes from "./routes/cathingory.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import feedRoutes from "./routes/feed.routes.js";

const app = express()

app.use(cors())
app.use(express.json())
app.use(cathingoryRoutes)
app.use(profileRoutes)
app.use(feedRoutes)

app.listen(3000)