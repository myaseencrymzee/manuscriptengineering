
// Constants
const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// Video Upload Handling
document.getElementById("video-file-input").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const uploadBox = document.getElementById("video-upload-box");
    const fileNameSpan = document.getElementById("video-file-name");
    const errorMsg = document.querySelector("#videoUploadForm .input-error-msg");
    
    // Reset previous messages
    errorMsg.textContent = '';
    errorMsg.classList.remove('active');
    
    if (file) {
        // Check file size
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
            errorMsg.textContent = `File size exceeds ${MAX_VIDEO_SIZE_MB}MB limit`;
            errorMsg.classList.add('active');
            event.target.value = ''; // Clear the file input
            fileNameSpan.textContent = '';
            return;
        }
        
        // Update UI
        fileNameSpan.textContent = file.name;
        uploadBox.querySelector('svg').classList.add('hide');
        uploadBox.querySelector('span').classList.add('hide');
        
        // Create video preview
        createVideoPreview(file);
    } else {
        fileNameSpan.textContent = '';
        uploadBox.querySelector('svg').classList.remove('hide');
        uploadBox.querySelector('span').classList.remove('hide');
        clearVideoPreview();
    }
});

function createVideoPreview(file) {
    const videoPreview = document.getElementById("video-preview");
    videoPreview.innerHTML = '';
    
    if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '200px';
        
        const source = document.createElement('source');
        source.src = URL.createObjectURL(file);
        source.type = file.type;
        
        video.appendChild(source);
        videoPreview.appendChild(video);
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-video';
        removeBtn.innerHTML = `
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.73268 9.08268L0.916016 8.26602L4.18268 4.99935L0.916016 1.73268L1.73268 0.916016L4.99935 4.18268L8.26602 0.916016L9.08268 1.73268L5.81602 4.99935L9.08268 8.26602L8.26602 9.08268L4.99935 5.81602L1.73268 9.08268Z" fill="#333333"/>
            </svg>
        `;
        removeBtn.onclick = (e) => {
            e.preventDefault();
            clearVideoPreview();
            document.getElementById("video-file-input").value = '';
            const uploadBox = document.getElementById("video-upload-box");
            uploadBox.querySelector('svg').classList.remove('hide');
            uploadBox.querySelector('span').classList.remove('hide');
            document.getElementById("video-file-name").textContent = '';
        };
        videoPreview.appendChild(removeBtn);
    }
}

function clearVideoPreview() {
    const videoPreview = document.getElementById("video-preview");
    videoPreview.innerHTML = '';
}

// Video Form Submission
document.getElementById("videoUploadForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const button = form.querySelector("button[type='submit']");
    const buttonText = button.querySelector(".btn-text");
    const spinner = button.querySelector(".spinner-border");
    const errorMsg = form.querySelector('.input-error-msg');
    
    // Reset error message
    errorMsg.textContent = '';
    errorMsg.classList.remove('active');
    
    // Validate form
    const title = formData.get('title');
    const videoFile = formData.get('video_file');
    
    if (!title || title.trim().length === 0) {
        errorMsg.textContent = 'Please enter a video title';
        errorMsg.classList.add('active');
        return;
    }
    
    if (!videoFile || videoFile.size === 0) {
        errorMsg.textContent = 'Please select a video file';
        errorMsg.classList.add('active');
        return;
    }
    
    if (videoFile.size > MAX_VIDEO_SIZE_BYTES) {
        errorMsg.textContent = `File size exceeds ${MAX_VIDEO_SIZE_MB}MB limit`;
        errorMsg.classList.add('active');
        return;
    }
    
    try {
        // Show loading state
        button.disabled = true;
        buttonText.textContent = 'Uploading...';
        spinner.classList.remove('hide');
        
        // Add CSRF token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        // Send request to backend
        const response = await fetch('/api/homepage/videos', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success - close modal and refresh list
            buttonText.textContent = 'Success!';
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addHomePageContentModal'));
                modal.hide();
                getHomePageVideos();
            }, 1000);
        } else {
            // Show error message
            errorMsg.textContent = data.error || 'Failed to upload video';
            errorMsg.classList.add('active');
            buttonText.textContent = 'Save';
        }
    } catch (error) {
        console.error('Error uploading video:', error);
        errorMsg.textContent = 'An error occurred while uploading';
        errorMsg.classList.add('active');
    } finally {
        button.disabled = false;
        buttonText.textContent = 'Save';
        spinner.classList.add('hide');
    }
});

