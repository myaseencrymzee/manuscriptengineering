const RECAPTCHA_SITE_KEY = JSON.parse(document.getElementById("RECAPTCHA_SITE_KEY").textContent)
let selectedSessionType = null;

function selectType(type, text){
    document.querySelector("input[name='session']").value = text;
    selectedSessionType = type;
}


async function bookNowForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let button = form.querySelector('button[type="submit"]');
    let btnText = button.querySelector('.btn-text').textContent;
    let subscribeCheckbox = form.querySelector("#subscribeCheckbox");
    let error_message = form.querySelector(".input-error-msg");
    error_message.innerHTML = "";
    error_message.classList.remove("active");

    if (data.full_name.trim() === "") {
        error_message.innerHTML = "Please enter your first name.";
        error_message.classList.add("active");
        return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(data.full_name.trim())) {
        error_message.innerHTML = 'Please enter a valid first name (letters and spaces only).';
        error_message.classList.add("active");
        return false;
    }

    // if (data.last_name.trim() === "") {
    //     error_message.innerHTML = "Please enter your last name.";
    //     error_message.classList.add("active");
    //     return false;
    // }

    // if (!/^[a-zA-Z\s]+$/.test(data.last_name.trim())) {
    //     error_message.innerHTML = 'Please enter a valid last name (letters and spaces only).';
    //     error_message.classList.add("active");
    //     return false;
    // }

    if (data.phone_number.trim()) {
        try {
            if (!isValidPhoneNumber(data.phone_number.trim())) {
                error_message.innerHTML = 'Please enter a valid phone number with country code.';
                error_message.classList.add("active");
                return false;
            }
        } catch (error) {
            error_message.innerHTML = 'Please enter a valid phone number with country code.';
            error_message.classList.add("active");
            return false;
        }
    } else {
        error_message.innerHTML = 'Please enter a phone number.';
        error_message.classList.add("active");
        return false;
    }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
        error_message.innerHTML = 'Please enter a valid email address.';
        error_message.classList.add("active");
        return false;
    }

    const inputDate = new Date(data.date_time.trim());
    const currentDate = new Date();
    if (!data.date_time.trim() || isNaN(inputDate.getTime()) || inputDate < currentDate) {
        error_message.innerHTML = 'Please enter a valid future date and time.';
        error_message.classList.add("active");
        return false;
    }

    if (!data.session) {
        error_message.innerHTML = 'Please select a session type.';
        error_message.classList.add("active");
        return false;
    }

    // Message Validation
    if (!data.message.trim()) {
        error_message.innerHTML = 'Message cannot be empty.';
        error_message.classList.add("active");
        return false;
    }

    // If all validations pass, send data to API
    try {
        error_message.innerHTML = "";
        error_message.classList.remove("active");
        grecaptcha.ready(function() {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'submit'}).then(async function(token) {
                beforeLoad(button);
                data.recaptcha_token = token
                let response = await fetch("/api/book-session/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": data.csrfmiddlewaretoken,
                    },
                    body: JSON.stringify(data),
                });

                let result = await response.json();

                if (response.status === 200) {
                    afterLoad(button, 'Sent')
                    button.disabled = true;
                    setTimeout(() => {
                        button.disabled = false;
                        afterLoad(button, btnText);
                    }, 1500)
                
                } else {
                    afterLoad(button, btnText);
                    displayMessages(result.message, error_message);
                    // error_message.innerHTML = result.error || "Something went wrong. Please try again.";
                    error_message.classList.add("active");
                }

                if (subscribeCheckbox.checked) {
                    console.log('here')
                    let subscribeData = {
                        email: data.email,
                        name: data.name,
                        topic: "all",
                        csrfmiddlewaretoken: data.csrfmiddlewaretoken,
                    };

                    let subscribeResponse = await fetch("/api/subscribe/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": data.csrfmiddlewaretoken,
                        },
                        body: JSON.stringify(subscribeData),
                    });

                    let subscribeResult = await subscribeResponse.json();

                    if (subscribeResponse.status === 201) {
                        console.log("Subscription successful:", subscribeResult);
                    } else {
                        console.log("Subscription failed:", subscribeResult);
                    }
                
                }
                form.reset();
            });
          });
       

    } catch (error) {
        afterLoad(button, btnText);
        console.error("Error submitting booking request:", error);
        error_message.innerHTML = "An error occurred. Please try again later.";
        error_message.classList.add("active");
    }
}





flatpickr("#datetimepicker", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    disableMobile: true
});

// document.getElementById('datetimepicker').addEventListener("change", (event)=> event.target.type = 'text');