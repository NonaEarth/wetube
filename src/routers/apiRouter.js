import express from "express";
import { getSessionInfo } from "../controllers/userController.js";
import { registerView, createComment, deleteComment } from "../controllers/videoController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.post("/videos/delcomment/:commentId/:commentUserId", deleteComment);
apiRouter.post("/sessionInfo", getSessionInfo);

export default apiRouter;