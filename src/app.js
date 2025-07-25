import express from "express";
import { applysecuritymiddlewares } from "./middlewares/security.middlewares.js"

const app = express();

applysecuritymiddlewares(app);

//import routes
import healthcheckRouter from "./routes/health.routes.js";
import userRouter from "./routes/user.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import commentRouter from "./routes/comment.routes.js";
import postRouter from "./routes/post.routes.js";
import likeRouter from "./routes/like.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import bookmarkRouter from "./routes/bookmark.routes.js";
import progressRouter from "./routes/progress.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import learnerRoutes from "./routes/learner.routes.js";

//use routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/instructor", instructorRoutes);
app.use("/api/v1/learner", learnerRoutes);
app.use("/api/v1/bookmarks", bookmarkRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/quizzes", quizRouter);


app.use(errorHandler);
export { app };