let homepage_videos_endpoint = '/api/homepage/videos?perPage=2000'
// Get and Render Videos
async function getHomePageVideos() {
    try {
        const response = await fetch(homepage_videos_endpoint);
        const videos = await response.json();
        renderVideos(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

function renderVideos(videos) {
    const container = document.getElementById("videos-container");
    container.innerHTML = '';
    
    if (videos.length === 0) {
        container.innerHTML = '<div class="text-center py-4">No videos available</div>';
        return;
    }
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <div class="video-card-header">
                <h5>${video.title}</h5>
                <span class="badge ${video.is_active ? 'bg-success' : 'bg-secondary'}">
                    ${video.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="video-card-body">
                <video controls>
                    <source src="${video.video_file}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-actions">
                    <button class="btn btn-sm btn-primary set-active" data-id="${video.id}">
                        Set Active
                    </button>
                    <button class="btn btn-sm btn-danger delete-video" data-id="${video.id}">
                        Delete
                    </button>
                </div>
            </div>
            <div class="video-card-footer">
                <small>Uploaded: ${new Date(video.created_at).toLocaleDateString()}</small>
            </div>
        `;
        container.appendChild(videoCard);
    });
    
    // Add event listeners for actions
    document.querySelectorAll('.set-active').forEach(btn => {
        btn.addEventListener('click', setVideoAsActive);
    });
    
    document.querySelectorAll('.delete-video').forEach(btn => {
        btn.addEventListener('click', deleteVideoModal);
    });
}

// Set Video as Active
async function setVideoAsActive(event) {
    const videoId = event.target.dataset.id;
    
    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const response = await fetch(`/api/homepage/videos/${videoId}/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });
        
        if (response.ok) {
            getHomePageVideos(); // Refresh the list
        } else {
            alert('Failed to set video as active');
        }
    } catch (error) {
        console.error('Error setting video as active:', error);
    }
}

function deleteVideoModal(event){
    let id = event.target.dataset.id
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    form.querySelector("#message").innerText = 'Are you sure you want to delete this video?'
    let formEvent = (event) => deleteVideo(event, id);
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

// Delete Video
async function deleteVideo(event, id) {
    console.log(event)
    event.preventDefault();
    let form = event.currentTarget;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.closest(".modal").querySelector(`button[form='${form.id}']`);
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');
    const videoId = id;
    
    try {
        errorMsg.innerText = ''; 
        errorMsg.classList.remove('active');
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        const response = await fetch(`/api/homepage/videos/${videoId}`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    getHomePageVideos();
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
    } catch (error) {
        console.error('Error deleting video:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    getHomePageVideos();
    
    // Add event listener for the "Add Video" button
    document.querySelector('.add-new-button').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('addHomePageContentModal'));
        clearVideoPreview()
        document.getElementById('addHomePageContentModal').querySelector("form").reset();
        document.getElementById('addHomePageContentModal').querySelector("#video-file-name").innerText="";
        document.getElementById('addHomePageContentModal').querySelector("#action-btn").classList.remove("hide");
        document.getElementById('addHomePageContentModal').querySelector("#video-upload-box").querySelector("svg").classList.remove("hide");
        modal.show();
    });
});

let vidosSearchForm = document.getElementById("searchForm");
vidosSearchForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    console.log(data)
    homepage_videos_endpoint = setParams(homepage_videos_endpoint, 'search', data.search);
    getHomePageVideos();
})
