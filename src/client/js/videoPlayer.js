const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playImg = document.getElementById("playImg");
const muteBtn = document.getElementById("mute");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenImg = document.getElementById("fullScreenImg");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

//[] TODO :
//[] 1. 화면 가운데 클릭 시 멈춤/재생 기능
//[] 2. 1번을 스페이스바로도 가능하게 하기

let controlsTimeout = null;
let controlsMovementTimeout = null;

const formatTime = function (input) {
	// The time (in seconds) that should be re-formatted.
	const seconds = input;

	// Get an ISOString.
	//{} When we put the time in miliseconds(ms) as an argument,
	//{} JavaScript should tell us how much time has passed
	//{} since "January 1, 1970, UTC".
	// To have the value of "seconds" re-formatted
	// into the form of 00:00:00, it should be multiplied by 1000.
	const dateString = new Date(seconds * 1000).toISOString();

	// Get only the part we want.
	const formattedString = dateString.substring(11, dateString.length - 5);

	return formattedString;
};

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = function (event) {
	// If the video is playing, pause it.
	if (video.paused) {
		playImg.src = "/images/stop.svg";
		video.play();
	} else {
		video.pause();
	}

	// Update the text in the play/pause button.
	playImg.src = video.paused ? "/images/play.svg" : "/images/stop.svg";
};

// Toggle mute and controls the text in the button.
const handleMuteClick = function (event) {
	// Mute or unmute the video player.
	if (video.muted) {
		video.muted = false;
	} else {
		video.muted = true;
	}

	// Update the text in the mute toggle button.
	muteBtn.innerText = video.muted ? "UNMUTE" : "MUTE";

	volumeRange.value = video.muted ? 0 : volumeValue;
};

// Read the volume-bar input and update the video volume.
const handleVolumeChange = function (event) {
	const {
		target: { value },
	} = event;

	volumeValue = value;
	video.volume = volumeValue;

	if (video.muted) {
		video.muted = false;
		muteBtn.innerText = "MUTE";
	}
};

const handleLoadedMetadata = function () {
	totalTime.innerText = formatTime(Math.floor(video.duration));
	timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = function () {
	currentTime.innerText = formatTime(Math.floor(video.currentTime));
	timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = function (event) {
	const {
		target: { value },
	} = event;
	video.currentTime = value;
};

const handleFullScreen = function () {
	const fullScreen = document.fullscreenElement;

	if (fullScreen) {
		document.exitFullscreen();
		fullScreenImg.src = "/images/fullscreen.svg";
	} else {
		videoContainer.requestFullscreen();
		fullScreenImg.src = "/images/normalscreen.svg";
	}
};

const hideControls = function () {
	videoControls.classList.remove("showing");
};

const handleMouseMove = function (event) {
	if (controlsTimeout) {
		clearTimeout(controlsTimeout);
		controlsTimeout = null;
	}

	if (controlsMovementTimeout) {
		clearTimeout(controlsMovementTimeout);
		controlsMovementTimeout = null;
	}
	videoControls.classList.add("showing");
	controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = function () {
	controlsTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = function () {
	const { id } = videoContainer.dataset;
	fetch(`/api/videos/${id}/view`, {
		method: "POST",
	});
};

// Add events and event handlers.
playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
// document.addEventListener("keydown", (event) => {
// 	console.log(event.code);
// 	if (event.code === "Space") {
// 		handlePlayAndStop();
// 	} else if (event.code === "KeyF" || event.code === "Escape") {
// 		handleFullScreen();
// 	}
// });

video.readyState
	? handleLoadedMetadata()
	: video.addEventListener("loadedmetadata", handleLoadedMetadata);
