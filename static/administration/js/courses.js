

// Handle Image Upload
document.getElementById("image-input").addEventListener("change", function(event) {
    const file = event.target.files[0];
    let uploadBox = event.target.closest('.upload-box');
    uploadBox.querySelector('svg').classList.add('hide');
    uploadBox.querySelector('span').classList.add('hide');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById("image-preview");
            preview.classList.remove("hide");
            preview.innerHTML = returnImagePreviewHTML(e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

function returnImagePreviewHTML(src){
    return `
            <img id="preview-img" src="${src}" alt="Uploaded Image">
            <button class="remove-image" onclick="removeImage(event)">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.73268 9.08268L0.916016 8.26602L4.18268 4.99935L0.916016 1.73268L1.73268 0.916016L4.99935 4.18268L8.26602 0.916016L9.08268 1.73268L5.81602 4.99935L9.08268 8.26602L8.26602 9.08268L4.99935 5.81602L1.73268 9.08268Z" fill="#333333"/>
                </svg>
            </button>`;
}

// Remove Selected Image
function removeImage(event) {
    let uploadBox = event.target.closest(".remove-image").closest(".upload-box");
    event.preventDefault();
    document.getElementById("image-preview").innerHTML = "";
    document.getElementById("image-preview").classList.add("hide");
    document.getElementById("image-input").value = "";
    uploadBox.querySelector('svg').classList.remove('hide');
    uploadBox.querySelector('span').classList.remove('hide');
}

// Handle File Upload (PDF only)
document.getElementById("file-input").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const fileNameElement = document.getElementById("course-file-name");
    
    if (file) {
        // Validate file type
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            // Show error message
            const errorMsg = document.querySelector('.input-error-msg');
            if (errorMsg) {
                errorMsg.textContent = 'Please upload a PDF file only';
                errorMsg.classList.add('active');
            }
            
            // Reset the input
            event.target.value = '';
            fileNameElement.textContent = 'No file chosen';
            return;
        }
        
        // If valid PDF
        fileNameElement.textContent = file.name;
        fileNameElement.classList.remove("hide");
        
        // Clear any previous error messages
        const errorMsg = document.querySelector('.input-error-msg');
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.classList.remove('active');
        }
    } else {
        fileNameElement.textContent = 'No file chosen';
    }
});
// Handle Video Uploads
const MAX_VIDEOS = 3;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB in bytes
let uploadedVideos = [];

document.getElementById("course-video-file-input").addEventListener("change", function(event) {
    const files = event.target.files;
    const videosContainer = document.querySelector(".videos-container");
    const errorMsg = document.querySelector('.input-error-msg');
    const allowed_extensions = ['mp4', 'webm', 'ogg'];
    const allowed_mime_types = ['video/mp4', 'video/webm', 'video/ogg'];
    
    // Reset error message
    errorMsg.innerText = '';
    errorMsg.classList.remove('active');

    if (uploadedVideos.length + files.length > MAX_VIDEOS) {
        errorMsg.innerText = `You can only upload a maximum of ${MAX_VIDEOS} videos.`;
        errorMsg.classList.add('active');
        event.target.value = '';
        return;
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileType = file.type.toLowerCase();
        
        // Validate file extension
        if (!allowed_extensions.includes(fileExtension)) {
            errorMsg.innerText = `File "${file.name}" has invalid extension. Only ${allowed_extensions.join(', ')} files are allowed.`;
            errorMsg.classList.add('active');
            continue;
        }
        
        // Validate MIME type
        if (!allowed_mime_types.includes(fileType)) {
            errorMsg.innerText = `File "${file.name}" has invalid type. Only video files are allowed.`;
            errorMsg.classList.add('active');
            continue;
        }
        
        // Validate file size
        if (file.size > MAX_VIDEO_SIZE) {
            errorMsg.innerText = `File "${file.name}" exceeds the maximum size of 100MB.`;
            errorMsg.classList.add('active');
            continue;
        }
        
        // Create video object if all validations pass
        const videoObj = {
            file: file,
            id: Date.now() + i,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
            url: URL.createObjectURL(file),
            existing: false,
            extension: fileExtension,
            type: fileType
        };
        
        uploadedVideos.push(videoObj);
        renderVideoItem(videoObj);
    }
    
    // Show container if we have any videos
    if (uploadedVideos.length > 0) {
        videosContainer.classList.remove('hide');
    }
    
    // Reset input to allow selecting same file again if needed
    event.target.value = '';
});

