let user_login_form = document.getElementById("userLoginForm");
user_login_form.addEventListener("submit", userSignin)

async function userSignin(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.querySelector("button[type='submit']")
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');

    if (!data.email || !emailRegex.test(String(data.email).trim())) {
        errorMsg.innerText = 'Please enter a valid email address';
        errorMsg.classList.add('active');
        return false;
    }
    else if (!data.password || data.password.trim().length === 0) {
        errorMsg.innerText = 'Please enter a password';
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
        let response = await requestAPI('/api/login/', JSON.stringify(data), headers, 'POST');
        response.json().then(function(res) {
            if (response.status == 200) {
                afterLoad(button, 'Logged in');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    let queryParams = new URLSearchParams(window.location.search);
                    if (queryParams.has('next'))
                        location.href = queryParams.get('next');
                    else
                        location.pathname = "/"
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



