


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



// APIs calling
let manuscripting_endpoint = '/api/manuscript?perPage=1';


async function get_manuscripts(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                console.log(res);
                renderManuscriptData(res.data);
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
window.addEventListener('load', get_manuscripts(manuscripting_endpoint)); 



function renderManuscriptData(data) {
    console.log(data);
    document.getElementById("title").value = data[0].title;
    document.getElementById("description").value = data[0].description;
    document.getElementById("speaking-image-preview").innerHTML = returnImagePreviewHTML(data[0].image);
    document.getElementById("speaking-image-preview").classList.remove("hide");
    let uploadBox = document.querySelector('.upload-box');
    uploadBox.querySelector('svg').classList.add('hide');
    uploadBox.querySelector('span').classList.add('hide');

    document.getElementById("manuscriptForm").setAttribute("onsubmit", `updateManuscriptForm(event, ${data[0].id})`);
    // document.getElementById("speaking-image-input").value = data[0].image;
}



async function addManuscriptForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let image = formData.get("image");
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
    if (!data.description || data.description.trim().length === 0) {
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
        let response = await requestAPI('/api/manuscript', formData, headers, 'POST');
        response.json().then(function(res) {
            if (response.status == 201) {
                afterLoad(button, 'Saved');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
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


async function updateManuscriptForm(event, id) {
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

    else if (image_input.files.length == 0 && preview_image == undefined){
        errorMsg.innerText = 'Please upload an image.';
        errorMsg.classList.add('active');
        return false;
    }

    if (!data.description || data.description.trim().length === 0) {
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
        let response = await requestAPI(`/api/manuscript/${id}`, formData, headers, 'PATCH');
        let res = await response.json();

        if (response.status === 200) {
            afterLoad(button, 'Updated');
            button.disabled = true;
            setTimeout(() => {
                button.disabled = false;
                afterLoad(button, buttonText);
      
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