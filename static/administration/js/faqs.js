
// APIs calling
let faqs_endpoint = '/api/faqs?perPage=1000';
let faqs_data;
let originalObj = null;
let formEvent = null;
get_faqs(faqs_endpoint);

async function get_faqs(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                render_faqs_data(res);
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

function render_faqs_data(data) {
    let faqs_data = data.data;
    let container = document.getElementById("faq-container");
    container.innerHTML = '';

    if (faqs_data.length > 0) {
        faqs_data.forEach(obj => {
            let faqDiv = document.createElement("div");
            faqDiv.classList.add("faq");

            // Question Section
            let questionDiv = document.createElement("div");
            questionDiv.classList.add("faq-question");

            let questionSpan = document.createElement("span");
            questionSpan.innerText = obj.question;

            let optionsDiv = document.createElement("div");
            optionsDiv.classList.add("options", "dropdown", "dropstart");

            const svgNS = "http://www.w3.org/2000/svg";

            let dropdownToggle = document.createElementNS(svgNS, "svg");
            dropdownToggle.classList.add("cursor-pointer");
            dropdownToggle.classList.add("dropdown-toggle");
            dropdownToggle.setAttribute("data-bs-toggle", "dropdown");
            dropdownToggle.setAttribute("aria-expanded", "false");
            dropdownToggle.setAttribute("width", "24");
            dropdownToggle.setAttribute("height", "24");
            dropdownToggle.setAttribute("viewBox", "0 0 24 24");
            dropdownToggle.setAttribute("fill", "none");

            let svgPath = document.createElementNS(svgNS, "path");
            svgPath.setAttribute("d", `M12 20C11.45 20 10.9792 19.8042 10.5875 19.4125C10.1958 19.0208 10 18.55 10 18C10 17.45 10.1958 16.9792 10.5875 16.5875C10.9792 16.1958 11.45 16 12 16C12.55 16 13.0208 16.1958 13.4125 16.5875C13.8042 16.9792 14 17.45 14 18C14 18.55 13.8042 19.0208 13.4125 19.4125C13.0208 19.8042 12.55 20 12 20ZM12 14C11.45 14 10.9792 13.8042 10.5875 13.4125C10.1958 13.0208 10 12.55 10 12C10 11.45 10.1958 10.9792 10.5875 10.5875C10.9792 10.1958 11.45 10 12 10C12.55 10 13.0208 10.1958 13.4125 10.5875C13.8042 10.9792 14 11.45 14 12C14 12.55 13.8042 13.0208 13.4125 13.4125C13.0208 13.8042 12.55 14 12 14ZM12 8C11.45 8 10.9792 7.80417 10.5875 7.4125C10.1958 7.02083 10 6.55 10 6C10 5.45 10.1958 4.97917 10.5875 4.5875C10.9792 4.19583 11.45 4 12 4C12.55 4 13.0208 4.19583 13.4125 4.5875C13.8042 4.97917 14 5.45 14 6C14 6.55 13.8042 7.02083 13.4125 7.4125C13.0208 7.80417 12.55 8 12 8Z`);
            svgPath.setAttribute("fill", "#00274D");
            dropdownToggle.appendChild(svgPath);

            let dropdownMenu = document.createElement("ul");
            dropdownMenu.classList.add("dropdown-menu", "dropdown-position-set");

            let editItem = document.createElement("li");
            let editLink = document.createElement("a");
            editLink.classList.add("dropdown-item");
            editLink.href = "#";
            editLink.innerText = "Edit";
            editLink.addEventListener("click", () => editFAQ(obj));
            editItem.appendChild(editLink);

            let deleteItem = document.createElement("li");
            let deleteLink = document.createElement("a");
            deleteLink.classList.add("dropdown-item", "delete");
            deleteLink.href = "#";
            deleteLink.innerText = "Delete";
            deleteLink.addEventListener("click", () => deleteFAQ(obj));
            deleteItem.appendChild(deleteLink);

            dropdownMenu.appendChild(editItem);
            dropdownMenu.appendChild(deleteItem);

            optionsDiv.appendChild(dropdownToggle);
            optionsDiv.appendChild(dropdownMenu);

            questionDiv.appendChild(questionSpan);
            questionDiv.appendChild(optionsDiv);

            // Answer Section
            let answerDiv = document.createElement("div");
            answerDiv.classList.add("faq-answer");
            let answerSpan = document.createElement("span");
            answerSpan.innerText = obj.answer;
            answerDiv.appendChild(answerSpan);

            // Append all to FAQ div
            faqDiv.appendChild(questionDiv);
            faqDiv.appendChild(answerDiv);
            container.appendChild(faqDiv);
        });
    } else {
        let div = document.createElement("div");
        div.classList.add("w-100", "d-flex", "justify-content-center");
        let span = document.createElement("span");
        span.classList.add("text-center");
        span.textContent = "No data available.";
        div.appendChild(span);
        container.appendChild(div);
    }
}

let faqsSearchForm = document.getElementById("searchForm");
faqsSearchForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    faqs_endpoint = setParams(faqs_endpoint, 'search', data.search);
    get_faqs(faqs_endpoint);
})

