

let notifications_endpoint = '/api/notifications?perPage=20';
let notifications_data = null;

window.addEventListener('load', () => get_notifications(notifications_endpoint));

async function get_notifications(endpoint) {
    try {
        let headers = {};
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                notifications_data = res.data;
                render_notifications_data(res);
            } else {
                console.log(res);
                return false;
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function render_notifications_data(res) {
    let container = document.getElementById('notifications-listing-container');
    container.innerHTML = '';

    if (Array.isArray(res.data) && res.data.length > 0) {
        res.data.forEach(obj => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-capitalize">${obj.title || "--"}</td>
                <td class="text-capitalize notification-content" ><div>${obj.body || "--"}</div></td>
                <td class="text-capitalize" >${obj.status == 'pending' ? 'In Progress' : obj.status  || "--"}</td>
            `;
            container.appendChild(tr);
        });

        generatePages(
            res.pagination.currentPage,
            res.pagination.total,
            res.pagination.links.previous,
            res.pagination.links.next
        );
    } else {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3">No Notifications yet.</td>`;
        container.appendChild(tr);
    }
}

let paginationContainer = document.querySelector('#pagination-container');
// let getFirstPageBtn = document.getElementById('pagination-get-first-record-btn');
let getPreviousPageBtn = document.getElementById('pagination-get-previous-record-btn');
let getNextPageBtn = document.getElementById('pagination-get-next-record-btn');
// let getLastPageBtn = document.getElementById('pagination-get-last-record-btn');

function generatePages(currentPage, totalPages, previousLink, nextLink) {
    const pagesContainer = document.getElementById('pages-container');
    pagesContainer.innerHTML = '';

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }

    if (startPage > 1) {
        pagesContainer.innerHTML += '<span class="cursor-pointer">1</span>';
        if (startPage > 2) {
            pagesContainer.innerHTML +=`<span class="ellipsis-container">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pagesContainer.innerHTML += `<span${i === currentPage ? ' class="active"' : ' class="cursor-pointer"'}>${i}</span>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagesContainer.innerHTML +=`<span class="ellipsis-container">...</span>`;
        }
        pagesContainer.innerHTML += `<span class="cursor-pointer">${totalPages}</span>`;
    }
    pagesContainer.querySelectorAll('span').forEach((span) => {
        if ((!span.classList.contains('active'))  && (!span.classList.contains('ellipsis-container'))) {
            let page = span.innerText;
            let pageUrl = setParams(notifications_endpoint, 'page', page);
            span.setAttribute("onclick", `setPage(${page}); get_notifications('${pageUrl}')`);
        }
    })
    if (previousLink) {
        let firstPageURL = setParams(notifications_endpoint, 'page', 1);
        // getFirstPageBtn.setAttribute('onclick', `setPage(${1}); getRecords('${firstPageURL}')`);
        // getFirstPageBtn.classList.remove('opacity-point-3-5');
        // getFirstPageBtn.classList.add('cursor-pointer');
        getPreviousPageBtn.setAttribute('onclick', `setPage(${currentPage - 1}); get_notifications('${previousLink}')`);
        getPreviousPageBtn.classList.remove('opacity-point-3-5');
        getPreviousPageBtn.classList.add('cursor-pointer');
    }
    else {
        // getFirstPageBtn.removeAttribute('onclick');
        // getFirstPageBtn.classList.add('opacity-point-3-5');
        // getFirstPageBtn.classList.remove('cursor-pointer');
        getPreviousPageBtn.removeAttribute('onclick');
        getPreviousPageBtn.classList.add('opacity-point-3-5');
        getPreviousPageBtn.classList.remove('cursor-pointer');
    }

    if (nextLink) {
        let lastPageURL = setParams(notifications_endpoint, 'page', totalPages);
        // getLastPageBtn.setAttribute('onclick', `setPage(${totalPages}); getRecords('${lastPageURL}')`);
        // getLastPageBtn.classList.remove('opacity-point-3-5');
        // getLastPageBtn.classList.add('cursor-pointer');
        getNextPageBtn.setAttribute('onclick', `setPage(${currentPage + 1}); get_notifications('${nextLink}')`);
        getNextPageBtn.classList.remove('opacity-point-3-5');
        getNextPageBtn.classList.add('cursor-pointer');
    }
    else {
        // getLastPageBtn.removeAttribute('onclick');
        // getLastPageBtn.classList.add('opacity-point-3-5');
        // getLastPageBtn.classList.remove('cursor-pointer');
        getNextPageBtn.removeAttribute('onclick');
        getNextPageBtn.classList.add('opacity-point-3-5');
        getNextPageBtn.classList.remove('cursor-pointer');
    }
}

function getPage(page) {
    pageNumber = page;
    pageFromUrl = true
    document.getElementById('search-result-btn').click();
}

function setPage(pageNum) {
    pageNumber = parseInt(pageNum) || 1;
}

let notificationsSearchForm = document.getElementById("searchForm");
notificationsSearchForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    notifications_endpoint = setParams(notifications_endpoint, 'search', data.search);
    get_notifications(notifications_endpoint);
})