function renderVideoItem(video) {
    const videosContainer = document.querySelector(".videos-container");
    
    const videoItem = document.createElement("div");
    videoItem.classList.add("video-item");
    videoItem.dataset.id = video.id;
    
    videoItem.innerHTML = `
        <div class="video-preview">
            <video width="" height="">
                <source src="${video.url}" type="${video.file.type}">
                Your browser does not support the video tag.
            </video>
        </div>
        <button class="remove-video" onclick="removeVideo(event, ${video.id})">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_7169_7015)">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1821 11.385C12.402 11.6044 12.402 11.9644 12.1821 12.1838C11.9627 12.4031 11.6061 12.4031 11.3861 12.1838L9.00336 9.79877L6.60374 12.2006C6.38212 12.42 6.02326 12.42 5.80164 12.2006C5.58058 11.9756 5.58058 11.6156 5.80164 11.3963L8.20126 8.99437L5.8185 6.61501C5.59856 6.39563 5.59856 6.03561 5.8185 5.81623C6.03731 5.59686 6.39394 5.59686 6.61387 5.81623L8.99664 8.20123L11.4142 5.78252C11.6359 5.56314 11.9942 5.56314 12.2158 5.78252C12.4369 6.00752 12.4369 6.36185 12.2158 6.58685L9.79874 9.00563L12.1821 11.385ZM9 0C4.02919 0 0 4.0275 0 9C0 13.9725 4.02919 18 9 18C13.9708 18 18 13.9725 18 9C18 4.0275 13.9708 0 9 0Z" fill="#EAF5FF"/>
                </g>
                <defs>
                <clipPath id="clip0_7169_7015">
                <rect width="18" height="18" fill="white"/>
                </clipPath>
                </defs>
            </svg>
        </button>
    `;
    
    videosContainer.appendChild(videoItem);
}

function removeVideo(event, id) {
    event.preventDefault();
    deleteCourseVideo(id);
    // Revoke the object URL to free memory
    const videoToRemove = uploadedVideos.find(video => video.id === id);
    if (videoToRemove) {
        URL.revokeObjectURL(videoToRemove.url);
    }
    uploadedVideos = uploadedVideos.filter(video => video.id !== id);
}
// APIs calling
let courses_endpoint = '/api/course?perPage=1000';
let courses_data;
let formEvent = null;
get_courses(courses_endpoint);

async function get_courses(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                render_courses_data(res);
            }
            else {
                console.log(res)
                return false;
            }
        })
    }
    catch (err) {
        console.log(err);
    }
}

function render_courses_data(data){
    courses_data = data.data;
    let container = document.getElementById("courses-services-container");
    if (courses_data.length > 0) {
        container.innerHTML = '';
        courses_data.forEach(obj => {
            let div = document.createElement("div");
            div.classList.add("coaching-services");
            let image = document.createElement("img");
            image.src = obj.image;
            image.alt = "course image";
            let coaching_div = document.createElement("div");
            coaching_div.classList.add("main-coaching-content");
            let title = document.createElement("h4");
            title.innerText = obj.title;
            let description = document.createElement("span");
            description.innerText = obj.description;
            let buttonContainer = document.createElement("div");
            buttonContainer.classList.add("book-now-coaching-btns");
            let editButton = document.createElement("button");
            editButton.innerText = "Edit";
            editButton.addEventListener("click", () => editCourse(obj));
            let deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.addEventListener("click", () => deleteCourse(obj));
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            coaching_div.appendChild(title);
            coaching_div.appendChild(description);
            coaching_div.appendChild(buttonContainer);
            div.appendChild(image);
            div.appendChild(coaching_div);
            container.appendChild(div);
        });
    }        
    else{
        let div = document.createElement("div")
        div.classList.add("w-100", "d-flex", "justify-content-center");
        let span = document.createElement("span")
        span.classList.add("text-center");
        span.textContent = "No data available."
        div.appendChild(span)
        container.innerHTML = '';
        container.appendChild(div);
    }
}

let coursesSearchForm = document.getElementById("searchForm");
coursesSearchForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    courses_endpoint = setParams(courses_endpoint, 'search', data.search);
    get_courses(courses_endpoint);
})

