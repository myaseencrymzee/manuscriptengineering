const CONTENT_API_URL = JSON.parse(document.getElementById("CONTENT_API_URL").textContent)

const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const phoneRegex = /^\+[0-9]{10,}$/;
const locationRegex = /POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/;


function togglePasswordField(event, icon) {
    let passwordField = icon.closest('.password-input-div').querySelector('input[data-type="password"]');
    if (icon.classList.contains('hide-password-icon') && passwordField.type == 'password') {
        passwordField.type = 'text';
        icon.classList.add('hide');
        icon.closest('.password-input-div').querySelector('.show-password-icon').classList.remove('hide');
    }
    else if (icon.classList.contains('show-password-icon') && passwordField.type == 'text') {
        passwordField.type = 'password';
        icon.classList.add('hide');
        icon.closest('.password-input-div').querySelector('.hide-password-icon').classList.remove('hide');
    }
}


function toggleModal(_old, _new, backBtn=null) {
    let old_modal = document.querySelector(`#${_old}`);
    let new_modal = document.querySelector(`#${_new}`);
    // let backSvg = document.querySelector(".back-svg");

    if (old_modal.classList.contains('hide')) {
        old_modal.classList.remove('hide');
        new_modal.classList.add('hide');
        // backSvg.classList.add('hide');
    } else {
        old_modal.classList.add('hide');
        new_modal.classList.remove('hide');
        // backSvg.classList.remove('hide');
    }
    if (backBtn != null) {
        document.querySelector(`.${_new}`).querySelectorAll("input").forEach((input) => {
            console.log("lll",input);
            input.value = null;
            if (input.classList.contains("filled-input")){
                input.classList.remove("filled-input");
            }
        })
    }
}


async function requestAPI(url, data, headers, method) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: method,
        mode: 'cors',
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: headers,
        body: data,
    });
    return response; // parses JSON response into native JavaScript objects
}


function formDataToObject(formData) {
    let getData = {}
    formData.forEach(function(value, key) {
        getData[key] = value;
    });
    return getData
}


function beforeLoad(button) {
    button.querySelector('.btn-text').innerText = '';
    button.querySelector('.spinner-border').classList.remove('hide');
    button.disabled = true;
    button.style.cursor ='not-allowed';
}


function afterLoad(button, text) {
    button.querySelector('.btn-text').innerText = text;
    button.querySelector('span').classList.add('hide');
    button.disabled = false;
    button.style.cursor ='pointer';
}


function displayMessages(obj, errorElement) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (Array.isArray(obj[key])) {
                // If it's an array, iterate through its elements
                obj[key].forEach(element => {
                    if (typeof element === 'object') {
                        // If an element is an object, recursively call the function
                        displayMessages(element, errorElement);
                    } else {
                        // If it's not an object, append the key and message in the same line
                        errorElement.innerHTML += `${key}: ${element} <br />`;
                    }
                });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                // If it's an object, recursively call the function
                displayMessages(obj[key], errorElement);
            } else {
                // If it's neither an array nor an object, append the key and value in the same line
                errorElement.innerHTML += `${obj[key]} <br />`;
            }
        }
    }
}



function closeCurrentModal() {
    let currentModal = document.querySelector('.modal.show'); // Get the currently open modal
    if (currentModal) {
        let bootstrapModal = bootstrap.Modal.getInstance(currentModal); // Get the Bootstrap modal instance
        bootstrapModal.hide(); // Hide the current modal
    }
}


// async function logout() {
//     let headers = {
//         "X-CSRFToken": getCookie('csrftoken'),
//     };

//     let response = await requestAPI(`/api/logout/`, null, headers, 'POST');
//     response.json().then(function(res) {
//         if(response.ok) {
//             location.pathname = '/admin-login/'
//         }
//     });
// }


