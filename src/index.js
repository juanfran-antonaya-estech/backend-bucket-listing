import express from "express";
import cors from "cors";
import cathingoryRoutes from "./routes/cathingory.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import loginRoutes from "./routes/login.routes.js";
import suggestionsRoutes from "./routes/suggestions.routes.js";
import thingosRoutes from "./routes/thingos.routes.js";
import trendingRoutes from "./routes/trending.routes.js";
import reactionsRoutes from "./routes/reactions.routes.js";
import friendsRoutes from "./routes/friends.routes.js";

const app = express()

app.use(cors())
app.use(express.json())
app.use(cathingoryRoutes)
app.use(profileRoutes)
app.use(feedRoutes)
app.use(loginRoutes)
app.use(suggestionsRoutes)
app.use(thingosRoutes)
app.use(trendingRoutes)
app.use(reactionsRoutes)
app.use(friendsRoutes)

app.listen(3000)