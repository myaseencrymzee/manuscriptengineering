let admin_login_form = document.getElementById("userVerifyEmail");

admin_login_form.addEventListener("submit", verifyUserEmail);

async function verifyUserEmail(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');
    
    if (!data.email || !emailRegex.test((data.email).trim())) {
        errorMsg.innerText = 'Please enter a valid email address';
        errorMsg.classList.add('active');
        return false;
    }   
    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        
        data.otp_type = "create";
        
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };

        beforeLoad(button);
        let response = await requestAPI('/api/otp/send', JSON.stringify(data), headers, 'POST');
        response.json().then(function(res) {
            if (response.status == 201) {
                afterLoad(button, 'Sent');
                button.disabled = true;
                localStorage.setItem('email', data.email);
                localStorage.removeItem("otp_type");
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    location.pathname = "/user-verify-otp/";

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
