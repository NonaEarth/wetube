import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
	credentials: {
		accessKeyId: process.env.AWS_ID,
		secretAccessKey: process.env.AWS_SECRET,
	},
});

const s3ImageUploader = multerS3({
	s3: s3,
	bucket: "wetubefiles/images",
    acl: 'public-read',
});

const s3VideoUploader = multerS3({
	s3: s3,
	bucket: "wetubefiles/videos",
    acl: 'public-read',
});

const s3ThumbUploader = multerS3({
	s3: s3,
	bucket: "wetubefiles/thumbnails",
    acl: 'public-read',
});

const isHeroku = process.env.NODE_ENV === "production";

export const localsMiddleware = function (req, res, next) {
	// Session data in the backend, "req.session.loggedIn"
	// is going to be saved in "res.locals.loggedIn" to
	// use the value when rendering the webpage.

	// ? : Why was the "Boolean()" function used?
	res.locals.loggedIn = Boolean(req.session.loggedIn);
	res.locals.loggedInUser = req.session.user || {};

    res.locals.isHeroku = isHeroku;
	next();
};

export const protectorMiddleware = function (req, res, next) {
	if (req.session.loggedIn) {
		return next();
	} else {
		req.flash("error", "Not authorized");
		return res.redirect("/login");
	}
};

export const publicOnlyMiddleware = function (req, res, next) {
	if (!req.session.loggedIn) {
		return next();
	} else {
		req.flash("error", "Not authorized");
		return res.redirect("/");
	}
};

export const avatarUpload = multer({
	dest: "uploads/avatars/",
	limits: {
		fileSize: 3000000,
	},
	storage: isHeroku ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
	dest: "uploads/videos/",
	limits: {
		fileSize: 10000000,
	},
	storage: isHeroku ? s3VideoUploader : undefined,
});

export const thumbUpload = multer({
	dest: "uploads/thumbs/",
	limits: {
		fileSize: 10000000,
	},
	storage: isHeroku ? s3ThumbUploader : undefined,
});

// export const avatarUpload = multer({
//     dest: "uploads/avatars/",
//     limits: {
//         fileSize: 3000000,
//     },
// });

// export const videoUpload = multer({
//     dest: "uploads/videos/",
//     limits: {
//     fileSize: 10000000,
//     },
// });