let originalObj = null;
function deleteCourse(obj) {
    originalObj = obj; 
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    form.querySelector("#message").innerText = 'Are you sure you want to delete this course?'
    form.removeEventListener("submit", deleteCourseForm);
    formEvent = (event) => deleteCourseForm(event);
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

async function deleteCourseForm(event) {
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
        let response = await requestAPI(`/api/course/${originalObj.id}`, null, headers, 'DELETE');
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_courses(courses_endpoint);
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

let add_course_button = document.querySelector(".add-new-button");
add_course_button.addEventListener("click", () => {
    let modalId = 'addCourcesModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");

    // Reset videos when opening modal
    uploadedVideos = [];
    document.querySelector(".videos-container").innerHTML = '';
    document.querySelector(".videos-container").classList.add('hide');

    formEvent = (event) => addCourcesForm(event);
    form.addEventListener("submit", formEvent);

    // Handle File Reset
    let fileName = modal.querySelector("#file-name");
    if (fileName) {
        fileName.innerText = "";
        fileName.classList.remove("hide");
    }
    let fileInput = modal.querySelector("input[name='file']");
    if (fileInput) {
        fileInput.value = "";
    }

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });

        let uploadBox = modal.querySelector(".remove-image")?.closest(".upload-box");
        document.getElementById("image-preview").innerHTML = "";
        document.getElementById("image-preview").classList.add("hide");
        document.getElementById("image-input").value = "";
        uploadBox?.querySelector('svg').classList.remove('hide');
        uploadBox?.querySelector('span').classList.remove('hide');

        // Handle File Reset
        let fileName = modal.querySelector("#course-file-name");
        if (fileName) {
            fileName.innerText = "";
            fileName.classList.add("hide");
        }
        let fileInput = modal.querySelector("input[name='file']");
        if (fileInput) {
            fileInput.value = "";
        }

        // Reset videos
        uploadedVideos = [];
        document.querySelector(".videos-container").innerHTML = '';
        document.querySelector(".videos-container").classList.add('hide');
    });
    document.querySelector(`.${modalId}`).click();
});

async function addCourcesForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = formDataToObject(formData);
    const button = form.querySelector("button[type='submit']");
    const buttonText = button.querySelector(".btn-text");
    const errorMsg = form.querySelector('.input-error-msg');
    
    // Reset error message
    errorMsg.innerText = '';
    errorMsg.classList.remove('active');

    // Validate form inputs
    if (!data.title || data.title.trim().length === 0) {
        errorMsg.innerText = 'Please enter a title.';
        errorMsg.classList.add('active');
        return false;
    }

    const image = formData.get("image");
    if (!image || image.size === 0) {
        errorMsg.innerText = 'Please upload an image.';
        errorMsg.classList.add('active');
        return false;
    }

    if (!data.description || data.description.trim().length === 0) {
        errorMsg.innerText = 'Please write a description.';
        errorMsg.classList.add('active');
        return false;
    }

    const file = formData.get("file");
    if (!file || file.size === 0) {
        errorMsg.innerText = 'Please upload course material file.';
        errorMsg.classList.add('active');
        return false;
    }

    // Validate video files if they exist
    if (uploadedVideos && uploadedVideos.length > 0) {
        for (const video of uploadedVideos) {
            if (!video.file || video.file.size === 0) {
                errorMsg.innerText = 'Please upload valid video files.';
                errorMsg.classList.add('active');
                return false;
            }
        }
    }

    try {
        beforeLoad(button);
        const headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        const response = await requestAPI('/api/course', formData, headers, 'POST');
        if (response.status !== 201) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create course');
        }
        const courseData = await response.json();
        if (uploadedVideos && uploadedVideos.length > 0) {
            
            for (let i = 0; i < uploadedVideos.length; i++) {
                const video = uploadedVideos[i];
                const videoFormData = new FormData();
                videoFormData.append("course", courseData.id);
                videoFormData.append("video_file", video.file);

                try {
                    buttonText.textContent = `Uploading videos (${i}/${uploadedVideos.length})`;
                    const videoResponse = await requestAPI('/api/course/video', videoFormData, headers, 'POST');
                    if (videoResponse.status !== 201) {
                        const videoError = await videoResponse.json();
                        throw new Error(`Failed to upload video ${i+1}: ${videoError.message || 'Unknown error'}`);
                    }
                } catch (err) {
                    button.disabled = false;
                    afterLoad(button, 'Save');
                    errorMsg.innerText = err || 'An error occurred while saving the course';
                    errorMsg.classList.add('active');
                    console.error(`Error uploading video ${i+1}:`, err);
                }
            }
        }
        
        setTimeout(() => {
            button.disabled = false;
            afterLoad(button, "Saved");
            get_courses(courses_endpoint);
            closeCurrentModal();
            uploadedVideos = [];
        }, 1500);

    } catch (err) {
        console.error('Error:', err);
        button.disabled = false;
        afterLoad(button, 'Save');
        errorMsg.innerText = err.message || 'An error occurred while saving the course';
        errorMsg.classList.add('active');
    }
}

