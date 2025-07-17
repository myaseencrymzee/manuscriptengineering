let user_signup_form = document.getElementById("userSignupForm");
let emailInputField = document.getElementById('email');
let profileImageInput = document.getElementById("profile-upload");

emailInputField.value = localStorage.getItem('email');
user_signup_form.addEventListener("submit", signupUser);



profileImageInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            document.getElementById("profile-img").src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});


function showSuccessModal() {
    let successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
}


async function signupUser(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let button = form.querySelector("button[type='submit']");
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');

    errorMsg.innerText = '';
    errorMsg.classList.remove('active');

    if (!data.full_name || data.full_name.trim() === '') {
        errorMsg.innerText = 'Full name is required';
        errorMsg.classList.add('active');
        return false;
    }
    if (!data.email || !emailRegex.test(data.email.trim())) {
        errorMsg.innerText = 'Please enter a valid email address';
        errorMsg.classList.add('active');
        return false;
    }
    if (!data.password || data.password.length < 8) {
        errorMsg.innerText = 'Password must be at least 8 characters long';
        errorMsg.classList.add('active');
        return false;
    }
    if (data.password !== data.confirm_password) {
        errorMsg.innerText = 'Passwords do not match';
        errorMsg.classList.add('active');
        return false;
    }

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');

        formData.append("otp_type", 'create');
        formData.delete("profile_picture");
        if (profileImageInput.files.length > 0)
            formData.append("profile_picture", profileImageInput.files[0]);

        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };

        beforeLoad(button);
        let response = await requestAPI('/api/signup/', formData, headers, 'POST');

        response.json().then(function (res) {
            if (response.status === 201) {
                afterLoad(button, 'Signed Up');
                button.disabled = true;
                localStorage.removeItem('email');
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    showSuccessModal();
                }, 1500);
            } else {
                afterLoad(button, buttonText);
                errorMsg.classList.add("active");
                displayMessages(res, errorMsg);
                return;
            }
        });
    } catch (err) {
        console.log(err);
    }
}
