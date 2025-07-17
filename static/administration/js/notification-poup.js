


document.getElementById("speaking-image-input").addEventListener("change", function(event) {
    const file = event.target.files[0];
    let uploadBox = event.target.closest('.upload-box');
    uploadBox.querySelector('svg').classList.add('hide');
    uploadBox.querySelector('span').classList.add('hide');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById("speaking-image-preview");
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

function removeImage(event) {
    let uploadBox = event.target.closest(".remove-image").closest(".upload-box");
    event.preventDefault();
    document.getElementById("speaking-image-preview").innerHTML = "";
    document.getElementById("speaking-image-preview").classList.add("hide");
    document.getElementById("speaking-image-input").value = "";
    uploadBox.querySelector('svg').classList.remove('hide');
    uploadBox.querySelector('span').classList.remove('hide');
}

document.getElementById("speaking-image-input-file").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("notification-file-name").textContent = file ? file.name : "No file chosen";
        };
        reader.readAsDataURL(file);
    }
});




// APIs calling
let popup_endpoint = '/api/subscriber/popup?perPage=1';


async function get_popup_data(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                console.log(res);
                renderPopupData(res);
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
window.addEventListener('load', get_popup_data(popup_endpoint)); 



function renderPopupData(data) {
    console.log(data);
    if (data.length == 0) return false;
    document.getElementById("title").value = data[0]?.title;
    document.getElementById("description").value = data[0]?.message;
    document.getElementById("speaking-image-preview").innerHTML = returnImagePreviewHTML(data[0]?.lead_magnet_image);
    document.getElementById("speaking-image-preview").classList.remove("hide");
    let uploadBox = document.querySelector('.upload-box');
    uploadBox.querySelector('svg').classList.add('hide');
    uploadBox.querySelector('span').classList.add('hide');

    document.getElementById("notification-file-name").classList.remove("hide");
    let file_name = data[0].lead_magnet_pdf ? data[0].lead_magnet_pdf.split('/').pop() : "No file chosen";
    document.getElementById("notification-file-name").textContent = data[0]?.lead_magnet_pdf ? file_name : "No file chosen";

    document.getElementById("manuscriptForm").setAttribute("onsubmit", `updatePopupForm(event, ${data[0]?.id})`);
    // document.getElementById("speaking-image-input").value = data[0].image;
}


async function addPopupForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let image = formData.get("lead_magnet_image");
    // let file = formData.get("file");

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
    if (image.size == 0) {
        errorMsg.innerText = 'Please upload an image.';
        errorMsg.classList.add('active');
        return false;
    }    

    let file_input = form.querySelector("input[name='lead_magnet_pdf']");
    let preview_file = form.querySelector("#notification-file-name");

    if (file_input.files.length == 0 && preview_file){
        formData.delete("lead_magnet_pdf");
    }

    else if (file_input.files.length == 0 && preview_file == undefined){
        errorMsg.innerText = 'Please upload a file.';
        errorMsg.classList.add('active');
        return false;
    }


    if (!data.message || data.message.trim().length === 0) {
        errorMsg.innerText = 'Please write a description.';
        errorMsg.classList.add('active');
        return false;
    }   
    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI('/api/subscriber/popup', formData, headers, 'POST');
        response.json().then(function(res) {
            if (response.status == 201) {
                afterLoad(button, 'Saved');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_popup_data(popup_endpoint);
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


async function updatePopupForm(event, id) {
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

    let image_input = form.querySelector("input[name='lead_magnet_image']");
    let preview_image = form.querySelector("#preview-img");

    if (image_input.files.length == 0 && preview_image){
        formData.delete("lead_magnet_image");
    }

    else if (image_input.files.length == 0 && preview_image == undefined){
        errorMsg.innerText = 'Please upload an image.';
        errorMsg.classList.add('active');
        return false;
    }

    
    let file_input = form.querySelector("input[name='lead_magnet_pdf']");
    let preview_file = form.querySelector("#notification-file-name");

    if (file_input.files.length == 0 && preview_file){
        formData.delete("lead_magnet_pdf");
    }

    else if (file_input.files.length == 0 && preview_file == undefined){
        errorMsg.innerText = 'Please upload a file.';
        errorMsg.classList.add('active');
        return false;
    }



    if (!data.message || data.message.trim().length === 0) {
        errorMsg.innerText = 'Please write a description.';
        errorMsg.classList.add('active');
        return false;
    }

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };

        beforeLoad(button);
        let response = await requestAPI(`/api/subscriber/popup/${id}`, formData, headers, 'PATCH');
        let res = await response.json();

        if (response.status === 200) {
            afterLoad(button, 'Updated');
            button.disabled = true;
            setTimeout(() => {
                button.disabled = false;
                afterLoad(button, buttonText);
                get_popup_data(popup_endpoint);
      
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