function editCourse(obj) {
    originalObj = obj; 
    let modalId = 'addCourcesModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");

    // Reset videos when opening modal
    uploadedVideos = [];
    const videosContainer = document.querySelector(".videos-container");
    videosContainer.innerHTML = '';
    videosContainer.classList.remove('hide');

    // Render existing videos if they exist
    if (obj.videos && obj.videos.length > 0) {
        obj.videos.forEach(video => {
            const videoObj = {
                id: video.id,
                name: video.video_file.split('/').pop(),
                size: 'Existing video',
                url: video.video_file,
                existing: true, 
                file:{
                    type:"video/mp4"
                }
            };
            
            uploadedVideos.push(videoObj);
            console.log(uploadedVideos)
            renderVideoItem(videoObj);
        });
    }

    let formEvent = (event) => updateCourcesForm(event);
    form.addEventListener("submit", formEvent);

    modal.querySelector(".modal-title").innerText = "Update Course";
    modal.querySelector("button[type='submit']").querySelector(".btn-text").innerText = "Update";

    // Populate the data
    form.querySelector("input[name='title']").value = obj?.title;
    form.querySelector("textarea[name='description']").value = obj?.description;
    form.querySelector("#course-file-name").classList.remove("hide");
    let file_name = obj?.file.split("/").pop();
    form.querySelector("#course-file-name").textContent = file_name;

    form.querySelector("#image-preview").innerHTML = returnImagePreviewHTML(obj?.image);
    form.querySelector("#image-preview").classList.remove("hide");
    let uploadBox = modal.querySelector(".remove-image")?.closest(".upload-box");
    uploadBox?.querySelector('svg').classList.add('hide');
    uploadBox?.querySelector('span').classList.add('hide');

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });

        let uploadBox = modal.querySelector(".remove-image")?.closest(".upload-box");
        document.getElementById("image-preview").innerHTML = "";
        document.getElementById("image-preview").classList.add("hide");
        document.getElementById("image-input").value = "";
        uploadBox?.querySelector('svg').classList.remove('hide');
        uploadBox?.querySelector('span').classList.remove('hide');

        // Handle File Reset
        let fileName = modal.querySelector("#course-file-name");
        if (fileName) {
            fileName.innerText = "";
            fileName.classList.add("hide");
        }
        let fileInput = modal.querySelector("input[name='file']");
        if (fileInput) {
            fileInput.value = "";
        }

        // Reset videos
        uploadedVideos = [];
        document.querySelector(".videos-container").innerHTML = '';
        document.querySelector(".videos-container").classList.add('hide');
    });
    document.querySelector(`.${modalId}`).click();
}

async function updateCourcesForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = formDataToObject(formData);
    const button = form.querySelector("button[type='submit']");
    const buttonText = button.querySelector(".btn-text");
    const errorMsg = form.querySelector('.input-error-msg');
    
        errorMsg.innerText = '';
    errorMsg.classList.remove('active');

    if (!data.title || data.title.trim().length === 0) {
        errorMsg.innerText = 'Please enter a title.';
        errorMsg.classList.add('active');
        return false;
    }

    let image_input = form.querySelector("input[name='image']");
    let preview_image = form.querySelector("#preview-img");

    if (image_input.files.length == 0 && preview_image){
        formData.delete("image");
    }

    else if (image_input.files.length == 0 && preview_image == undefined ){
        errorMsg.innerText = 'Please upload an image.';
        errorMsg.classList.add('active');
        return false;
    }

    if (!data.description || data.description.trim().length === 0) {
        errorMsg.innerText = 'Please write a description.';
        errorMsg.classList.add('active');
        return false;
    }

    let file_input = form.querySelector("input[name='file']");
    let file_name_span = form.querySelector("#course-file-name");

    if (file_input.files.length == 0 && file_name_span.textContent != ''){
        formData.delete("file");
    }

    else if (file_input.files.length == 0 && file_name_span.textContent === ''){
        errorMsg.innerText = 'Please upload course material file.';
        errorMsg.classList.add('active');
        return false;
    }

    try {
        beforeLoad(button);
        const headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        const response = await requestAPI(`/api/course/${originalObj.id}`, formData, headers, 'PATCH');
        if (response.status !== 200) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update course');
        }        
        // Handle video uploads (only new videos)
        const newVideos = uploadedVideos.filter(video => !video.existing);
        
        if (newVideos.length > 0) {
            buttonText.textContent = `Uploading videos (0/${newVideos.length})`;
            
            // Upload each new video individually
            for (let i = 0; i < newVideos.length; i++) {
                const video = newVideos[i];
                const videoFormData = new FormData();
                videoFormData.append("course", originalObj.id);
                videoFormData.append("video_file", video.file);
                try {
                    buttonText.textContent = `Uploading videos (${i}/${newVideos.length})`;
                    const videoResponse = await requestAPI('/api/course/video', videoFormData, headers, 'POST');
                    if (videoResponse.status !== 201) {
                        const videoError = await videoResponse.json();
                        // throw new Error(`Failed to upload video ${i+1}: ${videoError.message || 'Unknown error'}`);
                        console.error('Error:', err);
                        button.disabled = false;
                        afterLoad(button, 'Update');
                        errorMsg.innerText = videoError.message || 'An error occurred while updating the course';
                        errorMsg.classList.add('active');
                    }
                } catch (err) {
                    // Log the error but continue with other uploads
                    console.error(`Error uploading video ${i+1}:`, err);
                    // Optionally: Collect errors to show all failures at the end
                }
            }
        }
        
        setTimeout(() => {
            button.disabled = false;
            afterLoad(button, "Updated");
            get_courses(courses_endpoint);
            closeCurrentModal();
            uploadedVideos = [];
        }, 1500);

    } catch (err) {
        console.error('Error:', err);
        button.disabled = false;
        afterLoad(button, 'Update');
        errorMsg.innerText = err.message || 'An error occurred while updating the course';
        errorMsg.classList.add('active');
    }
}

