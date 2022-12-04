import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

// Home
export const home = async function (req, res) {
	//{} The handleSearch() is a callback function.
	// The server waits until the database search is completely done,
	// This prevent the server from rendering the website before the DB search process.
	// // Video.find({}, (error, videos) => {
	// //     res.render("home", { pageTitle: "Suggestions", videos: videos });
	// // });

	//# Async - Await (There should be "async" keyword before function.)
	try {
		const videos = await Video.find({}).sort({ createdAt: "desc" });
		return res.render("home", { pageTitle: "Suggestions", videos: videos });
	} catch (error) {
		return res.render("Server-Error", { error });
	}
};

export const watch = async function (req, res) {
	const { id } = req.params;

	// Population is the process of replacing the specified path
	// in the document of one collection with the actual document
	// from the other collection.
	const video = await Video.findById(id).sort({ createdAt: "desc" }).populate("owner").populate("comments");

	if (!video) {
		return res.render("404", { pageTitle: "Video Not Found" });
	}

	return res.render("watch", { pageTitle: video.title, video: video });
};

export const getEdit = async function (req, res) {
	const { id } = req.params;
	const {
		user: { _id },
	} = req.session;

	const video = await Video.findById(id);

	if (!video) {
		return res.render.status(404)("404", { pageTitle: "Video Not Found" });
	}

	if (String(video.owner) !== String(_id)) {
		req.flash("error", "You're not the owner of the video.");
		return res.status(403).redirect("/");
	}

	return res.render("edit", { pageTitle: `Edit:${video.title}`, video: video });
};

export const postEdit = async function (req, res) {
	const {
		user: { _id },
	} = req.session;
	const { id } = req.params;
	const { title, description, hashtags } = req.body;
	const video = await Video.exists({ _id: id });

	if (!video) {
		return res.render("404", { pageTitle: "Video Not Found" });
	}

	if (String(video.owner) !== String(_id)) {
		req.flash("error", "You're not the owner of the video.");
		return res.status(403).redirect("/");
	}

	await Video.findByIdAndUpdate(id, {
		title: title,
		description: description,
		hashtags: Video.formatHashtags(hashtags),
	});

	return res.redirect(`/videos/${id}`);
};

export const getUpload = function (req, res) {
	return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async function (req, res) {
	const { video, thumb } = req.files;
	const {
		user: { _id },
	} = req.session;
	// const { path: fileUrl } = req.file;

	const { title, description, hashtags } = req.body;

	const isHeroku = process.env.NODE_ENV === "production";

	try {
		const newVideo = await Video.create({
			title: title,
			description: description,
			fileUrl: isHeroku
				? video[0].location.replace(/[\\]/g, "/")
				: video[0].path.replace(/[\\]/g, "/"),
			thumbUrl: isHeroku
				? thumb[0].location.replace(/[\\]/g, "/")
				: thumb[0].path.replace(/[\\]/g, "/"),
			owner: _id,
			hashtags: Video.formatHashtags(hashtags),
		});

		const user = await User.findById(_id);
		user.videos.push(newVideo._id);
		user.save();
	} catch (error) {
		console.log(error);
		return res.status(400).render("upload", {
			pageTitle: "Upload Video",
			errorMessage: error._message,
		});
	}

	return res.redirect("/");
};

export const deleteVideo = async function (req, res) {
	const {
		user: { _id },
	} = req.session;
	const { id } = req.params;
	const video = await Video.findById(id);

	if (!video) {
		return res.render("404", { pageTitle: "Video Not Found" });
	}

	if (String(video.owner) !== String(_id)) {
		return res.status(403).redirect("/");
	}

	//! It's highly recommend to use "delete" instead of "remove".
	await Video.findByIdAndDelete(id);

	// Delete video.
	return res.redirect("/");
};

export const search = async function (req, res) {
	const { keyword } = req.query;
	let videos = [];

	if (keyword) {
		videos = await Video.find({
			title: {
				$regex: new RegExp(keyword, "i"),
			},
		});
	}

	return res.render("search", { pageTitle: "Search", videos: videos });
};

export const registerView = async function (req, res) {
	const { id } = req.params;

	const video = await Video.findById(id);

	if (!video) {
		return res.status(404);
	}

	video.meta.views = video.meta.views + 1;
	await video.save();

	return res.sendStatus(200);
};

export const createComment = async function (req, res) {
	const {
		session: { user },
		body: { text },
		params: { id },
	} = req;

	const video = await Video.findById(id);

	if (!video) {
		return res.sendStatus(404);
	}

	const comment = await Comment.create({
		text: text,
		owner: user._id,
		video: id,
	});

	video.comments.push(comment._id);
	video.save();

	return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async function (req, res) {
	const {
		session: {
			user: { _id },
		},
	} = req;
	const { commentId, commentUserId } = req.params;

	if (_id === commentUserId) {
		await Comment.findByIdAndDelete(commentId);
	}

	return res.status(201).json({});
};