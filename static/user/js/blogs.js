let topLeftBlogsContainer = document.getElementById("top-left-blogs-container");
let rightBlogsContainer = document.getElementById("right-blogs-container");

let selectedTopicType = null;

function selectTopicType(type, text){
    document.querySelector("input[name='topic']").value = text;
    selectedTopicType = type;
}

window.addEventListener("resize", ()=> {
  adjustBlogContainerHeights();
})

let blogs_endpoint = '/api/blog?perPage=1000&status=published';

async function get_blogs(endpoint){
    try {
        let response = await requestAPI(endpoint, null, {}, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                res.data = res.data.filter(blog => blog.publish_to === 'construction' || blog.publish_to === 'both');
                render_blogs_data(res);
                render_top_blogs_data(res)
                console.log(res);
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
    let blogs_container = document.getElementById('blogs-listing-container')
    blogs_container.innerHTML = '';
    let shouldRender = true;
    let dataLength = res.data.length;
    let startRenderIndex = 4;

    if (dataLength > 2 && dataLength < 5) {
        startRenderIndex = 2;
        shouldRender = true;
    }
    else if (dataLength > 4) {
        shouldRender = true;
        startRenderIndex = 4;
    }
    else {
        shouldRender = false;
        rightBlogsContainer.classList.add('hide');
        // topLeftBlogsContainer.classList.remove('col-lg-6');
        // blogs_container.classList.add('hide');
    }

    if (shouldRender) {
        // res.data.forEach(obj => {
          for(let i = startRenderIndex; i < dataLength; i++) {
            let obj = res.data[i];
            let div = document.createElement('div')
            div.classList.add('col-12', 'gy-3')
            div.innerHTML = `
                <div class="row justify-content-between align-items-center">
                        <div class="col-4">
                            <div class="d-flex align-items-center">
                                <img src="${obj.images.length == 0 ? '/static/user/images/test-image-alin.png' : obj.images[0].image}" alt="">
                            </div>
                        </div>
                        <div class="col-8 blog-details">
                            <h2 title="${obj.title}">${obj.title}</h2>
                            <div class="stats">
                                    <div class="author">
                                        <img src="${obj.author.profile_picture ?  obj.author.profile_picture : '/static/user/images/client.svg' }" alt="">
                                        <span>${obj.author.full_name}</span>
                                    </div>
                                    <svg width="1" height="12" viewBox="0 0 1 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="0.726318" y1="1.31087e-08" x2="0.726318" y2="12" stroke="#999999" stroke-width="0.5"/>
                                    </svg>                                    
                                    <div class="date">
                                        <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.17456 4.5C1.17456 3.39543 2.06999 2.5 3.17456 2.5H9.17456C10.2791 2.5 11.1746 3.39543 11.1746 4.5C11.1746 4.77614 10.9507 5 10.6746 5H1.67456C1.39842 5 1.17456 4.77614 1.17456 4.5Z" fill="#00274D"/>
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.17456 7C1.17456 8.88562 1.17456 9.82843 1.76035 10.4142C2.34613 11 3.28894 11 5.17456 11H7.17456C9.06018 11 10.003 11 10.5888 10.4142C11.1746 9.82843 11.1746 8.88562 11.1746 7C11.1746 6.5286 11.1746 6.29289 11.0281 6.14645C10.8817 6 10.646 6 10.1746 6H2.17456C1.70316 6 1.46745 6 1.32101 6.14645C1.17456 6.29289 1.17456 6.5286 1.17456 7ZM3.67456 7.5C3.67456 7.22386 3.89842 7 4.17456 7H5.17456C5.4507 7 5.67456 7.22386 5.67456 7.5C5.67456 7.77614 5.4507 8 5.17456 8H4.17456C3.89842 8 3.67456 7.77614 3.67456 7.5ZM4.17456 9C3.89842 9 3.67456 9.22386 3.67456 9.5C3.67456 9.77614 3.89842 10 4.17456 10H5.17456C5.4507 10 5.67456 9.77614 5.67456 9.5C5.67456 9.22386 5.4507 9 5.17456 9H4.17456ZM6.67456 7.5C6.67456 7.22386 6.89842 7 7.17456 7H8.17456C8.4507 7 8.67456 7.22386 8.67456 7.5C8.67456 7.77614 8.4507 8 8.17456 8H7.17456C6.89842 8 6.67456 7.77614 6.67456 7.5ZM7.17456 9C6.89842 9 6.67456 9.22386 6.67456 9.5C6.67456 9.77614 6.89842 10 7.17456 10H8.17456C8.4507 10 8.67456 9.77614 8.67456 9.5C8.67456 9.22386 8.4507 9 8.17456 9H7.17456Z" fill="#00274D"/>
                                            <path d="M3.67456 1.5L3.67456 3" stroke="#00274D" stroke-width="2" stroke-linecap="round"/>
                                            <path d="M8.67456 1.5L8.67456 3" stroke="#00274D" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                        <span>${formatDate(obj.date)}</span>                                        
                                    </div>
                                    <svg width="1" height="12" viewBox="0 0 1 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="0.726318" y1="1.31087e-08" x2="0.726318" y2="12" stroke="#999999" stroke-width="0.5"/>
                                    </svg>
                                    <div class="read">
                                        <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clip-path="url(#clip0_53_2543)">
                                            <path d="M6.25183 1C5.26293 1 4.29623 1.29324 3.47398 1.84265C2.65174 2.39206 2.01087 3.17295 1.63244 4.08658C1.254 5.00021 1.15498 6.00555 1.34791 6.97545C1.54083 7.94536 2.01704 8.83627 2.7163 9.53553C3.41556 10.2348 4.30648 10.711 5.27638 10.9039C6.24629 11.0969 7.25162 10.9978 8.16525 10.6194C9.07888 10.241 9.85977 9.6001 10.4092 8.77785C10.9586 7.95561 11.2518 6.98891 11.2518 6C11.2518 5.34339 11.1225 4.69321 10.8712 4.08658C10.62 3.47995 10.2517 2.92876 9.78737 2.46447C9.32307 2.00017 8.77188 1.63188 8.16525 1.3806C7.55862 1.12933 6.90844 1 6.25183 1ZM8.25183 6.5H6.25183C6.11923 6.5 5.99205 6.44732 5.89828 6.35355C5.80451 6.25979 5.75183 6.13261 5.75183 6V4C5.75183 3.86739 5.80451 3.74021 5.89828 3.64645C5.99205 3.55268 6.11923 3.5 6.25183 3.5C6.38444 3.5 6.51162 3.55268 6.60539 3.64645C6.69915 3.74021 6.75183 3.86739 6.75183 4V5.5H8.25183C8.38444 5.5 8.51162 5.55268 8.60539 5.64645C8.69916 5.74021 8.75183 5.86739 8.75183 6C8.75183 6.13261 8.69916 6.25979 8.60539 6.35355C8.51162 6.44732 8.38444 6.5 8.25183 6.5Z" fill="#00274D"/>
                                            </g>
                                            <defs>
                                            <clipPath id="clip0_53_2543">
                                            <rect width="12" height="12" fill="white" transform="translate(0.251831)"/>
                                            </clipPath>
                                            </defs>
                                        </svg>
                                        <span>3 min. to read</span>                                        
                                    </div>                                    
                            </div>
                            <div class="blog-body">${obj.content}<a class="read-more" href="/resources/${obj.id}">...  <span>Read More</span></a></div>
                            
                        </div>
                    </div>
            `
            blogs_container.appendChild(div);
        }
    }    
}

function render_top_blogs_data(res) {
    let top_blogs_container = document.getElementById('top-blogs-container')
    top_blogs_container.innerHTML = '';

    let dataLength = res.data.length;
    let renderCount = 4;
    let shouldRender = true;

    if (dataLength == 0)
        shouldRender = false;
    else if ((dataLength > 2 && dataLength < 5)) {
        renderCount = 2;
    }
    else if (dataLength <= 2)
        renderCount = dataLength;

    console.log(dataLength, renderCount, shouldRender);

  if (shouldRender) {
    for (let i = 0; i < renderCount; i++) {
        let obj = res.data[i];
        console.log(obj);
          let div = document.createElement('div')
          div.classList.add('col-12', 'col-lg-6', `${i > 1 ? 'mt-3' : 'mt-0'}`);          
          div.innerHTML = `
              <div class="blog">
                            <span title="${obj.title}" class="blog-title">${obj.title}</span>
                            <div class="blog-cover">
                                <img src="${obj.images.length == 0 ? '/static/user/images/test-image-alin.png' : obj.images[0].image}" alt="">
                                <div class="stats">
                                    <div class="author">
                                        <img src="${obj.author.profile_picture ?  obj.author.profile_picture : '/static/user/images/client.svg' }" alt="">
                                        <span>${obj.author.full_name}</span>
                                    </div>
                                    <svg width="1" height="12" viewBox="0 0 1 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="0.726318" y1="1.31087e-08" x2="0.726318" y2="12" stroke="#999999" stroke-width="0.5"/>
                                    </svg>                                    
                                    <div class="date">
                                        <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.17456 4.5C1.17456 3.39543 2.06999 2.5 3.17456 2.5H9.17456C10.2791 2.5 11.1746 3.39543 11.1746 4.5C11.1746 4.77614 10.9507 5 10.6746 5H1.67456C1.39842 5 1.17456 4.77614 1.17456 4.5Z" fill="#00274D"/>
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.17456 7C1.17456 8.88562 1.17456 9.82843 1.76035 10.4142C2.34613 11 3.28894 11 5.17456 11H7.17456C9.06018 11 10.003 11 10.5888 10.4142C11.1746 9.82843 11.1746 8.88562 11.1746 7C11.1746 6.5286 11.1746 6.29289 11.0281 6.14645C10.8817 6 10.646 6 10.1746 6H2.17456C1.70316 6 1.46745 6 1.32101 6.14645C1.17456 6.29289 1.17456 6.5286 1.17456 7ZM3.67456 7.5C3.67456 7.22386 3.89842 7 4.17456 7H5.17456C5.4507 7 5.67456 7.22386 5.67456 7.5C5.67456 7.77614 5.4507 8 5.17456 8H4.17456C3.89842 8 3.67456 7.77614 3.67456 7.5ZM4.17456 9C3.89842 9 3.67456 9.22386 3.67456 9.5C3.67456 9.77614 3.89842 10 4.17456 10H5.17456C5.4507 10 5.67456 9.77614 5.67456 9.5C5.67456 9.22386 5.4507 9 5.17456 9H4.17456ZM6.67456 7.5C6.67456 7.22386 6.89842 7 7.17456 7H8.17456C8.4507 7 8.67456 7.22386 8.67456 7.5C8.67456 7.77614 8.4507 8 8.17456 8H7.17456C6.89842 8 6.67456 7.77614 6.67456 7.5ZM7.17456 9C6.89842 9 6.67456 9.22386 6.67456 9.5C6.67456 9.77614 6.89842 10 7.17456 10H8.17456C8.4507 10 8.67456 9.77614 8.67456 9.5C8.67456 9.22386 8.4507 9 8.17456 9H7.17456Z" fill="#00274D"/>
                                            <path d="M3.67456 1.5L3.67456 3" stroke="#00274D" stroke-width="2" stroke-linecap="round"/>
                                            <path d="M8.67456 1.5L8.67456 3" stroke="#00274D" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                        <span>${formatDate(obj.date)}</span>                                        
                                    </div>
                                    <svg width="1" height="12" viewBox="0 0 1 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="0.726318" y1="1.31087e-08" x2="0.726318" y2="12" stroke="#999999" stroke-width="0.5"/>
                                    </svg>
                                    <div class="read">
                                        <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clip-path="url(#clip0_53_2543)">
                                            <path d="M6.25183 1C5.26293 1 4.29623 1.29324 3.47398 1.84265C2.65174 2.39206 2.01087 3.17295 1.63244 4.08658C1.254 5.00021 1.15498 6.00555 1.34791 6.97545C1.54083 7.94536 2.01704 8.83627 2.7163 9.53553C3.41556 10.2348 4.30648 10.711 5.27638 10.9039C6.24629 11.0969 7.25162 10.9978 8.16525 10.6194C9.07888 10.241 9.85977 9.6001 10.4092 8.77785C10.9586 7.95561 11.2518 6.98891 11.2518 6C11.2518 5.34339 11.1225 4.69321 10.8712 4.08658C10.62 3.47995 10.2517 2.92876 9.78737 2.46447C9.32307 2.00017 8.77188 1.63188 8.16525 1.3806C7.55862 1.12933 6.90844 1 6.25183 1ZM8.25183 6.5H6.25183C6.11923 6.5 5.99205 6.44732 5.89828 6.35355C5.80451 6.25979 5.75183 6.13261 5.75183 6V4C5.75183 3.86739 5.80451 3.74021 5.89828 3.64645C5.99205 3.55268 6.11923 3.5 6.25183 3.5C6.38444 3.5 6.51162 3.55268 6.60539 3.64645C6.69915 3.74021 6.75183 3.86739 6.75183 4V5.5H8.25183C8.38444 5.5 8.51162 5.55268 8.60539 5.64645C8.69916 5.74021 8.75183 5.86739 8.75183 6C8.75183 6.13261 8.69916 6.25979 8.60539 6.35355C8.51162 6.44732 8.38444 6.5 8.25183 6.5Z" fill="#00274D"/>
                                            </g>
                                            <defs>
                                            <clipPath id="clip0_53_2543">
                                            <rect width="12" height="12" fill="white" transform="translate(0.251831)"/>
                                            </clipPath>
                                            </defs>
                                        </svg>
                                        <span>${obj.read_time} min. to read</span>                                        
                                    </div>                                    
                                </div>
                            </div>
                            <div class="blog-body">${obj.content}<a class="read-more" href="/resources/${obj.id}">...  <span>Read More</span></a></div>
                        </div>
          `
          top_blogs_container.appendChild(div);
      }
      adjustBlogContainerHeights();
  }    
}

function adjustBlogContainerHeights() {
  let requiredDimensions = topLeftBlogsContainer.getBoundingClientRect();
  console.log(requiredDimensions);
  rightBlogsContainer.style.maxHeight = `${requiredDimensions.height}px`;
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
  
    return `${day} ${month}, ${year}`;
}
  

function shareSite() {
  window.location.href = `mailto:?cc=support@alinmarin.com&subject=Check%20out%20this%20resource&body=I%20found%20this%20useful%20resource%20for%20authors:%20${location.origin}`;
}