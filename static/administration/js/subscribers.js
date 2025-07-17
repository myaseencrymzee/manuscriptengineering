let subscribers_endpoint = '/api/subscribers-list?perPage=20';
let subscribers_data = null;

window.addEventListener('load', () => get_subscribers(subscribers_endpoint));

async function get_subscribers(endpoint) {
    let container = document.getElementById('subscribers-listing-container');
    container.innerHTML = '';
    container.innerHTML = `<tr>
                                <td colspan="4" class="border-none">
                                    <div class="d-flex justify-content-center">
                                        <span class="spinner-border spinner-border-md" role="status" aria-hidden="true"></span>
                                    </div>
                                </td>
                            </tr>`;
                            
    try {
        let headers = {};
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                subscribers_data = res.data;
                render_subscribers_data(res);
            } else {
                console.log(res);
                return false;
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function render_subscribers_data(res) {
    let container = document.getElementById('subscribers-listing-container');
    container.innerHTML = '';

    if (Array.isArray(res.data) && res.data.length > 0) {
        res.data.forEach(obj => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${obj.email || "--"}</td>
                <td>${obj.name || "--"}</td>
                <td class="text-capitalize">${obj.topic || "--"}</td>
                <td>
                    <button type="button" onclick="unsubscribeModal(${obj.id})">Unsubscribe</button>
                </td>
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
        tr.innerHTML = `<td colspan="4">No subscribers yet.</td>`;
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
            let pageUrl = setParams(subscribers_endpoint, 'page', page);
            span.setAttribute("onclick", `setPage(${page}); get_subscribers('${pageUrl}')`);
        }
    })
    if (previousLink) {
        let firstPageURL = setParams(subscribers_endpoint, 'page', 1);
        // getFirstPageBtn.setAttribute('onclick', `setPage(${1}); getRecords('${firstPageURL}')`);
        // getFirstPageBtn.classList.remove('opacity-point-3-5');
        // getFirstPageBtn.classList.add('cursor-pointer');
        getPreviousPageBtn.setAttribute('onclick', `setPage(${currentPage - 1}); get_subscribers('${previousLink}')`);
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
        let lastPageURL = setParams(subscribers_endpoint, 'page', totalPages);
        // getLastPageBtn.setAttribute('onclick', `setPage(${totalPages}); getRecords('${lastPageURL}')`);
        // getLastPageBtn.classList.remove('opacity-point-3-5');
        // getLastPageBtn.classList.add('cursor-pointer');
        getNextPageBtn.setAttribute('onclick', `setPage(${currentPage + 1}); get_subscribers('${nextLink}')`);
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
    console.log(data.search)
    subscribers_endpoint = setParams(subscribers_endpoint, 'search', data.search);
    get_subscribers(subscribers_endpoint);
})


function unsubscribeModal(id){
    console.log(id)
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    modal.querySelector(".modal-title").innerText = "Unsubscribe"
    form.querySelector("#message").innerText = 'Are you sure you want to Unsubscribe?'
    modal.querySelector(".btn-text").innerText = "Unsubscribe"    
    let formEvent = (event) => unsubscribeForm(event, id);
    form.addEventListener("submit",formEvent);

    modal.addEventListener('hidden.bs.modal', () => {
        form.reset();
        form.removeEventListener("submit", formEvent);
        modal.querySelectorAll(".input-error-msg").forEach(msg => {
            msg.innerText = '';
            msg.classList.remove("active");
        });
    });
    document.querySelector(`.${modalId}`).click();
}

async function unsubscribeForm(event, id){
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);

    let button = form.closest(".modal").querySelector(`button[form='${form.id}']`);
    let buttonText = button.querySelector(".btn-text").textContent;
    let errorMsg = form.querySelector('.input-error-msg');
    errorMsg.innerText = ''; 
    errorMsg.classList.remove('active');

    try {
        errorMsg.innerText = ''; 
        errorMsg.classList.remove('active');
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        };
        beforeLoad(button);
        let response = await requestAPI(`/api/subscribe/${id}/`, null, headers, 'DELETE');
        if (response.status === 204) {
            afterLoad(button, 'Unsubscribed');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_subscribers(subscribers_endpoint)
                    closeCurrentModal()
                }, 1500)
        } else {
            let res = await response.json();
            afterLoad(button, buttonText);
            errorMsg.classList.add("active");
            displayMessages(res, errorMsg);
            console.error("Error unsubscribing:", res);
            return;
        }
    } catch (err) {
        console.error("Request failed:", err);
    }
}