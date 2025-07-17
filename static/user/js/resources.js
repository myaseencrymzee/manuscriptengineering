const userId = JSON.parse(document.getElementById("user_id").textContent);

const id = JSON.parse(document.getElementById('id').textContent);
let resourcesContainer = document.getElementById('resources-section');


window.addEventListener('load', getResourcesData(id));


async function getResourcesData(id) {
    try {
        let response = await requestAPI(`${CONTENT_API_URL}api/blog/${id}`, null, {}, 'GET');
        let res = await response.json();
        if(response.status == 200) {
            renderResourcesData(res)
            console.log(res);  
        } 
    }
    catch(err) {
        console.log(err);   
    }
}

function renderResourcesData(res) {
    document.getElementById("title").innerText = res.title; 
    document.getElementById("author-blog-content").innerHTML = res.content;
    document.getElementById("resource-img").src = res.images[0].image;
    document.querySelector(".auther-img").querySelector("img").src = res.author.profile_picture;
    document.querySelector(".author-name").querySelector("h6").innerText = res.author.full_name;
    document.querySelector("#read_time").innerText = `${res.read_time} min. to read`;
    document.querySelector("#date").innerText = `${formatDate(res.date)}`;
}

function formatDate(dateStr) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
  
    return `${day} ${month} , ${year}`;
}


  let commentsData = []
window.addEventListener('load', getBlogComments(id));
async function getBlogComments(id) {
    try {
        let response = await requestAPI(`${CONTENT_API_URL}api/blogs/${id}/comments`, null, {}, 'GET');
        let res = await response.json();
        if(response.status == 200) {
            commentsData = res.data
            renderComments()
            console.log(res);  
        } 
    }
    catch(err) {
        console.log(err);   
    }
}


function addComments(event) {
    event.preventDefault();
    let form = event.target;
    const commentInput = document.getElementById("comment-input");
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    fetch(`${CONTENT_API_URL}api/blogs/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
                    'X-CSRFToken': form.querySelector("input[name='csrfmiddlewaretoken']").value
         },
        body: JSON.stringify({ comment: commentText }),
    })
        .then(response => response.json())
        .then(comment => {
            commentInput.value = ""; 
            getBlogComments(id);
        })
        .catch(error => console.error("Error adding comment:", error));
}
function renderComments() {
            const commentsList = document.getElementById("comments-list");
            commentsList.innerHTML = "";
            commentsData.forEach(comment => {
                const commentDiv = document.createElement('div')
                commentDiv.classList.add('users-comments')
                commentDiv.innerHTML = `
                        <div class="author-information">
                        <div class="author-details">
                            <div class="auther-img">
                                <img src="${comment.user.profile_picture}" alt="">
                            </div>
                            <div class="author-name">
                                <h6>${comment.user.full_name}</h6>
                                <div class="auther-blog-datetime">
                                    <div class="max-read-time">
                                        <span>${timeAgo(comment.created_at)}</span>                           
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="auther-social-media-info ${userId != comment.user.id ? 'hide' : ''}">
                            <div class="auther-social-media dropstart">
                                <a href="javascipt:void(0)" data-bs-toggle="dropdown" aria-expanded="false">
                                    <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4ZM8 4C7.45 4 6.97917 3.80417 6.5875 3.4125C6.19583 3.02083 6 2.55 6 2C6 1.45 6.19583 0.979167 6.5875 0.5875C6.97917 0.195833 7.45 0 8 0C8.55 0 9.02083 0.195833 9.4125 0.5875C9.80417 0.979167 10 1.45 10 2C10 2.55 9.80417 3.02083 9.4125 3.4125C9.02083 3.80417 8.55 4 8 4ZM14 4C13.45 4 12.9792 3.80417 12.5875 3.4125C12.1958 3.02083 12 2.55 12 2C12 1.45 12.1958 0.979167 12.5875 0.5875C12.9792 0.195833 13.45 0 14 0C14.55 0 15.0208 0.195833 15.4125 0.5875C15.8042 0.979167 16 1.45 16 2C16 2.55 15.8042 3.02083 15.4125 3.4125C15.0208 3.80417 14.55 4 14 4Z" fill="#00274D"/>
                                    </svg>                                                       
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" onclick="openDeleteCommentModal(${comment.id})" href="javascript:void(0);">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="comment">
                        <span>${comment.comment}</span>
                    </div>
                `
                commentsList.appendChild(commentDiv);
            })

        // .catch(error => console.error("Error fetching comments:", error));  

}


function openDeleteCommentModal(commentId) {
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    formEvent = (event) => deleteCommentForm(event, commentId);
    form.addEventListener("submit", formEvent);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });
    });
    document.querySelector(`.${modalId}`).click();
}


async function deleteCommentForm(event, commentId) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.closest(".modal").querySelector(`button[form='${form.id}']`);
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');

    try {
        errorMsg.innerText = ''; 
        errorMsg.classList.remove('active');
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI(`${CONTENT_API_URL}api/blogs/${id}/comments/${commentId}`, null, headers, 'DELETE');
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    getBlogComments(id);
                    closeCurrentModal()
                }, 1500)
        } else {
            let res = await response.json();
            afterLoad(button, buttonText);
            errorMsg.classList.add("active");
            displayMessages(res, errorMsg);
            console.error("Error deleting course:", res);
            return;
        }
    } catch (err) {
        console.error("Request failed:", err);
    }
}



function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
  
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(days / 365);
    return `${years} years ago`;
}
