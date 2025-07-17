

document.querySelector("input[name='profile_picture']").addEventListener("change", (event) => {
    let file = event.target.files[0];
    if (file) {
        let imgElement = event.target.closest("label").querySelector("img");
        imgElement.src = URL.createObjectURL(file);
    }
});

let profile_endpoint = '/api/profile';
let  profile_data = null;
async function get_profile_data(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                profile_data = res;
                insert_profile_data(res);
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

window.addEventListener("load", get_profile_data(profile_endpoint));
function insert_profile_data(data) {
    document.querySelector("input[name='full_name']").value = data.full_name;
    document.querySelector("input[name='email']").value = data.email;
    document.querySelector("img.profile_image").src = data.profile_picture;
}

document.querySelector(".profile-update-modal").addEventListener("click", ()=> {
    let modalId = 'profileModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    let formEvent = null;
    formEvent = (event) => updateProfile(event);
    form.addEventListener("submit", formEvent);
    insert_profile_data(profile_data);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });
    });
    document.querySelector(`.${modalId}`).click();
})

async function updateProfile(event){
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');

    let profile_image = form.querySelector("input[name='profile_picture']");
    if (profile_image.files.length == 0 ) {
        formData.delete("profile_picture");
    }  

    if (!data.full_name || data.full_name.trim().length == 0){
        errorMsg.innerText = 'Please enter name.'; 
        errorMsg.classList.add('active');
        return false;
    }
    if (!data.email || !emailRegex.test(data.email.trim())){
        errorMsg.innerText = 'Please enter email.'; 
        errorMsg.classList.add('active');
        return false;
    }

    if (!data.password) {
        formData.delete("password");
        formData.delete("confirm_password");
    }
    else{
        let passwordErrors = validatePassword(data.password, data.confirm_password);
        if (passwordErrors.length > 0) {
            errorMsg.innerText = passwordErrors.join("\n");
            errorMsg.classList.add("active");
            return false;
        }
    }

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI(`/api/profile/`, formData, headers, 'PATCH');
        response.json().then(function(res) {
            if (response.status == 200) {
                profile_data = res;
                afterLoad(button, 'Updated');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
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