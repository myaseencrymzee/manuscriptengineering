

const blogIdentifier = JSON.parse(document.getElementById("blogId").textContent) || null;
const update_blog = JSON.parse(document.getElementById("update_blog").textContent) || false;
const view_blog = JSON.parse(document.getElementById("view_blog").textContent) || false;
const get_blog_endpoint = `/api/blog/${blogIdentifier}`;


if ((update_blog && blogIdentifier) || (view_blog && blogIdentifier)){
    get_blog(get_blog_endpoint)
}

async function get_blog(endpoint){
    try {
        let headers = {};
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                render_blog_data(res)
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

function render_blog_data(blog){
    document.querySelector("input[name='title']").value = blog.title;
    // document.querySelector("input[name='date']").value = reformatDate(blog.date);
    document.querySelector(".ql-editor").innerHTML = blog.content;
    blog.images.map((img) => insertImage(img))
    console.log(document.querySelector(`input[name=${blog.publish_to}]`))
    document.querySelector(`input[value=${blog.publish_to}]`).checked=true;

}


function deleteConsulting(obj) {
    originalObj = obj; 
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    form.querySelector("#message").innerText = 'Are you sure you want to delete this consulting?'
    formEvent = (event) => deleteConsultingForm(event, obj);
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

async function deleteConsultingForm(event, id) {
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
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI(`/api/blog/image/${id}`, null, headers, 'DELETE');
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
            button.disabled = true;
            let imageBox = document.querySelector(`.imagecontainer[data-image-id='${id}']`);
            imageBox.remove();
            setTimeout(() => {
                button.disabled = false;
                afterLoad(button, buttonText);
                closeCurrentModal()
            }, 1500)
        } else {
            let res = await response.json();
            afterLoad(button, buttonText);
            errorMsg.classList.add("active");
            displayMessages(res, errorMsg);
            console.error("Error deleting image:", res);
            return;
        }
    } catch (err) {
        console.error("Request failed:", err);
    }
}


function insertImage(image){
    const imageBox = document.getElementById('imageBox');
    // Create image element
    const imgElement = document.createElement('img');
    imgElement.classList.add('blog-image');
    imgElement.src = image.image;

    // Create cross icon for deleting the image
    const crossIcon = document.createElement('span');
    crossIcon.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fad" data-icon="circle-xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-circle-xmark fa-lg"><g class="fa-duotone-group"><path fill="red" d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zm168.1 61.7c.1-.7 .2-1.5 .3-2.3c.3-1.5 .7-3 1.3-4.4c1.2-2.9 2.9-5.6 5.3-7.9c15.7-15.7 31.4-31.4 47-47c-15.7-15.7-31.3-31.3-47-47c-9.4-9.4-9.4-24.6 0-33.9c4.7-4.7 10.8-7 17-7s12.3 2.3 17 7c15.7 15.7 31.4 31.4 47 47c15.7-15.7 31.4-31.4 47-47c4.7-4.7 10.8-7 17-7s12.3 2.3 17 7c9.4 9.4 9.4 24.6 0 33.9c-15.7 15.7-31.3 31.3-47 47c15.7 15.7 31.4 31.4 47 47c4.7 4.7 7 10.8 7 17s-2.3 12.3-7 17s-10.8 7-17 7s-12.3-2.3-17-7l-47-47c-15.7 15.7-31.3 31.3-47 47c-4.7 4.7-10.8 7-17 7s-12.3-2.3-17-7c-2.3-2.3-4.1-5.1-5.3-7.9c-.6-1.4-1-2.9-1.3-4.4c-.2-1.1-.4-2.3-.3-2.2c-.1-1.2-.1-1.2-.1-2.4c0-1.5 .1-1.9 .1-2.3z" class="fa-secondary"></path><path fill="#ffffff" d="M209 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47z" class="fa-primary"></path></g></svg>';
    crossIcon.classList.add('cross');

    // Create a container for the image and cross icon
    const imageContainer = document.createElement('div');
    imageContainer.setAttribute("data-image-id", image.id);
    imageContainer.classList.add('imagecontainer');
    imageContainer.appendChild(imgElement);
    imageContainer.appendChild(crossIcon);

    // Append the container to the imageBox
    imageBox.classList.add('width-max-content', 'd-flex', 'gap-2');
    imageBox.appendChild(imageContainer);

    if (!(view_blog && blogIdentifier)){
        // Handle cross icon click to remove the image
        crossIcon.addEventListener('click', async function() {
            
            const totalImages = document.querySelectorAll('.imagecontainer').length;
                    
            if (totalImages <= 1) {
                showError('fileInput', 'At least one image is required.');
                return;
            }

            
            const imageId = imageContainer.getAttribute('data-image-id');
            deleteConsulting(imageId)
            return;

            if (blogId) {
                await fetch(`/api/blog/image/${imageId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                        },
                    })
                    .then((response) => {
                        if (response.status !== 204) {
                            throw new Error('Failed to delete image');
                        }
                        imageBox.removeChild(imageContainer); // Remove the container from the DOM

                        // Validate the form again after deleting the image
                        validateForm();
                    })
                    .catch((error) => {
                        console.error('Error deleting image:', error);
                    });
            } else {
                // If blogId doesn't exist, just remove the image from the DOM
                imageBox.removeChild(imageContainer);

                // Validate the form again after deleting the image
                validateForm();
            }
        });
    }
}

function reformatDate(date){
    let month = date.split("-")[1]
    let day = date.split("-")[2]
    let year = date.split("-")[0]

    return `${month}/${day}/${year}`;
}

// date picker
flatpickr("#datepicker", {
    enableTime: false,
    dateFormat: "m/d/Y",
    time_24hr: true,
    disableMobile: true
});

var Delta = Quill.import('delta');

var quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Write here...',
    modules: {
        toolbar: {
            container: '#toolbar'
        },
        history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
        }
    }
});

// Example usage of Delta
quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
    return new Delta().insert(node.data);
});

quill.root.addEventListener('paste', function (e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    quill.clipboard.dangerouslyPasteHTML(0, text);
});

document.querySelector('.ql-undo').addEventListener('click', () => {
    quill.history.undo();
});

document.querySelector('.ql-redo').addEventListener('click', () => {
    quill.history.redo();
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector('.blogs-information');
    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('datepicker');
    const contentEditor = document.querySelector('.ql-editor');
    const fileInput = document.getElementById('fileInput');
    const imageBox = document.getElementById('imageBox');
    const endpoint = "/api/blog";
    let blogId = blogIdentifier;
    let autoSaveInterval;
    let autoSaveTimeout;
    let isSaving = false; // Flag to prevent overlapping saves
    let auto_save = false;

    const now = new Date();
    let date = now.toISOString().split('T')[0];

    // Function to send a POST request to save the blog
    const saveBlog = async (status) => {
        if (isSaving) return;
        isSaving = true;
        
        const formData = new FormData();
        formData.append('title', titleInput.value);
        if (auto_save == false) {
            formData.append('date', date);
        }
        formData.append('content', contentEditor.innerHTML);
        formData.append('status', status);
        let publish_to = document.querySelector("input[name='publish_to']:checked")?.value
        formData.append('publish_to', publish_to != 'undefined' ? publish_to : '')
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
            });

            const data = await response.json();
            blogId = data.id;
            return response;
        } finally {
            isSaving = false;
        }
    };

    // Function to send a PATCH request to update the blog
    const updateBlog = async (status) => {
        if (isSaving) return;
        isSaving = true;
        
        let data = {
            title: titleInput.value,
            content: contentEditor.innerHTML,
            status: status,
        }
        if (auto_save == false) {
            data['date'] = date;
        }
        let publish_to = document.querySelector("input[name='publish_to']:checked")?.value
        data['publish_to'] = publish_to != 'undefined' ? publish_to : ''
        try {
            const response = await fetch(`${endpoint}/${blogId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
            });
            return response;
        } finally {
            isSaving = false;
        }
    };

    // Debounced auto-save function
    const autoSave = async () => {
        if (isSaving || update_blog) return;
        
        auto_save = true;
        if (!checkFields()) {
            return;
        }

        // Clear any pending auto-save
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        // Debounce the auto-save to prevent rapid successive calls
        autoSaveTimeout = setTimeout(async () => {
            try {
                if (blogId) {
                    await updateBlog('pending');
                } else {
                    await saveBlog('pending');
                }
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, 1000); // 1 second debounce
    };

    // Function to start auto-save interval
    const startAutoSaveInterval = () => {
        if (!update_blog && !autoSaveInterval) {
            autoSaveInterval = setInterval(autoSave, 30000); // 30 seconds
        }
    };

    // Function to stop auto-save interval
    const stopAutoSaveInterval = () => {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
        }
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }
    };

    // Trigger auto-save on blur event of fields
    const fields = [titleInput, dateInput];
    fields.forEach((field) => {
        field.addEventListener('blur', async () => {
            await autoSave();
            if (!autoSaveInterval) {
                startAutoSaveInterval();
            }
        });
    });

    // Debounced Quill editor change handler
    let quillChangeTimeout;
    quill.on('text-change', () => {
        if (view_blog && blogIdentifier) return;
        
        if (quillChangeTimeout) {
            clearTimeout(quillChangeTimeout);
        }
        
        quillChangeTimeout = setTimeout(() => {
            if (!quill.root.classList.contains('ql-blank')) {
                autoSave();
                if (!autoSaveInterval) {
                    startAutoSaveInterval();
                }
            }
        }, 1000); // 1 second debounce
    });

    // Save blog before the user changes the page
    window.addEventListener('beforeunload', async (event) => {
        if (!isSaving) {
            await autoSave();
        }
    });

    // Handle form submission (Publish button click)
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        let form = event.target;
        let button = form.querySelector("button[type='submit']");
        let buttonText = button.querySelector(".btn-text").textContent;

        if (!validateForm()) {
            return;
        }

        // Disable button to prevent multiple submissions
        button.disabled = true;
        beforeLoad(button);
        stopAutoSaveInterval();
        auto_save = false;

        try {
            let response;
            if (blogId) {
                response = await updateBlog('published');
                if (response.status == 200) {
                    afterLoad(button, 'Published');
                    setTimeout(() => {
                        location.pathname = '/admin-blogs/';
                    }, 1500);
                }
            } else {
                response = await saveBlog('published');
                if (response.status == 201) {
                    afterLoad(button, 'Published');
                    setTimeout(() => {
                        location.pathname = '/admin-blogs/';
                    }, 1500);
                }
            }
        } catch (error) {
            console.error('Publish failed:', error);
            button.disabled = false;
            afterLoad(button, buttonText);
        }
    });

    fileInput.addEventListener('change', async function(event) {
        const files = event.target.files;
        if (files.length === 0) return;
    
        // Clear previous images
        imageBox.innerHTML = '';
        
        // Create and show spinner
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border text-primary';
        spinner.style.width = '3rem';
        spinner.style.height = '3rem';
        spinner.setAttribute('role', 'status');
        
        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = 'd-flex justify-content-center align-items-center';
        spinnerContainer.style.minHeight = '200px';
        spinnerContainer.appendChild(spinner);
        
        imageBox.appendChild(spinnerContainer);
    
        // Process only the first file (single image upload)
        const file = files[0];
        const reader = new FileReader();
    
        reader.onload = async function(e) {
            // Create temporary image preview (still loading)
            const imgElement = document.createElement('img');
            imgElement.classList.add('blog-image', 'img-preview');
            imgElement.src = e.target.result;
            imgElement.style.opacity = '0.5'; // Make it semi-transparent while uploading
    
            // Create cross icon
            const crossIcon = document.createElement('span');
            crossIcon.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fad" data-icon="circle-xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-circle-xmark fa-lg"><g class="fa-duotone-group"><path fill="red" d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zm168.1 61.7c.1-.7 .2-1.5 .3-2.3c.3-1.5 .7-3 1.3-4.4c1.2-2.9 2.9-5.6 5.3-7.9c15.7-15.7 31.4-31.4 47-47c-15.7-15.7-31.3-31.3-47-47c-9.4-9.4-9.4-24.6 0-33.9c4.7-4.7 10.8-7 17-7s12.3 2.3 17 7c15.7 15.7 31.4 31.4 47 47c15.7-15.7 31.4-31.4 47-47c4.7-4.7 10.8-7 17-7s12.3 2.3 17 7c9.4 9.4 9.4 24.6 0 33.9c-15.7 15.7-31.3 31.3-47 47c15.7 15.7 31.4 31.4 47 47c4.7 4.7 7 10.8 7 17s-2.3 12.3-7 17s-10.8 7-17 7s-12.3-2.3-17-7l-47-47c-15.7 15.7-31.3 31.3-47 47c-4.7 4.7-10.8 7-17 7s-12.3-2.3-17-7c-2.3-2.3-4.1-5.1-5.3-7.9c-.6-1.4-1-2.9-1.3-4.4c-.2-1.1-.4-2.3-.3-2.2c-.1-1.2-.1-1.2-.1-2.4c0-1.5 .1-1.9 .1-2.3z" class="fa-secondary"></path><path fill="#ffffff" d="M209 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47z" class="fa-primary"></path></g></svg>';
            crossIcon.classList.add('cross');
    
            // Create container
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('imagecontainer');
            imageContainer.appendChild(imgElement);
            imageContainer.appendChild(crossIcon);
    
            // Replace spinner with image container
            imageBox.innerHTML = '';
            imageBox.classList.add('width-max-content', 'd-flex', 'gap-2');
            imageBox.appendChild(imageContainer);
    
            // Upload image to backend
            const imageFormData = new FormData();
            imageFormData.append('image', file);
    
            try {
                let response;
                if (blogId) {
                    response = await fetch(`${endpoint}/${blogId}`, {
                        method: 'PATCH',
                        body: imageFormData,
                        headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                        },
                    });
                } else {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        body: imageFormData,
                        headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                        },
                    });
                }
                
                if(response.status == 200 || response.status == 201){
                    imgElement.style.opacity = 'unset'; // Make it semi-transparent while uploading                
                }
                const res = await response.json();
    
                if (res.image) {
                    // Update image container with final data
                    imageContainer.setAttribute('data-image-id', res.image.id);
                    imgElement.style.opacity = '1'; // Make image fully visible
                    verifyImageDeletion(crossIcon, imageContainer);
                    
                    // Update blogId if it's a new blog
                    if (!blogId && res.id) {
                        blogId = res.id;
                    }
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                // Show error message and remove the image preview
                imageBox.innerHTML = '<div class="alert alert-danger">Image upload failed</div>';
            }
        };
    
        reader.readAsDataURL(file);
    });

    // Image deletion handling
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        const imageId = document.getElementById('confirmModal').getAttribute('data-target-image');
        const imageContainer = document.querySelector(`[data-image-id="${imageId}"]`);
        
        if (imageContainer) {
            imageBox.removeChild(imageContainer);
        }
    
        bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
    });

    function checkFields() {
        const images = imageBox.querySelectorAll('.imagecontainer');
        const content = document.querySelector('.ql-editor');
        return !(titleInput.value.trim() == "" && 
               dateInput.value.trim() == "" && 
               images.length == 0 && 
               content.classList.contains("ql-blank"));
    }
});

