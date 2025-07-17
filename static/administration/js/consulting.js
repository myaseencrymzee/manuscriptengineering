

// Handle Image Upload
document.getElementById("consulting-image-input").addEventListener("change", function(event) {
    const file = event.target.files[0];
    let uploadBox = event.target.closest('.upload-box');
    uploadBox.querySelector('svg').classList.add('hide');
    uploadBox.querySelector('span').classList.add('hide');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById("consulting-image-preview");
            // preview.style.height = '100%';
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
    document.getElementById("consulting-image-preview").innerHTML = "";
    document.getElementById("consulting-image-preview").classList.add("hide");
    document.getElementById("image-input").value = "";
    uploadBox.querySelector('svg').classList.remove('hide');
    uploadBox.querySelector('span').classList.remove('hide');
}

// Handle File Upload
document.getElementById("coaching-file-input").addEventListener("change", function(event) {
    const file = event.target.files[0];
    document.getElementById("coaching-file-name").textContent = file ? file.name : "No file chosen";
});


// APIs calling
let consulting_endpoint = '/api/consulting?perPage=1000';
let consulting_data;
let formEvent = null;
get_consultings(consulting_endpoint);

async function get_consultings(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                render_consulting_data(res);
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

function render_consulting_data(data){
    consulting_data = data.data;
    let container = document.getElementById("consulting-services-container");
    if (consulting_data.length > 0) {
        container.innerHTML = '';
        consulting_data.forEach(obj => {
            let div = document.createElement("div");
            div.classList.add("coaching-services");
            let image = document.createElement("img");
            image.src = obj.image;
            image.alt = "consulting image";
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
            editButton.addEventListener("click", () => editConsulting(obj));
            let deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.addEventListener("click", () => deleteConsulting(obj));
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

let consultingSearchForm = document.getElementById("searchForm");
consultingSearchForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    consulting_endpoint = setParams(consulting_endpoint, 'search', data.search);
    get_consultings(consulting_endpoint);
})

let originalObj = null;
function deleteConsulting(obj) {
    originalObj = obj; 
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    form.querySelector("#message").innerText = 'Are you sure you want to delete this consulting?'
    formEvent = (event) => deleteConsultingForm(event);
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

async function deleteConsultingForm(event) {
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
        let response = await requestAPI(`/api/consulting/${originalObj.id}`, null, headers, 'DELETE');
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_consultings(consulting_endpoint);
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

let add_consulting_button = document.querySelector(".add-new-button");
add_consulting_button.addEventListener("click", () => {
    let modalId = 'addConsultingModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");

    formEvent = (event) => addConsultingForm(event);
    form.addEventListener("submit", formEvent);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });

        let uploadBox = modal.querySelector(".remove-image")?.closest(".upload-box");
        document.getElementById("consulting-image-preview").innerHTML = "";
        document.getElementById("consulting-image-preview").classList.add("hide");
        document.getElementById("image-input").value = "";
        uploadBox?.querySelector('svg').classList.remove('hide');
        uploadBox?.querySelector('span').classList.remove('hide');
    });
    document.querySelector(`.${modalId}`).click();
});

async function addConsultingForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    console.log(data)
    let image = formData.get("image");
    // let file = formData.get("file");

    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');

    if (!data.title || data.title.trim().length === 0) {
        errorMsg.innerText = 'Please enter a title.';
        errorMsg.classList.add('active');
        return false;
    } 
    if (image.size == 0) {
        errorMsg.innerText = 'Please upload an image.';
        errorMsg.classList.add('active');
        return false;
    }    
    if (!data.description || data.description.trim().length === 0) {
        errorMsg.innerText = 'Please write a description.';
        errorMsg.classList.add('active');
        return false;
    }
    // if (file.size == 0) {
    //     errorMsg.innerText = 'Please upload coaching material file.';
    //     errorMsg.classList.add('active');
    //     return false;
    // }    
    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI('/api/consulting', formData, headers, 'POST');
        response.json().then(function(res) {
            if (response.status == 201) {
                afterLoad(button, 'Saved');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_consultings(consulting_endpoint);
                    closeCurrentModal()
                }, 1500)
            }
            else {
                afterLoad(button, buttonText);
                errorMsg.classList.add("active");
                displayMessages(res, errorMsg);
                return;
            }
        })
    }
    catch (err) {
        console.log(err);
    }
}

function editConsulting(obj) {
    originalObj = obj; 

    let modalId = 'addConsultingModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");

    formEvent = (event) => updateConsultingForm(event);
    form.addEventListener("submit",formEvent);

    modal.querySelector(".modal-title").innerText = "Update Coaching";
    modal.querySelector("button[type='submit']").querySelector(".btn-text").innerText = "Update";

    // Populate the data
    form.querySelector("input[name='title']").value = obj?.title;
    form.querySelector("textarea[name='description']").value = obj?.description;

    form.querySelector("#consulting-image-preview").innerHTML = returnImagePreviewHTML(obj?.image);
    form.querySelector("#consulting-image-preview").classList.remove("hide");
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
        document.getElementById("consulting-image-preview").innerHTML = "";
        document.getElementById("consulting-image-preview").classList.add("hide");
        document.getElementById("image-input").value = "";
        uploadBox?.querySelector('svg').classList.remove('hide');
        uploadBox?.querySelector('span').classList.remove('hide');

    });
    document.querySelector(`.${modalId}`).click();
}

async function updateConsultingForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.querySelector("button[type='submit']");
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');

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

    // let file_input = form.querySelector("input[name='file']");
    // let file_name_span = form.querySelector("#coaching-file-name");

    // if (file_input.files.length == 0 && file_name_span.textContent != ''){
    //     formData.delete("file");
    // }

    // else if (file_input.files.length == 0 && file_name_span.textContent === ''){
    //     errorMsg.innerText = 'Please upload course material file.';
    //     errorMsg.classList.add('active');
    //     return false;
    // }

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };

        beforeLoad(button);
        let response = await requestAPI(`/api/consulting/${originalObj.id}`, formData, headers, 'PATCH');
        let res = await response.json();

        if (response.status === 200) {
            afterLoad(button, 'Updated');
            button.disabled = true;
            setTimeout(() => {
                button.disabled = false;
                afterLoad(button, buttonText);
                get_consultings(consulting_endpoint);
                closeCurrentModal();
            }, 1500);
        } else {
            afterLoad(button, buttonText);
            errorMsg.classList.add("active");
            displayMessages(res, errorMsg);
        }
    } catch (err) {
        console.error("Error updating course:", err);
    }
}
