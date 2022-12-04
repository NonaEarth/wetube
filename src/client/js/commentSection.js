const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = function (text, id) {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const span = document.createElement("span");
    span.innerText = `${text}`;

    newComment.appendChild(span);
    videoComments.prepend(newComment);
}

const handleSubmit = async function (event) {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;

    if (text === "") {
        return;
    }

    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text }),
    });

    const userInfoResponse = await fetch(`/api/sessionInfo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text }),
    });

    if (response.status === 201 && userInfoResponse.status === 201) {
        const { userId } = await userInfoResponse.json();
        const { newCommentId } = await response.json();

        textarea.value = "";
        addComment(text, newCommentId, userId);
    }
}

if (form) {
    form.addEventListener("submit", handleSubmit);
}

const delComment = async (event) => {
    console.log("ㅎㅇ");

    const commentUserId = dataBox.dataset.userId;
    const commentId = dataBox.dataset.commentId;

    console.log(dataBox, commentId, commentUserId);
    
    const delfetch = await fetch(`/api/delcomment/${commentId}/${commentUserId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text }),
    });

    if (delfetch.status === 201) {
    }
}
const delBtns = document.querySelectorAll("#delBtn");

for (let index = 0; index < delBtns.length; index++) {
    delBtns[index].addEventListener('click', delComment);
}