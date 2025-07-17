const forgotinputs = document.querySelectorAll(".otp-input");
forgotinputs.forEach((input) => addListener(input))
function addListener(input) {
    input.addEventListener("keyup", function(event) {
        const code = parseInt(input.value);
        if (code >= 0 && code <= 9) {
            const n = input.nextElementSibling;
            if (n) {
                n.focus();
                input.classList.add('filled-input');
            } else if (!n && input.getAttribute('data-position') == 'last') {
                input.classList.add('filled-input');
            }
        } else {
            input.value = "";
        }

        const key = event.key;
        if (key === "Backspace" || key === "Delete") {
            const prev = input.previousElementSibling;
            if (prev && input.getAttribute('data-position') == 'last') {
                input.classList.remove('filled-input');
            }
            if (prev) {
                prev.focus();
                prev.classList.remove('filled-input');
            }
        }
    });

    input.addEventListener("blur", () => {
        if (input.value.trim() == '') {
            input.classList.remove('filled-input');
        }
    });

    // Add paste event listener
    input.addEventListener("paste", (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        const inputsElements = forgotinputs;

        // Distribute pasted data across the input fields
        pasteData.split('').forEach((char, index) => {
            if (inputsElements[index]) {
                inputsElements[index].value = char;
                inputsElements[index].classList.add('filled-input');
            }
        });

        // Focus the last input field
        inputsElements[inputsElements.length - 1].focus();
    });
}













let profileImageInput = document.getElementById("profile-upload");
profileImageInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            document.getElementById("profile-img").src = reader.result;
            updateProfilePic(file);
        };

        reader.readAsDataURL(file);
    }
});

async function updateProfilePic(file) {
    let form = document.querySelector("#profileUpdateForm");
    let formData = new FormData(form);
    let csrfmiddlewaretoken = form.querySelector("input[name='csrfmiddlewaretoken']").value
    console.log(csrfmiddlewaretoken);
    
    formData.append('profile_picture', file);
    try {
        
        let headers = {
            "X-CSRFToken": csrfmiddlewaretoken,
        };
        let response = await requestAPI(`/api/user/profile/`, formData, headers, 'PATCH');
        response.json().then(function(res) {
            console.log(res);
            if (response.status == 200) {
                location.reload()
            }
        })
    }
    catch (err) {
        console.log(err);
    }

}


function openUpdatePasswordModa() {
    let modal = document.querySelector("#profileModal");
    let form = modal.querySelector("form");
    let formEvent = null;
    form.querySelector("div[data-type='email']").classList.add('hide');
    form.querySelector("div[data-type='fullName']").classList.add('hide');
    modal.querySelector('#heading').innerText = 'Update Password'
    modal.querySelector('#sub-heading').innerText = 'Please set your new Password here.'
    formEvent = (event) => updatePassword(event);
    form.addEventListener("submit", formEvent);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });
    });
    document.querySelector(`.profileModal`).click();
}


async function updatePassword(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');

    if (!data.current_password || data.current_password.trim().length == 0){
        errorMsg.innerText = 'Please enter your current password.'; 
        errorMsg.classList.add('active');
        return false;
    }
    
    let passwordErrors = validatePassword(data.password, data.confirm_password);
    if (passwordErrors.length > 0) {
        errorMsg.innerText = passwordErrors.join("\n");
        errorMsg.classList.add("active");
        return false;
    }
    
    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI(`/api/user/profile/`, formData, headers, 'PATCH');
        response.json().then(function(res) {
            if (response.status == 200) {
                profile_data = res;
                afterLoad(button, 'Updated');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    closeCurrentModal();
                    location.reload();
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


function openUpdateEmailModal(email) {
    let modal = document.querySelector("#profileModal");
    let form = modal.querySelector("form");
    let formEvent = null;
    formEvent = (event) => updateEmail(event);
    form.addEventListener("submit", formEvent);
    form.querySelector("div[data-type='email']").classList.remove('hide');
    form.querySelector("div[data-type='fullName']").classList.add('hide');
    form.querySelectorAll("div[data-type='password']").forEach(div => div.classList.add('hide'));
    modal.querySelector('#heading').innerText = 'Update Email'
    modal.querySelector('#sub-heading').innerText = 'Please set your new Email here.'
    form.querySelector("input[name='email']").value = email;
    form.querySelector("input[name='email']").setAttribute('data-email', email);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        form.querySelectorAll("div[data-type='password']").forEach(div => div.classList.remove('hide'));
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });
    });
    document.querySelector(`.profileModal`).click();
}