// Helper function to filter and process videos
function processVideosForUpdate() {
    return {
        // Existing videos that weren't deleted
        existingVideos: uploadedVideos.filter(video => video.existing),
        // New videos to be uploaded
        newVideos: uploadedVideos.filter(video => !video.existing)
    };
}

function deleteCourseVideo(id) {
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    
    // Check if modal exists
    if (!modal) {
        console.error('Delete modal not found');
        return;
    }

    let form = modal.querySelector("form");
    if (!form) {
        console.error('Form not found in delete modal');
        return;
    }

    // Update message to be specific about video deletion
    const messageElement = form.querySelector("#message");
    if (messageElement) {
        messageElement.innerText = 'Are you sure you want to delete this video?';
    }

    // Create a single handler function
    const handleSubmit = async (event) => {
        event.preventDefault();
        await deleteCoursVideoForm(event, id);
    };

    form.addEventListener("submit", handleSubmit);

    // Cleanup when modal closes
    const cleanup = () => {
        form.reset();
        form.removeEventListener("submit", handleSubmit);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });
        modal.removeEventListener('hidden.bs.modal', cleanup);
    };

    modal.addEventListener('hidden.bs.modal', cleanup);
    document.querySelector(`.${modalId}`).click();
}

async function deleteCoursVideoForm(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = formDataToObject(formData);

    const button = form.closest(".modal")?.querySelector(`button[form='${form.id}']`);
    if (!button) {
        console.error('Submit button not found');
        return;
    }

    const buttonText = button.querySelector(".btn-text")?.textContent;
    const errorMsg = form.querySelector('.input-error-msg');
    if (errorMsg) {
        errorMsg.innerText = ''; 
        errorMsg.classList.remove('active');
    }

    try {
        beforeLoad(button);
        const headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };

        const response = await requestAPI(`/api/course/video/${id}`, null, headers, 'DELETE');
        
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
            button.disabled = true;

            // Immediate UI updates
            const videoItem = document.querySelector(`.video-item[data-id="${id}"]`);
            if (videoItem) {
                videoItem.remove();
            }

            // Update the videos array
            uploadedVideos = uploadedVideos.filter(video => video.id !== id);

            // Hide container if no videos left
            const videosContainer = document.querySelector(".videos-container");
            if (videosContainer && uploadedVideos.length === 0) {
                videosContainer.classList.add('hide');
            }

            // Close modal after a short delay
            setTimeout(() => {
                if (buttonText) {
                    afterLoad(button, buttonText);
                }
                button.disabled = false;
                closeCurrentModal();
                
                // Update the originalObj to reflect deletion
                if (originalObj?.videos) {
                    originalObj.videos = originalObj.videos.filter(video => video.id !== id);
                }
                editCourse(originalObj)
            }, 500); // Reduced delay for better UX

        } else {
            const res = await response.json();
            afterLoad(button, buttonText || 'Error');
            if (errorMsg) {
                errorMsg.classList.add("active");
                displayMessages(res, errorMsg);
            }
            console.error("Error deleting video:", res);
        }
    } catch (err) {
        console.error("Request failed:", err);
        afterLoad(button, buttonText || 'Error');
        if (errorMsg) {
            errorMsg.innerText = 'Failed to delete video';
            errorMsg.classList.add('active');
        }
    }
}