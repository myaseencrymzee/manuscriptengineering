document.addEventListener("DOMContentLoaded", ()=> {

    let admin_login_form = document.getElementById("resetPasswordForm");
    admin_login_form.addEventListener("submit", async (event) => {
        event.preventDefault();
        let form = event.target;
        let formData = new FormData(form);
        let data = formDataToObject(formData);
        
        let button = form.querySelector("button[type='submit']")
        let buttonText = button.querySelector(".btn-text").textContent;
        let errorMsg = form.querySelector('.input-error-msg');
        errorMsg.innerText = ''; 
        errorMsg.classList.remove('active');
    
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
                "Content-Type": "application/json",
                "X-CSRFToken": data.csrfmiddlewaretoken,
            };
            data['verification_token'] = localStorage.getItem('verification_token');
            beforeLoad(button);
            let response = await requestAPI('/api/password/reset', JSON.stringify(data), headers, 'PATCH');
            response.json().then(function(res) {
                if (response.status == 200) {
                    afterLoad(button, 'Updated');
                    button.disabled = true;
                    setTimeout(() => {
                        button.disabled = false;
                        afterLoad(button, buttonText);
                        localStorage.removeItem("verification_token");
                        localStorage.removeItem("email");
                        location.pathname = "/admin-login/"
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
    });    
})
