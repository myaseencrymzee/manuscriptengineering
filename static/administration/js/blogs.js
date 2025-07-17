
let blogs_endpoint = '/api/blog?perPage=20';
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
    let blogs_container = document.getElementById('blogs-listing-container');
    blogs_container.innerHTML = '';

    if (res.data.length > 0) {
        res.data.forEach(obj => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${obj.title || "--"}</td>
                <td>${obj.author.full_name || "--"}</td>
                <td class="text-capitalize">${obj.status}</td>
                <td>${obj.date != null ? formatDate(obj.date) : "--"}</td>
                <td>
                    <div class="">
                        <svg class="cursor-pointer" onclick="viewBlog(${obj.id});" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_4705_1237" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                            <path d="M30 0H0V30H30V0Z" fill="white"/>
                            </mask>
                            <g mask="url(#mask0_4705_1237)">
                            <path d="M25 1.25H5C2.92893 1.25 1.25 2.92893 1.25 5V25C1.25 27.0711 2.92893 28.75 5 28.75H25C27.0711 28.75 28.75 27.0711 28.75 25V5C28.75 2.92893 27.0711 1.25 25 1.25Z" stroke="#00274D" stroke-width="2.5"/>
                            <path d="M6.66337 14.9499L6.63379 15.0004L6.66337 15.0509C8.40588 18.0271 11.2511 20.3504 14.9997 20.3504C18.7483 20.3504 21.5942 18.0271 23.336 15.0509L23.3656 15.0004L23.336 14.9499C21.5942 11.9737 18.7476 9.65039 14.9997 9.65039C11.2511 9.65039 8.40588 11.9737 6.66337 14.9499ZM14.9997 18.6504C11.8514 18.6504 9.86257 16.6926 8.65432 15.0004C9.86257 13.3082 11.8514 11.3504 14.9997 11.3504C18.1487 11.3504 20.1376 13.3082 21.3451 15.0004C20.1376 16.6926 18.1487 18.6504 14.9997 18.6504Z" fill="#00274D" stroke="#00274D" stroke-width="0.2"/>
                            <path d="M15 17.25C16.2426 17.25 17.25 16.2426 17.25 15C17.25 13.7574 16.2426 12.75 15 12.75C13.7574 12.75 12.75 13.7574 12.75 15C12.75 16.2426 13.7574 17.25 15 17.25Z" fill="#00274D"/>
                            </g>
                        </svg>
                        <svg class="cursor-pointer" onclick="editBlog(${obj.id});" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.25" y="1.25" width="27.5" height="27.5" rx="3.75" stroke="#333333" stroke-width="2.5"/>
                            <path opacity="0.4" d="M16.4209 22.0348H22.3444" stroke="#333333" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6363 8.15543C16.3209 7.2832 17.4272 7.32872 18.3004 8.01331L19.5915 9.02579C20.4647 9.71037 20.774 10.7721 20.0894 11.6462L12.3899 21.4691C12.1326 21.7979 11.7397 21.9921 11.3217 21.9967L8.35203 22.0348L7.67952 19.1413C7.58477 18.7354 7.67952 18.3081 7.93682 17.9784L15.6363 8.15543Z" stroke="#333333" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                            <path opacity="0.4" d="M14.1943 9.99414L18.6474 13.4849" stroke="#333333" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                                                                
                        <svg class="cursor-pointer" onclick="deleteBlog(${obj.id});" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1" y="1" width="28" height="28" rx="4" stroke="#FF3B30" stroke-width="2"/>
                            <path d="M21.5693 12.9277C21.5693 12.9277 21.0834 18.4382 20.8016 20.7594C20.6674 21.868 19.9185 22.5176 18.6918 22.5381C16.3574 22.5766 14.0204 22.579 11.6869 22.534C10.5068 22.5119 9.77039 21.8541 9.63886 20.7651C9.35523 18.4235 8.87207 12.9277 8.87207 12.9277" stroke="#FF3B30" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M22.8067 10.286H7.63379" stroke="#FF3B30" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19.8835 10.2863C19.1811 10.2863 18.5762 9.83219 18.4385 9.203L18.221 8.2081C18.0868 7.7491 17.6323 7.43164 17.1142 7.43164H13.3268C12.8088 7.43164 12.3542 7.7491 12.22 8.2081L12.0026 9.203C11.8648 9.83219 11.26 10.2863 10.5576 10.2863" stroke="#FF3B30" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                                
                    </div>
                </td>
            `;

            blogs_container.appendChild(tr);
        });
        generatePages(res.pagination.currentPage, res.pagination.total, res.pagination.links.previous, res.pagination.links.next)
    }
    else{
        let tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5">No data available yet.</td>`;
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
  
    return `${month} ${day}, ${year}`;
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