function verifyImageDeletion(element, imageContainer) {
    element.addEventListener("click", function() {
        const totalImages = document.querySelectorAll('.imagecontainer').length;         
        if (totalImages <= 1) {
            showError('fileInput', 'At least one image is required.');
            return;
        }
        
        const imageId = imageContainer.getAttribute('data-image-id');
        deleteConsulting(imageId)
        return;
    })
}

function validateForm() {
    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('datepicker').value.trim();
    const content = document.querySelector('.ql-editor');
    const images = imageBox.querySelectorAll('.imagecontainer'); 
    console.log(content);
    
    let isValid = true;

    // Validate Title
    if (title === '') {
        showError('title', 'Title is required.');
        isValid = false;
    } else if (title.length > 100) {
        showError('title', 'Title should not exceed 100 characters.');
        isValid = false;
    } else {
        clearError('title');
    }

    // Validate Date
    // const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/; // Regex for mm/dd/yy
    // if (date === '') {
    //     showError('datepicker', 'Date is required.');
    //     isValid = false;
    // } else if (!datePattern.test(date)) {
    //     showError('datepicker', 'Date should be in the format mm/dd/yy.');
    //     isValid = false;
    // } else {
    //     clearError('datepicker');
    // }

    // Validate Content
    if (content.classList.contains("ql-blank") || isQuillEmpty(quill)) {
        showError('editor', 'Content is required.');
        isValid = false;
    } else {
        clearError('editor');
    }

    // Validate Image
    if (images.length === 0) {
        showError('fileInput', 'At least one image is required.');
        isValid = false;
    } else {
        clearError('fileInput');
    }

    return isValid;
}

function isQuillEmpty(quill) {
    if ((quill.getContents()['ops'] || []).length !== 1)
        return false;
    return quill.getText().trim().length === 0
  }

// Function to show error message
function showError(fieldId, message) {
    const errorDiv = document.querySelector(`#${fieldId}`).closest('.input-wrapper') || document.querySelector(`#${fieldId}`).closest('.blogs-image-input') || document.querySelector(`#${fieldId}`).closest('.blog-content');
    const errorMsg = errorDiv.querySelector('.input-error-msg');
    errorMsg.textContent = message;
    errorMsg.classList.add("active");
}

// Function to clear error message
function clearError(fieldId) {
    const errorDiv = document.querySelector(`#${fieldId}`).closest('.input-wrapper') || document.querySelector(`#${fieldId}`).closest('.blogs-image-input') || document.querySelector(`#${fieldId}`).closest('.blog-content');
    const errorMsg = errorDiv.querySelector('.input-error-msg');
    errorMsg.textContent = '';
    errorMsg.classList.remove("active");
}

function formatDate(dateStr) {
    let month = dateStr.split("/")[0]
    let day = dateStr.split("/")[1]
    let year = dateStr.split("/")[2]

    return `${year}-${month}-${day}`;
}



