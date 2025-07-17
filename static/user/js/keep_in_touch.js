const RECAPTCHA_SITE_KEY = JSON.parse(document.getElementById("RECAPTCHA_SITE_KEY").textContent)

// async function keepInTouchForm(event) {
//     event.preventDefault();
//     let form = event.target;
//     let formData = new FormData(form);
//     let data = formDataToObject(formData);
//     let button = form.querySelector('button[type="submit"]');
//     let btnText = button.querySelector('.btn-text').textContent;
//     console.log(data);

    

//     let error_message = form.querySelector(".input-error-msg");
//     error_message.innerHTML = "";
//     error_message.classList.remove("active");

//     // Validations (already implemented)
//     if (data.name.trim() == "") 
//         {
//         error_message.innerHTML = "Please enter your name.";
//         error_message.classList.add("active");
//         return false;
//     }

//     if (!/^[a-zA-Z\s]+$/.test(data.name.trim())) {
//         error_message.innerHTML = 'Please enter a valid name (letters and spaces only).';
//         error_message.classList.add("active");
//         return false;
//     }

//     if (data.email.trim() == "") {
//         error_message.innerHTML = "Please enter your email";
//         error_message.classList.add("active");
//         return false;
//     }

//     if (!emailRegex.test(data.email)) {
//         error_message.innerHTML = "Please enter a valid email address.";
//         error_message.classList.add("active");
//         return false;
//     }

//     if (data.phone_number.trim()) {
//         try {
//             if (!isValidPhoneNumber(data.phone_number.trim())) {
//                 error_message.innerHTML = 'Please enter a valid phone number with country code.';
//                 error_message.classList.add("active");
//                 return false;
//             }
//         } catch (error) {
//             error_message.innerHTML = 'Please enter a valid phone number with country code.';
//             error_message.classList.add("active");
//             return false;
//         }
//     } else {
//         error_message.innerHTML = 'Please enter a phone number.';
//         error_message.classList.add("active");
//         return false;
//     }

//     if (!data.message.trim()) {
//         error_message.innerHTML = 'Message cannot be empty.';
//         error_message.classList.add("active");
//         return false;
//     }

//     // If all validations pass, send data to API
//     try {
//         error_message.innerHTML = "";
//         error_message.classList.remove("active");
//         beforeLoad(button);
//         let response = await fetch("/api/contact/", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-CSRFToken": data.csrfmiddlewaretoken,
//             },
//             body: JSON.stringify(data),
//         });

//         let result = await response.json();

//         if (response.status == 200) {
//             afterLoad(button, 'Sent')
//             button.disabled = true;
//             setTimeout(() => {
//                 button.disabled = false;
//                 afterLoad(button, btnText);
//             }, 1500)
//             form.reset();
//         } else {
//             afterLoad(button, btnText);
//             error_message.innerHTML = result.message || "Failed to send message. Please try again.";
//             error_message.classList.add("active");
//         }
//     } catch (error) {
//         afterLoad(button, btnText);
//         console.error("Error:", error);
//         error_message.innerHTML = "Something went wrong. Please try again.";
//         error_message.classList.add("active");
//     }
// }







async function keepInTouchForm(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let button = form.querySelector('button[type="submit"]');
    let btnText = button.querySelector('.btn-text').textContent;
    let subscribeCheckbox = form.querySelector("#subscribeCheckbox"); // Add ID to checkbox in HTML
    let error_message = form.querySelector(".input-error-msg");

    error_message.innerHTML = "";
    error_message.classList.remove("active");

    // Validations
    if (data.name.trim() == "") {
        error_message.innerHTML = "Please enter your name.";
        error_message.classList.add("active");
        return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(data.name.trim())) {
        error_message.innerHTML = "Please enter a valid name (letters and spaces only).";
        error_message.classList.add("active");
        return false;
    }

    if (data.email.trim() == "") {
        error_message.innerHTML = "Please enter your email";
        error_message.classList.add("active");
        return false;
    }

    if (!emailRegex.test(data.email)) {
        error_message.innerHTML = "Please enter a valid email address.";
        error_message.classList.add("active");
        return false;
    }

    if (data.phone_number.trim()) {
        try {
            if (!isValidPhoneNumber(data.phone_number.trim())) {
                error_message.innerHTML = "Please enter a valid phone number with country code.";
                error_message.classList.add("active");
                return false;
            }
        } catch (error) {
            error_message.innerHTML = "Please enter a valid phone number with country code.";
            error_message.classList.add("active");
            return false;
        }
    } else {
        error_message.innerHTML = "Please enter a phone number.";
        error_message.classList.add("active");
        return false;
    }

    if (!data.message.trim()) {
        error_message.innerHTML = "Message cannot be empty.";
        error_message.classList.add("active");
        return false;
    }

    try {
        // Sending Contact Form API request
        grecaptcha.ready(function() {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'submit'}).then(async function(token) {
                beforeLoad(button);
                data.recaptcha_token = token
                let contactResponse = await fetch("/api/contact/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": data.csrfmiddlewaretoken,
                    },
                    body: JSON.stringify(data),
                });

                let contactResult = await contactResponse.json();

                if (contactResponse.status === 200) {
                    afterLoad(button, "Sent");
                    button.disabled = true;
                    setTimeout(() => {
                        button.disabled = false;
                        afterLoad(button, btnText);
                    }, 1500);
                
                } else {
                    afterLoad(button, btnText);
                    displayMessages(contactResult.messages, error_message);
                    error_message.classList.add("active");
                }

                // If the user checked the subscription checkbox, call the subscribe API
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

            });
          });
        
    form.reset();

    } catch (error) {
        afterLoad(button, btnText);
        console.error("Error:", error);
        error_message.innerHTML = "Something went wrong. Please try again.";
        error_message.classList.add("active");
    }
}







function isValidPhoneNumber(phoneNumber) {
    try {
        const parsedNumber = libphonenumber.parsePhoneNumber(phoneNumber, 'US');
        return parsedNumber.isValid();
    } catch (error) {
        return false;
    }
}