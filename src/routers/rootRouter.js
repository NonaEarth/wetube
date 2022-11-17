//Node: Import modules.
import express from "express";
import { getJoin,
    getLogin,
    postJoin,
    postLogin } from "../controllers/userController.js";
import { home, search } from "../controllers/videoController.js";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);

//! Functions are not ready.
rootRouter.route("/login").all(publicOnlyMiddleware).get(getLogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;