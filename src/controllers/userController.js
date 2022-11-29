import User from "../models/User.js";
import Video from "../models/Video.js";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

import { request, response } from "express";

export const getJoin = function (req, res) {
	return res.render("join", { pageTitle: "Join" });
};

export const postJoin = async function (req, res) {
	const { name, username, email, password, password2, location } = req.body;

	const pageTitle = "Join";

	if (password !== password2) {
		return res.status(400).render("join", {
			pageTitle: pageTitle,
			errorMessage: "Password confirmation does not match.",
		});
	}

	const exists = await User.exists({
		$or: [{ username: username }, { email: email }],
	});

	if (exists) {
		return res.status(400).render("join", {
			pageTitle: pageTitle,
			errorMessage: "This username/email is already taken.",
		});
	}

	try {
		await User.create({
			name: name,
			username: username,
			email: email,
			password: password,
			location: location,
		});

		return res.redirect("/login");
	} catch (error) {
		console.log(error);
		return res.status(400).render("join", {
			pageTitle: "Upload Video",
			errorMessage: error._message,
		});
	}
};

export const getEdit = function (req, res) {
	return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async function (req, res) {
	const {
		session: {
			user: { _id, avatarUrl },
		},
		body: { name, email, username, location },
		file,
	} = req;

	console.log(file);

	const isHeroku = process.env.NODE_ENV === "production";

	// // const { name, email, username, location } = req.body;
	const updatedUser = await User.findByIdAndUpdate(
		_id,
		{
			// Original user data from "req.session.user".
			...req.session.user,

			// Things to update in addition to
			// the original user data.
			avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
			name: name,
			email: email,
			username: username,
			location: location,
		},
		{ new: true }
	);

	req.session.user = updatedUser;

	//{} Code Challenge :
	//{} 이미 있는 username이나 email으로 유저 정보 변경을
	//{} 할수 없도록 해야 함.
	// username이나 email이 변경돼야 하는지 알기 위해
	// body의 username, email이 session.user에 있는
	// username, email과 다른지 확인해볼수도 있음.

	return res.redirect("/users/edit");
};

export const getLogin = function (req, res) {
	return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async function (req, res) {
	const { username, password } = req.body;

	const pageTitle = "Login";

	// ? :  Is it correct?
	// When the user's account has "socialOnly: false",
	// they can use only "login form", rather than "Github login".
	const user = await User.findOne({ username: username, socialOnly: false });

	if (!user) {
		return res.status(400).render("login", {
			pageTitle: pageTitle,
			errorMessage: "An account with this username does not exist.",
		});
	}

	//[] TODO :
	//[] If the account data in DB has "socialOnly = true",
	//[] it must not let the user "log in".

	const ok = await bcrypt.compare(password, user.password);

	if (!ok) {
		return res.status(400).render("login", {
			pageTitle: pageTitle,
			errorMessage: "Wrong password.",
		});
	}

	req.session.loggedIn = true;
	req.session.user = user;
	return res.redirect("/");
};

export const logout = function (req, res) {
	req.session.destroy();
	req.flash("info", "You're logged out.");
	return res.redirect("/");
};

export const see = async function (req, res) {
	const { id } = req.params;
	const user = await User.findById(id).populate("videos");

	if (!user) {
		return res.status(404).render("404", { pageTitle: "User not found." });
	}

	return res.render("users/profile", {
		pageTitle: user.name,
		user: user,
	});
};

export const startGithubLogin = function (req, res) {
	const baseUrl = "https://github.com/login/oauth/authorize";

	const config = {
		// client_id is not really a secret
		// but it's included in the ".env" file
		// for convinence purposes.
		client_id: process.env.GH_CLIENT,
		allow_signup: true,
		scope: "read:user user:email",
	};

	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;

	return res.redirect(finalUrl);
};

export const finishGithubLogin = async function (req, res) {
	const baseUrl = "https://github.com/login/oauth/access_token";

	const config = {
		client_id: process.env.GH_CLIENT,
		client_secret: process.env.GH_SECRET,

		// Include the code from "startGithubLogin" controller.
		code: req.query.code,
	};

	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;

	// JS : "fetch()" only works on browsers.
	//-> Which means it's not included in "Node.js".
	const tokenRequest = await (
		await fetch(finalUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		})
	).json();

	if ("access_token" in tokenRequest) {
		const { access_token } = tokenRequest;
		const apiUrl = "https://api.github.com";

		//{} await(await fetch()).json()
		// A combined form of
		// "await fetch([params])" and await json()"

		// # Request Data
		const userData = await (
			await fetch(`${apiUrl}/user`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();
		const emailData = await (
			await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();

		//{} get an email which is primary and verified.
		// ? : What is the difference between "filter()" and "find()"?
		const emailObj = emailData.find(
			(email) => email.primary === true && email.verified === true
		);

		// Redirect the user to the login page
		// when the "emailObj" is not found.
		if (!emailObj) {
			//[] TODO :
			//[] There should be a notification to tell the user
			//[] that they failed to log in, because there is
			//[] no "primary and verified" email in the "emailObj".

			return res.redirect("/login");
		}

		// Check if there is already an account with the email.
		let user = await User.findOne({ email: emailObj.email });

		console.log(userData);
		console.log("오", user);
		//{} When there is no email-matching account in the DB,
		//{} create an account with the email.
		if (user === null) {
			const newUser = await User.create({
				name: userData.name,
				avatarUrl: userData.avatar_url,
				username: userData.login,
				email: emailObj.email,
				password: "",

				// It tells that the account doesn't have a password.
				// -> (Log in form is not going to work for them.)
				socialOnly: true,
				location: userData.location,
			});

			console.log("뉴", newUser);

			req.session.loggedIn = true;
			req.session.user = newUser;
		} else {
			req.session.loggedIn = true;
			req.session.user = user;
		}

		return res.redirect("/");
	} else {
		// TODO : Show the error notification.
		// (without rendering a pug template.)
		return res.redirect("/login");
	}
};

export const getChangePassword = function (req, res) {
	if (req.session.user.socialOnly === true) {
		req.flash("info", "Can't change password.");
		return res.redirect("/");
	}

	return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async function async(req, res) {
	const {
		session: {
			user: { _id },
		},
		body: { oldPassword, newPassword, newPasswordConfirmation },
	} = req;

	const user = await User.findById(_id);
	const ok = await bcrypt.compare(oldPassword, user.password);

	if (!ok) {
		return res.status(400).render("users/change-password", {
			pageTitle: "Change Password",
			errorMessage: "The current password is incorret.",
		});
	}

	if (newPassword !== newPasswordConfirmation) {
		return res.status(400).render("users/change-password", {
			pageTitle: "Change Password",
			errorMessage: "The password does not match the confirmation.",
		});
	}

	user.password = newPassword;

	await user.save();

	req.flash("info", "Password updated.");

	//[] TODO :
	//[] 비밀번호 변경하기.

	//[] Send Notification
	return res.redirect("/users/logout");
};
