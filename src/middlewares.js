import multer from "multer";

export const localsMiddleware = function (req, res, next) {

    // Session data in the backend, "req.session.loggedIn"
    // is going to be saved in "res.locals.loggedIn" to
    // use the value when rendering the webpage.

    // ? : Why was the "Boolean()" function used?
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user || {};

    next();
}

export const protectorMiddleware = function (req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = function (req, res, next) {
    if (!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}

export const avatarUpload = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000,
    },
});

export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {
    fileSize: 10000000,
    },
});