async function logoutForm(event, role='admin') {
    event.preventDefault();
    let form = event.target;
    let errorMsg = form.querySelector('.input-error-msg');
    let button = document.querySelector('button[data-type="logout"]');
    let buttonText = button.querySelector(".btn-text").textContent;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    try {
        errorMsg.innerText = '';
        errorMsg.classList.remove('active');
        let headers = {
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };

        beforeLoad(button);
        let id = parseInt(data.id)
        let response = await requestAPI(`/api/logout/`, null, headers, 'POST');
        response.json().then(function(res) {
            if (response.ok) {
                // let logoutText = location.pathname.includes("administration") ? "Logged Out" : i18n.messageStore.messages[currentLang]['global-logged-out'];
                afterLoad(button,'Logged Out');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    closeCurrentModal();
                    location.href = location.origin + `${role == 'user' ? '/' : '/admin-login/' }`
                    // location.pathname = '/admin-login/';
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


function getCookie(name) {
    if(name === 'access'){
        name = 'user_access_token'
    }else if(name === 'refresh'){
        name = 'user_refresh_token'
    }else{
        name=name
    }
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}


function setParams(params, key, value) {
    let paramsList = params.split('&');
    // Create an object to store the parameters and their values
    let paramsObject = {};
    paramsList.forEach(param => {    
        let [key, value] = param.split('=');
        paramsObject[key] = value;
    });

    // Update the value for the key parameter
    paramsObject[key] = value;

    // Reconstruct the updated query string
    let updatedParams = Object.entries(paramsObject).map(([key, value]) => `${key}=${value}`).join('&');
    return updatedParams;
}


function capitalizeFirstLetter(string) {
    const words = string.split(/[_\s]+/);
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    const resultString = capitalizedWords.join(' ');

    return resultString;
}

// Utility function for phone validation using libphonenumber-js
function isValidPhoneNumber(phoneNumber) {
    try {
        const parsedNumber = libphonenumber.parsePhoneNumber(phoneNumber, 'US');
        return parsedNumber.isValid();
    } catch (error) {
        return false;
    }
}


async function subscribeForm(event, type='footer') {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    let button = form.querySelector('button[type="submit"]');
    let btnText = button.querySelector('.btn-text').textContent;
    let errorMsg = document.querySelector(`.${type}-error-msg`);
    if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
        return false;
    }

    data.topic = "all";

    try {
      errorMsg.innerHTML = "";
      errorMsg.classList.remove("active");
      beforeLoad(button);
      let response = await fetch("/api/subscribe/", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": data.csrfmiddlewaretoken,
          },
          body: JSON.stringify(data),
      });
  
      let result = await response.json();
  
      if (response.status == 201) {
        document.querySelector(".subscriptionModal").click();
          afterLoad(button, 'Subscribed')
          button.disabled = true;
          setTimeout(() => {
              button.disabled = false;
              afterLoad(button, btnText);
          }, 1500)
          form.reset();
        //   location.reload()
      } else {
          afterLoad(button, btnText);
          console.log(result)
          displayMessages(result, errorMsg);
          errorMsg.classList.add("active");
      }
  } catch (error) {
      afterLoad(button, btnText);
      console.error("Error:", error);
      errorMsg.innerHTML = "Something went wrong. Please try again.";
      errorMsg.classList.add("active");
  }
  }
  
 
function validatePassword(password, confirmPassword) {
    const errorMessages = [];

    if (!password) {
        errorMessages.push("Please enter a password.");
    } else {
        if (!/[!@#$%^&*(),.?_":{}|<>]/.test(password)) {
            errorMessages.push("Password must contain at least one special symbol.");
        }
        if (!/[a-z]/.test(password)) {
            errorMessages.push("Password must contain at least one lowercase letter.");
        }
        if (!/[A-Z]/.test(password)) {
            errorMessages.push("Password must contain at least one uppercase letter.");
        }
        if (!/[0-9]/.test(password)) {
            errorMessages.push("Password must contain at least one number.");
        }
        if (password.length < 8) { // Assuming minimum length is 8
            errorMessages.push("Password must be at least 8 characters long.");
        }
    }

    if (confirmPassword !== password) {
        errorMessages.push("Confirm Password must match Password.");
    }

    return errorMessages;
}



function showToast(title, body, className) {
    
    // Use the container as the node option
    Toastify({
        // node: toastContent,
        text: body,
        duration: 5000, // 5 seconds
        close: true,
        gravity: "top", // top or bottom
        position: "right", // left, center or right
        className: className,
        stopOnFocus: true, // Prevents dismissing of toast on hover
    }).showToast();
}


let common_popup_endpoint = '/api/subscriber/popup?perPage=1';

async function get_popup_data(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                console.log(res);
                renderPopupData(res);
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


function renderPopupData(res){
    var myModal = document.getElementById('autoModal');
    let title = myModal.querySelector("#title");
    let description = myModal.querySelector("#message");
    let image = myModal.querySelector("#magnet_img");


    title.innerText = res[0]?.title || "Want Daily updated from me?";
    description.innerText = res[0]?.message || "Join my inner circle. Get exclusive resources, early access to new books, and special offers.";
    image.src = res[0]?.lead_magnet_image;   
}   


if (shouldShowSubscribeModal) {
    setTimeout(function() {
        var myModal = new bootstrap.Modal(document.getElementById('autoModal'));
        get_popup_data(common_popup_endpoint)
        myModal.show();
    }, 15000);
}
