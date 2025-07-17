


document.addEventListener("DOMContentLoaded", () => {
    
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

    let otp_verification_form = document.getElementById("OTPVerificatioinForm");
    otp_verification_form.addEventListener("submit", async (event)=>{
        event.preventDefault();
        let form = event.target;
        let errorMsg = form.querySelector('.input-error-msg');
        let button = form.querySelector('button[type="submit"]');
        let buttonText = button.querySelector(".btn-text").textContent;
        let formData = new FormData(form);
        let data = formDataToObject(formData);

        let code = parseInt(data.digit1 + data.digit2 + data.digit3 + data.digit4 + data.digit5 + data.digit6);
        data['email'] = localStorage.getItem("email")
        data['otp_type'] = 'forgot'
        data['otp_code'] = code
        if (data.digit1.trim().length == 0 || data.digit2.trim().length == 0 || data.digit3.trim().length == 0 || data.digit4.trim().length == 0 || data.digit5.trim().length == 0 || data.digit6.trim().length == 0 ) {
            errorMsg.innerText = 'Please enter a valid verification code.';
            errorMsg.classList.add('active');
            return false;
        } else {
            try {
                errorMsg.innerText = '';
                errorMsg.classList.remove('active');
                let headers = {
                    "Content-Type": "application/json",
                    "X-CSRFToken": data.csrfmiddlewaretoken,
                };
        
                beforeLoad(button);
                let response = await requestAPI('/api/otp/verify', JSON.stringify(data), headers, 'PATCH');
                response.json().then(function(res) {
                    if (response.status == 200) {
                        afterLoad(button, 'Verified');
                        button.disabled = true;
                        setTimeout(() => {
                            button.disabled = false;
                            afterLoad(button, buttonText);
                            localStorage.setItem("verification_token", res.verification_token);
                            location.pathname = "/admin-reset-password/";
                        }, 1500)
                    }
                    else {
                        afterLoad(button, buttonText);
                        errorMsg.classList.add("active");
                        displayMessages(res, errorMsg);
                        form.reset();
                        form.querySelectorAll("input[data-name='input-otp']").forEach((input) =>{
                            input.classList.remove("filled-input")
                            input.value= null;
                        })
                        form.querySelectorAll("input[data-name='input-otp']")[0].focus();
                        return;
                    }
                })
            }
            catch (err) {
                console.log(err);
            }
        }
    })

    let resend_otp_button = document.getElementById("resendOTPButton");
    if (!resend_otp_button) return;
    resend_otp_button.addEventListener("click", async (event) => {
        event.preventDefault();
        let button = event.currentTarget;
        let form = button.closest("form");

        if (!form) return;

        let errorMsg = form.querySelector(".input-error-msg");
        let resendText = form.querySelector("._resend");
        let resendLoader = form.querySelector("._resend-loader");

        let email = localStorage.getItem("email");
        if (!email) {
            errorMsg.innerText = "No email found in local storage. Please enter your email.";
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
            otp_type: "forgot",
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
    });

});