function deleteFAQ(obj) {
    originalObj = obj; 
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    form.querySelector("#message").innerText = 'Are you sure you want to delete this FAQ?'
    formEvent = (event) => deleteFAQForm(event);
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

async function deleteFAQForm(event) {
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
        let response = await requestAPI(`/api/faqs/${originalObj.id}`, null, headers, 'DELETE');
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_faqs(faqs_endpoint);
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

let add_speaking_button = document.querySelector(".add-new-button");
add_speaking_button.addEventListener("click", () => {
    let modalId = 'addFAQModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");

    // Remove previous event listener before adding a new one

    formEvent = (event) => addFAQForm(event);

    form.addEventListener("submit", formEvent);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });

        let uploadBox = modal.querySelector(".remove-image")?.closest(".upload-box");
        document.getElementById("speaking-image-preview").innerHTML = "";
        document.getElementById("speaking-image-preview").classList.add("hide");
        document.getElementById("image-input").value = "";
        uploadBox?.querySelector('svg').classList.remove('hide');
        uploadBox?.querySelector('span').classList.remove('hide');
    });
    document.querySelector(`.${modalId}`).click();
});

async function addFAQForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    // let image = formData.get("image");
    // let file = formData.get("file");

    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');

    if (!data.question || data.question.trim().length === 0) {
        errorMsg.innerText = 'Please enter a question.';
        errorMsg.classList.add('active');
        return false;
    } 
    // if (image.size == 0) {
    //     errorMsg.innerText = 'Please upload an image.';
    //     errorMsg.classList.add('active');
    //     return false;
    // }    
    if (!data.answer || data.answer.trim().length === 0) {
        errorMsg.innerText = 'Please write a answer.';
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
        let response = await requestAPI('/api/faqs', formData, headers, 'POST');
        response.json().then(function(res) {
            if (response.status == 201) {
                afterLoad(button, 'Saved');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_faqs(faqs_endpoint);
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

function editFAQ(obj) {
    originalObj = obj;  // Kept for reference

    let modalId = 'addFAQModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");

    formEvent = (event) => updateFAQForm(event);
    form.addEventListener("submit", formEvent);

    modal.querySelector(".modal-title").innerText = "Update Coaching";
    modal.querySelector("button[type='submit']").querySelector(".btn-text").innerText = "Update";

    form.querySelector("input[name='question']").value = obj?.question || "";
    form.querySelector("textarea[name='answer']").value = obj?.answer || "";

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

async function updateFAQForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.querySelector("button[type='submit']");
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');

    errorMsg.innerText = '';
    errorMsg.classList.remove('active');

    if (!data.question || data.question.trim().length === 0) {
        errorMsg.innerText = 'Please enter a question.';
        errorMsg.classList.add('active');
        return false;
    }

    // let image_input = form.querySelector("input[name='image']");
    // let preview_image = form.querySelector("#preview-img");

    // if (image_input.files.length == 0 && preview_image){
    //     formData.delete("image");
    // }

    // else if (image_input.files.length == 0 && preview_image == undefined ){
    //     errorMsg.innerText = 'Please upload an image.';
    //     errorMsg.classList.add('active');
    //     return false;
    // }

    if (!data.answer || data.answer.trim().length === 0) {
        errorMsg.innerText = 'Please write a answer.';
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
        let response = await requestAPI(`/api/faqs/${originalObj.id}`, formData, headers, 'PATCH');
        let res = await response.json();

        if (response.status === 200) {
            afterLoad(button, 'Updated');
            button.disabled = true;
            setTimeout(() => {
                button.disabled = false;
                afterLoad(button, buttonText);
                get_faqs(faqs_endpoint);
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
