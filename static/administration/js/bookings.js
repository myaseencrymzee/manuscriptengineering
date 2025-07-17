
let blogs_endpoint = '/api/bookings?perPage=20';
let blogs_data = null;
async function get_blogs(endpoint){
    try {
        let headers = {};
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                blogs_data = res.data;
                render_blogs_data(res);
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

window.addEventListener('load', get_blogs(blogs_endpoint));

function render_blogs_data(res) {
    let blogs_container = document.getElementById('bookings-listing-container');
    blogs_container.innerHTML = '';

    if (res.data.length > 0) {
        res.data.forEach(obj => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${obj.invitee_name || "--"}</td>
                <td>${obj.invitee_email || "--"}</td>
                <td class="text-capitalize">${obj.service_type || "--"}</td>
                <td>${obj.start_time ? formatDate(obj.start_time) : "--"}</td>
                <td>${obj.end_time ? formatDate(obj.end_time) : "--"}</td>
                <td class="text-capitalize">${obj.status || "--"}</td>
            `;
            blogs_container.appendChild(tr);
        });
        generatePages(res.pagination.currentPage, res.pagination.total, res.pagination.links.previous, res.pagination.links.next)
    }
    else{
        let tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6">No data available yet.</td>`;
        blogs_container.appendChild(tr);
    }
}

function editBlog(id) {
    location.pathname = `/admin-update-blogs/${id}`
}

function viewBlog(id){
    location.pathname = `/admin-view-blogs/${id}`
}

let originalObj = null;
function deleteBlog(id) {
    originalObj = blogs_data.find(blog => blog.id == id); 
    let modalId = 'deleteModal';
    let modal = document.getElementById(modalId);
    let form = modal.querySelector("form");
    form.querySelector("#message").innerText = 'Are you sure you want to delete this blog?'
    let formEvent = (event) => deleteBlogForm(event);
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
    // Add your delete logic here
}

function formatDate(dateStr) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    // Extract hours and minutes
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert 24-hour time to 12-hour time
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes; // add leading zero for minutes

    const timeStr = `${hours}:${minutes} ${ampm}`;
    return `${month} ${day}, ${year} ${timeStr}`;
}

async function deleteBlogForm(event) {
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
        let response = await requestAPI(`/api/blog/${originalObj.id}`, null, headers, 'DELETE');
        if (response.status === 204) {
            afterLoad(button, 'Deleted');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    afterLoad(button, buttonText);
                    get_blogs(blogs_endpoint)
                    closeCurrentModal()
                }, 1500)
        } else {
            let res = await response.json();
            afterLoad(button, buttonText);
            errorMsg.classList.add("active");
            displayMessages(res, errorMsg);
            console.error("Error deleting course:", res);
            return;
        }
    } catch (err) {
        console.error("Request failed:", err);
    }
}

let faqsSearchForm = document.getElementById("searchForm");
faqsSearchForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);
    let data = formDataToObject(formData);
    blogs_endpoint = setParams(blogs_endpoint, 'search', data.search);
    get_blogs(blogs_endpoint);
})


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
            let pageUrl = setParams(blogs_endpoint, 'page', page);
            span.setAttribute("onclick", `setPage(${page}); get_blogs('${pageUrl}')`);
        }
    })
    if (previousLink) {
        let firstPageURL = setParams(blogs_endpoint, 'page', 1);
        // getFirstPageBtn.setAttribute('onclick', `setPage(${1}); getRecords('${firstPageURL}')`);
        // getFirstPageBtn.classList.remove('opacity-point-3-5');
        // getFirstPageBtn.classList.add('cursor-pointer');
        getPreviousPageBtn.setAttribute('onclick', `setPage(${currentPage - 1}); get_blogs('${previousLink}')`);
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
        let lastPageURL = setParams(blogs_endpoint, 'page', totalPages);
        // getLastPageBtn.setAttribute('onclick', `setPage(${totalPages}); getRecords('${lastPageURL}')`);
        // getLastPageBtn.classList.remove('opacity-point-3-5');
        // getLastPageBtn.classList.add('cursor-pointer');
        getNextPageBtn.setAttribute('onclick', `setPage(${currentPage + 1}); get_blogs('${nextLink}')`);
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
