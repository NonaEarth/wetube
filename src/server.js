// Node: Import modules.
import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "express-flash";

import { localsMiddleware } from "./middlewares.js";

// Node: Import routers.
import rootRouter from "./routers/rootRouter.js";
import videoRouter from "./routers/videoRouter.js";
import userRouter from "./routers/userRouter.js";
import apiRouter from "./routers/apiRouter.js";

// Create variables with modules.
const logger = morgan("dev");
const app = express();

app.use('/videos/upload', (req, res, next) => {
	res.header("Cross-Origin-Embedder-Policy", "require-corp");
	res.header("Cross-Origin-Opener-Policy", "same-origin");
	next();
});

// Express Configuration
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

// Applies to all.
app.use(logger);

//{} 컨트롤러에서 "req.body"를 사용할수 있도록 해줌.
// Express 앱이 HTML form을 이해하고 그 form을
// 우리가 사용할 수 있는 javascript object 형식으로 통역해주기 때문.
// https://velog.io/@hyunju-song/body-parser%EC%9D%98-urlencoded%EB%8A%94-%EB%8F%84%EB%8C%80%EC%B2%B4-%EC%96%B4%EB%96%A4-%EC%97%AD%ED%95%A0%EC%9D%84-%ED%95%98%EB%8A%94-%EA%B1%B8%EA%B9%8C
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.DB_URL,
		}),
	})
);

app.use(flash());
app.use(localsMiddleware);

// Static Folders
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/images", express.static("images"));

// app.use((req, res, next) => {
//     res.header("Cross-Origin-Embedder-Policy", "require-corp");
//     res.header("Cross-Origin-Opener-Policy", "same-origin");
//     next();
// });

// Register Commands
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