async function updateEmail(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');

    if (!data.email || !emailRegex.test(data.email.trim())){
        errorMsg.innerText = 'Please enter email.'; 
        errorMsg.classList.add('active');
        return false;
    }
    

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI(`/api/otp/send`, JSON.stringify({"email": data.email, "otp_type": "update"}), headers, 'POST');
        response.json().then(function(res) {
            if (response.status == 201) {
                // profile_data = res;
                afterLoad(button, 'sent');
                button.disabled = true;
                window.pendingEmailUpdate = data.email;
                showOTPModal();
                
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    closeCurrentModal()
                    // location.reload()
                    
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
function showOTPModal() {
    let otpModalElement = document.getElementById('otpVerificationModal');
    let otpModal = bootstrap.Modal.getOrCreateInstance(otpModalElement);
    otpModal.show();
}


async function OTPverification(event) {
    event.preventDefault();
    let form = event.target;
    let errorMsg = form.querySelector('.input-error-msg');
    let button = form.querySelector('button[type="submit"]');
    let buttonText = button.querySelector(".btn-text").textContent;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let code = parseInt(data.digit1 + data.digit2 + data.digit3 + data.digit4 + data.digit5 + data.digit6);
    let email = window.pendingEmailUpdate; 
    let otpType = 'update';

    if (!email) {
        errorMsg.innerText = 'Something went wrong! Please try again.';
        errorMsg.classList.add('active');
        return;
    }

    data['email'] = email;
    data['otp_type'] = otpType;
    data['otp_code'] = code;
    if (data.digit1.trim().length == 0 || data.digit2.trim().length == 0 || data.digit3.trim().length == 0 || data.digit4.trim().length == 0 || data.digit5.trim().length == 0 || data.digit6.trim().length == 0 ) {
        errorMsg.innerText = 'Please enter a valid verification code.';
        errorMsg.classList.add('active');
        return false;
    }

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');

        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };

        beforeLoad(button);

        let response = await requestAPI('/api/otp/verify', JSON.stringify({"email": data.email, "otp_type": "update", "otp_code": code}), headers, 'PATCH');

        response.json().then(async function(res) {
            if (response.status === 200) {
                afterLoad(button, 'Verified');
                button.disabled = true;

                localStorage.setItem("verification_token", res.verification_token);

                let updateResponse = await requestAPI('/api/user/profile/', JSON.stringify({ "email": email }), headers, 'PATCH');

                updateResponse.json().then(function(updateRes) {
                    if (updateResponse.status === 200) {

                        afterLoad(button, buttonText);
                        setTimeout(() => {
                            button.disabled = false;
                            location.reload();
                        }, 1500);
                    } else {

                        afterLoad(button, buttonText);
                        errorMsg.classList.add("active");
                        errorMsg.innerText = updateRes.message || "Failed to update email.";
                    }
                });
            } else {
                afterLoad(button, buttonText);
                errorMsg.classList.add("active");
                displayMessages(res, errorMsg);
                form.reset();
                form.querySelectorAll("input[data-name='input-otp']").forEach((input) => {
                    input.classList.remove("filled-input");
                    input.value = null;
                });
                form.querySelectorAll("input[data-name='input-otp']")[0].focus();
            }
        });
    } catch (err) {
        console.log(err);
    }
}


let resend_otp_button = document.getElementById("resendOTPButton");

async function resendOTP(event) {
    event.preventDefault();
    let button = event.currentTarget;
    let form = button.closest("form");
    if (!form) return;

    let errorMsg = form.querySelector(".input-error-msg");
    let resendText = form.querySelector("._resend");
    let resendLoader = form.querySelector("._resend-loader");

    // let email = localStorage.getItem("email");
    let email = window.pendingEmailUpdate; 
    if (!email) {
        errorMsg.innerText = "Something went wrong! Please try again.";
        errorMsg.classList.add("active");
        return;
    }
    let csrfTokenInput = form.querySelector('input[name="csrfmiddlewaretoken"]');
    if (!csrfTokenInput) {
        errorMsg.innerText = "CSRF token missing. Please refresh and try again.";
        errorMsg.classList.add("active");
        return;
    }
    let csrfToken = csrfTokenInput.value;
    let data = {
        email: email,
        otp_type: 'update',
    };

    let headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
    };
    try {
        button.disabled = true;
        resendText.classList.add("hide");
        resendLoader.classList.remove("hide");
        
        let response = await requestAPI("/api/otp/send", JSON.stringify(data), headers, "POST");
        let res = await response.json();

        button.disabled = false;
        resendText.classList.remove("hide");
        resendLoader.classList.add("hide");
        if (response.status == 201) {
            resendText.innerText = "OTP Sent";
            errorMsg.classList.remove("active");
            setTimeout(() => {
                resendText.innerText = "Resend OTP";
            }, 1500);
        } else {
            errorMsg.classList.add("active");
            form.reset();
            displayMessages(res, errorMsg);
        }
    } catch (err) {
        console.error("Error sending OTP:", err);
        button.disabled = false;
        resendText.classList.remove("hide");
        resendLoader.classList.add("hide");

        errorMsg.innerText = "An error occurred. Please try again.";
        errorMsg.classList.add("active");
    }
}
if (resend_otp_button) {
    resend_otp_button.addEventListener("click", resendOTP);
}




// update name

function openUpdateNameModal(name) {
    let modal = document.querySelector("#profileModal");
    let form = modal.querySelector("form");
    let formEvent = null;
    formEvent = (event) => updateName(event);
    form.addEventListener("submit", formEvent);
    form.querySelector("div[data-type='email']").classList.add('hide');
    form.querySelector("div[data-type='fullName']").classList.remove('hide');
    form.querySelectorAll("div[data-type='password']").forEach(div => div.classList.add('hide'));
    modal.querySelector('#heading').innerText = 'Update Name'
    modal.querySelector('#sub-heading').innerText = 'Please set your new Name here.'
    form.querySelector("input[name='full_name']").value = name;

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        form.querySelectorAll("div[data-type='password']").forEach(div => div.classList.remove('hide'));
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });
    });
    document.querySelector(`.profileModal`).click();
}

async function updateName(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');

    if (!data.full_name || data.full_name.trim().length == 0){
            errorMsg.innerText = 'Please enter your name.'; 
            errorMsg.classList.add('active');
            return false;
        }

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI(`/api/user/profile/`, JSON.stringify({"full_name": data.full_name}), headers, 'PATCH');
        response.json().then(function(res) {
            if (response.status == 200) {
                profile_data = res;
                afterLoad(button, 'Updated');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    closeCurrentModal()
                    location.reload()
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