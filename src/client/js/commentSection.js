const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = function (text, id) {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    // newComment.appendChild();
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

    
    if (response.status === 201) {
        const { newCommentId } = await response.json();
        textarea.value = "";
        addComment(text, newCommentId);
    }
}

if (form) {
    form.addEventListener("submit", handleSubmit);
}

//[] TODO :
//[] 댓글 삭제 기능
//[] 댓글 작성자가 아니라면 삭제 버튼 안보이게 하기