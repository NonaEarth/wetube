const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const delBtns = document.getElementsByClassName("delBtn");

const addComment = function (text, id, userId) {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    // newComment.dataset.id = id;
    newComment.owner._id = userId;
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

const delComment = async (event) => {
    console.log('gd');
    const commentUserId = event.target.dataset.userId;
    const commentId = event.target.dataset.commentId;
    
    const delfetch = await fetch(`/api/delcomment/${commentId}/${commentUserId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text }),
    });

    if (delfetch.status === 201) {
        console.log("성공!");
    }
}

if (form) {
    form.addEventListener("submit", handleSubmit);
}

for (let index = 0; index < delBtns.length; index++) {
    delBtns[index].addEventListener("onClick", delComment);
}

//[] TODO :
//[] 댓글 삭제 기능
//[] 댓글 작성자가 아니라면 삭제 버튼 안보이게 하기