let add_notifications_button = document.querySelector(".add-new-button");
add_notifications_button.addEventListener("click", () => {
    let modalId = 'addNotificationsModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    let info = form.querySelector(".info")

    const formEvent = (event) => addNotificationForm(event);
    form.addEventListener("submit", formEvent);

    // Reset file input & filename
    let fileName = modal.querySelector("#notification-file-name");
    if (fileName) fileName.innerText = "";
    
    let fileInput = modal.querySelector("input[name='attachment']");
    if (fileInput) fileInput.value = "";

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            fileName.innerText = fileInput.files[0].name;
            fileName.classList.remove("hide");
        }
    });

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        info.classList.add("hide");

        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });

        let uploadBox = modal.querySelector(".remove-image")?.closest(".upload-box");
        document.getElementById("notification-file-name").innerText = "";
        fileInput.value = "";
        uploadBox?.querySelector('svg')?.classList.remove('hide');
        uploadBox?.querySelector('span')?.classList.remove('hide');
    });

    document.querySelector(`.${modalId}`).click();
});


function isQuillEmpty(quill) {
    if ((quill.getContents()['ops'] || []).length !== 1)
        return false;
    return quill.getText().trim().length === 0
} 

async function addNotificationForm(event) {
    event.preventDefault();
    const content = document.querySelector('.ql-editor');
    let form = event.target;
    let formData = new FormData(form);
    let button = form.querySelector("button[type='submit']");
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = '';
    errorMsg.classList.remove('active');
    let info = form.querySelector(".info")

    // Validation
    let title = formData.get('title')?.trim();
    // let body = formData.get('body')?.trim();
    
    if (!title) {
        errorMsg.innerText = 'Please enter a title.';
        errorMsg.classList.add('active');
        return false;
    }    
    if (content.classList.contains("ql-blank") || isQuillEmpty(quill)) {
        errorMsg.innerText = 'Please write a description.';
        errorMsg.classList.add('active');
        return false;
    }
    formData.append('body', content.innerHTML);

    // formData.append('emails', JSON.stringify(subscriber_emails));

    try {
        let csrfToken = formData.get('csrfmiddlewaretoken');
        let headers = {
            "X-CSRFToken": csrfToken,
        };

        beforeLoad(button);
        info.classList.remove("hide");
        let response = await requestAPI('/api/notification/send/', formData, headers, 'POST');
        
        let responseData = await response.json();
        
        if (response.status === 201) {
            info.classList.add("hide");
            afterLoad(button, 'Notification Sent');
            button.disabled = true;
            setTimeout(() => {
                button.disabled = false;
                afterLoad(button, buttonText);
                get_notifications(notifications_endpoint);
                closeCurrentModal();
            }, 1500);
        } else {
            afterLoad(button, buttonText);
            errorMsg.classList.add("active");
            displayMessages(responseData, errorMsg);
        }
    } catch (err) {
        console.error(err);
        afterLoad(button, buttonText);
        errorMsg.innerText = 'An error occurred. Please try again.';
        errorMsg.classList.add('active');
    }
}


var Delta = Quill.import('delta');

var quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Write here...',
    modules: {
        toolbar: {
            container: '#toolbar'
        },
        history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
        }
    }
});

// Example usage of Delta
quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
    return new Delta().insert(node.data);
});

quill.root.addEventListener('paste', function (e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    quill.clipboard.dangerouslyPasteHTML(0, text);
});

document.querySelector('.ql-undo').addEventListener('click', () => {
    quill.history.undo();
});

document.querySelector('.ql-redo').addEventListener('click', () => {
    quill.history.redo();
});