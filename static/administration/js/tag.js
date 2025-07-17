let tags_data = [];
let tag_endpoint = "/api/tag?perPage=1000";

// Load tags when the page loads
window.addEventListener("load", () => get_tags(tag_endpoint));

// Fetch tags from the API
async function get_tags(endpoint) {
    try {
        let response = await requestAPI(endpoint, null, getHeaders(), 'GET');
        let res = await response.json();

        if (response.status === 200) {
            render_tags_data(res);
        } else {
            console.error(res);
            return false;
        }
    } catch (err) {
        console.error(err);
    }
}

// Render tags in the container
function render_tags_data(data) {
    let container = document.querySelector(".tags-container");
    container.innerHTML = '';
    if (data.length > 0) {
        data.forEach(tag => {
            container.appendChild(createTag(tag));
        });
    }
}

// Create a tag element
function createTag(tag_item) {
    const tag = document.createElement("div");
    tag.classList.add("tag");

    const span = document.createElement("span");
    span.classList.add("text");
    span.textContent = tag_item.text;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("viewBox", "0 0 14 14");
    svg.setAttribute("fill", "none");
    svg.innerHTML = '<path d="M3.73268 11.0827L2.91602 10.266L6.18268 6.99935L2.91602 3.73268L3.73268 2.91602L6.99935 6.18268L10.266 2.91602L11.0827 3.73268L7.81602 6.99935L11.0827 10.266L10.266 11.0827L6.99935 7.81602L3.73268 11.0827Z" fill="#333333"/>';
    svg.addEventListener("click", () => deleteFAQ(tag_item.id));
    tag.appendChild(span);
    tag.appendChild(svg);
    return tag;
}

// Open delete confirmation modal
function deleteFAQ(id) {
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    form.querySelector("#message").innerText = 'Are you sure you want to delete this tag?';

    const handleSubmit = (event) => {
        event.preventDefault();
        removeTag(id);
        form.removeEventListener("submit", handleSubmit);
    };

    form.addEventListener("submit", handleSubmit);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", handleSubmit);
    });

    // Open the modal
    new bootstrap.Modal(modal).show();
}

// Delete a tag
async function removeTag(id) {
    let modal = document.getElementById('deleteModal');
    let form = modal.querySelector("form");
    let button = form.closest(".modal").querySelector(`button[form='${form.id}']`);
    let buttonText = button.innerText;
    let errorMsg = form.querySelector('.input-error-msg');

    errorMsg.innerText = '';
    errorMsg.classList.remove('active');

    try {
        beforeLoad(button);

        let response = await requestAPI(`/api/tag/${id}`, null, getHeaders(), 'DELETE');
        if (response.status === 204) {
            button.disabled = true;
            afterLoad(button, 'Deleted');
            setTimeout(() => {
                get_tags(tag_endpoint);
                bootstrap.Modal.getInstance(modal).hide();
                button.disabled = false;
                afterLoad(button, buttonText);
            }, 2500);
        } else {
            let res = await response.json();
            afterLoad(button, buttonText);
            errorMsg.classList.add("active");
            errorMsg.innerText = res.message || 'An error occurred';
            console.error("Error deleting tag:", res);
        }
    } catch (err) {
        console.error(err);
        afterLoad(button, buttonText);
        errorMsg.classList.add("active");
        errorMsg.innerText = 'An error occurred';
    }
}

// Add a new tag
let addTagForm = document.querySelector("#addTagForm");
addTagForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = Object.fromEntries(formData.entries());

    try {
        let response = await requestAPI('/api/tag', JSON.stringify(data), getHeaders(), 'POST');
        if (response.status === 201) {
            get_tags(tag_endpoint);
            form.reset();
        } else {
            let res = await response.json();
            console.error(res);
        }
    } catch (err) {
        console.error(err);
    }
});

// Utility function to get headers
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
    };
}



let faqsSearchForm = document.getElementById("searchForm");
faqsSearchForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    tag_endpoint = setParams(tag_endpoint, 'search', data.search);
    get_tags(tag_endpoint);
})
