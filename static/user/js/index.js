

let topLeftBlogsContainer = document.getElementById("top-left-blogs-container");
let rightBlogsContainer = document.getElementById("right-blogs-container");

let selectedTopicType = null;

function selectTopicType(type, text){
    document.querySelector("input[name='topic']").value = text;
    selectedTopicType = type;
}


// let seeMoreBtn = document.getElementById('seemore-button')

window.addEventListener("resize", ()=> {
//   if(window.innerWidth < 768){
//     seeMoreBtn.classList.add("hide");
//   }
//   else{
//     seeMoreBtn.classList.add("hide");
//   }

  adjustBlogContainerHeights();
})

// seeMoreBtn.addEventListener('click', navigateToSpecificServicesPage);

// let servicesTabLength = {
//   'coaching' : 0,
//   'consulting' : 0,
//   'speaking' : 0,
//   'courses' : 0
// }

// function navigateToSpecificServicesPage() {
//   location.pathname = `/services/${seeMoreBtn.getAttribute('data-value')}/`
// }

// document.addEventListener('DOMContentLoaded', function () {
//   const tabs = document.querySelectorAll('.tab');
//   const contents = document.querySelectorAll('.tab-content');

//   tabs.forEach(tab => {
//     tab.addEventListener('click', function () {
      
//       seeMoreBtn.setAttribute('data-value', tab.value)
//       if(servicesTabLength[tab.value] > 4) {
//         seeMoreBtn.classList.remove('visibility-hidden')
//         if(window.innerWidth < 768) {
//           seeMoreBtn.classList.remove('hide');
//         }
//       } else {
//         seeMoreBtn.classList.add('visibility-hidden')
//         if(window.innerWidth < 768){
//           seeMoreBtn.classList.add('hide')
//         }
//       }
//       tabs.forEach(t => t.classList.remove('active'));
//       contents.forEach(c => c.classList.remove('active'));

//       this.classList.add('active');

//       const contentId = this.id.replace('-tab', '-content');
//       document.getElementById(contentId).classList.add('active');
//     });
//   });
// });


let prevButton = document.querySelector(".swiper-button-prev");
let nextButton = document.querySelector(".swiper-button-next");

const swiper = new Swiper(".swiper", {
  slidesPerView: 1, // Default to 3 slides
  spaceBetween: 20,
  centeredSlides: false, 
  breakpoints: {
    500: {
      slidesPerView: 2, // Show 2 slides for screens >= 500px
      centeredSlides: false,
    },
    992: {
      slidesPerView: 3, // Show 3 slides for screens >= 992px
    //   centeredSlides: true,
    },
  },
});

prevButton.addEventListener("click", () => {
  swiper.slidePrev();
  updateNavButtons();
});

nextButton.addEventListener("click", () => {
  swiper.slideNext();
  updateNavButtons();
});

// Function to update navigation button states
function updateNavButtons() {
  // Add/remove 'active' class for previous button
  if (swiper.isBeginning) {
    prevButton.classList.remove("active");
  } else {
    prevButton.classList.add("active");
  }

  // Add/remove 'active' class for next button
  if (swiper.isEnd) {
    nextButton.classList.remove("active");
  } else {
    nextButton.classList.add("active");
  }
}

updateNavButtons();
document.addEventListener('DOMContentLoaded', function () {
  // Function to activate the tab based on the URL hash
  function activateTabFromHash() {
    let active_tab = window.location.hash.substring(1); // Remove the '#' from the hash
    if (active_tab) {
      // Remove active class from all tabs
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      // Add active class to the tab that matches the hash
      let targetTab = document.querySelector(`.nav-link[data-tab="${active_tab}"]`);
      document.getElementById(active_tab).style.paddingTop = "70px";
      if (targetTab) {
        targetTab.classList.add('active');
      }
    }
  }

  // Activate the tab based on the URL hash when the page loads
  activateTabFromHash();

  // Add click event listeners to all tabs
  document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Remove active class from all tabs
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
  
        // Add active class to the clicked tab
        this.classList.add('active');
  
        // Update the URL hash
        let tabId = this.getAttribute('data-tab');
        window.location.hash = tabId;
    });
  });

  // Listen for hash changes (e.g., when the user navigates back/forward)
  window.addEventListener('hashchange', activateTabFromHash);
});

function getScreenWidth() {
    const widths = [window.innerWidth];

    if (window.screen?.width) {
        widths.push(window.screen?.width);
    }

    const width = Math.min(...widths);
    return width;
}

// daily updates api integration
async function dailyUpdateForm(event) {
  event.preventDefault();
  let form = event.target;
  let formData = new FormData(form);
  let data = formDataToObject(formData);
  let button = form.querySelector('button[type="submit"]');
  let btnText = button.querySelector('.btn-text').textContent;

  let error_message = form.querySelector(".input-error-msg");
  error_message.innerHTML = "";
  error_message.classList.remove("active");

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

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
      error_message.innerHTML = "Please enter a valid email address.";
      error_message.classList.add("active");
      return false;
  }

  if (!data.topic.trim()) {
      error_message.innerHTML = "Please enter a topic of interest.";
      error_message.classList.add("active");
      return false;
  }

  try {
    
    error_message.innerHTML = "";
    error_message.classList.remove("active");
    beforeLoad(button);
    data.topic = data.topic.toLowerCase()
    let response = await fetch("/api/subscribe/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": data.csrfmiddlewaretoken,
        },
        body: JSON.stringify(data),
    });

    let result = await response.json();
    console.log(result);
    

    if (response.status == 201) {
        document.querySelector(".subscriptionModal").click();
        afterLoad(button, 'Subscribed')
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
            afterLoad(button, btnText);
            
        }, 1500)
        form.reset();
    } else {
        afterLoad(button, btnText);
        displayMessages(result, error_message);
        // error_message.innerHTML = result.message || "Failed to send message. Please try again.";
        error_message.classList.add("active");
    }
} catch (error) {
    afterLoad(button, btnText);
    console.error("Error:", error);
    error_message.innerHTML = "Something went wrong. Please try again.";
    error_message.classList.add("active");
}
}


// window.addEventListener('load', getServicesData('coaching'));
// window.addEventListener('load', getServicesData('consulting'));
// window.addEventListener('load', getServicesData('speaking'));
// window.addEventListener('load', getServicesData('courses'));

let faqUrl = '/api/faqs?perPage=1000'
let blogs_endpoint = '/api/blog?perPage=1000&status=published';
window.addEventListener('load', getFaqData(faqUrl));
window.addEventListener('load', get_blogs(blogs_endpoint));


// async function getServicesData(type) {
//     try {
//         let response = await requestAPI(`/api/${type}`, null, {}, 'GET');
//         let res = await response.json();
//         if(response.status == 200) {
//             renderServicesData(res, type)
//         } 
//     }
//     catch(err) {
//         console.log(err);   
//     }
// }

// function renderServicesData(responseData, type) {
//     let servicesContainer = document.getElementById(`${type}-services-container`);
//     servicesContainer.innerHTML = '';
//     if(responseData.data.length > 4 && type == 'coaching') {
//       seeMoreBtn.classList.remove('visibility-hidden');
//     }

//     servicesTabLength[`${type}`] = responseData.data.length;
    
//     if (responseData.data.length > 0) {
//       let maxItems = Math.min(responseData.data.length, 4); // Ensure it doesn't exceed 4
//       for (let i = 0; i < maxItems; i++) {
//           let data = responseData.data[i];
//           let specificServicesWrapper = document.createElement('div');
//           specificServicesWrapper.classList.add('coaching-services');
//           specificServicesWrapper.innerHTML = `
//               <img src="${data.image}" alt="">
//               <div class="main-coaching-content">
//                   <h4>${data.title}</h4>
//                   <span>${data.description}</span>
//                   <div class="book-now-coaching-btns">
//                       <button onclick="location.pathname = '/book-now/'">${type == 'courses'? 'Enroll Now' : 'Book Now'}</button>
//                       <div class="img-container hide">
//                           <img src="/static/web/images/userimg1.jpg" alt="" style="position: relative; right: -60px;">
//                           <img src="/static/web/images/userimg2.jpg" alt="" style="position: relative; right: -40px;">
//                           <img src="/static/web/images/userimg3.jpg" alt="" style="position: relative; right: -20px;">
//                           <img src="/static/web/images/userimg1.jpg" alt="" style="position: relative; z-index: 1;">
//                       </div>
//                   </div>
//               </div>
//           `;
//           servicesContainer.appendChild(specificServicesWrapper);
//       }
//   } else {
//       let span = document.createElement('span');
//       span.classList.add('text-center');
//       span.innerHTML = 'Service Currently not available';
//       servicesContainer.appendChild(span);
//   }
     
// }



async function getFaqData(faqUrl) {
  try {
      let response = await requestAPI(faqUrl, null, {}, 'GET');
      let res = await response.json();      
      if(response.status == 200) {
          renderFaqsData(res)
          initializeFaqFunctionality()
      } 
  }
  catch(err) {
      console.log(err);   
  }
}

function renderFaqsData(res) {
  let faqContainer = document.getElementById('faqContainer')
  faqContainer.innerHTML = ''

  if(res.data.length > 0){
    res.data.forEach((data, index) => {
      
      let faqitem = document.createElement('div');
      faqitem.classList.add('faq-item');
      faqitem.setAttribute('data-id', data.id)
      faqitem.innerHTML = `
            
                    <div class="faq-question-container">
                        <span>${index + 1}.  <span class="faq-question">${data.question}</span></span>
                        <svg class="arrow" width="10" height="19" viewBox="0 0 10 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.89844L9 9.89844L1 17.8984" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    
                    <div class="mobile-answer">
                        ${data.answer}
                    </div>
                
      `
      faqContainer.appendChild(faqitem)
    })
  } else {
        let faqWrapper = document.querySelector('.faq-wrapper')
        let noFaq = document.querySelector('.no-faq')
        faqWrapper.classList.add('hide')
        noFaq.classList.remove('hide')
      }
  
}

function initializeFaqFunctionality() {
  const faqItems = document.querySelectorAll('.faq-item');
  const faqDetails = document.querySelector('.faq-details');
  let activeItem = null;
  let isMobile = getScreenWidth() <= 768;

  function updateFaqDetails(item) {
      const answer = item.querySelector('.mobile-answer').innerHTML;
      const question = item.querySelector('.faq-question').innerHTML;

      if (!isMobile) {
          faqDetails.innerHTML = `
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px;">${question}</h3>
              <div class="faq-answer">${answer}</div>
          `;
      }
  }

  function handleResize() {
      isMobile = getScreenWidth() <= 768;
      let arrowSvg = document.querySelector(".faq-item.active")?.querySelector(".arrow") || null;
      if (activeItem) {
          if (isMobile) {
              faqDetails.classList.add("hide");
              document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.remove("hide");
              document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.add("show");
              arrowSvg && (arrowSvg.classList.add("rotate-90"));
          } else {
              faqDetails.classList.remove("hide");
              document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.add("hide");
              document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.remove("show");
              arrowSvg && (arrowSvg.classList.remove("rotate-90"));
              updateFaqDetails(activeItem);
              updateDetailsPosition();
          }
      }
  }

  function updateDetailsPosition() {
      if (!activeItem || isMobile) return;

      const rect = activeItem.getBoundingClientRect();
      faqDetails.style.top = `${rect.top}px`;
      faqDetails.style.left = `${rect.right - 5}px`;
  }

  faqItems.forEach(item => {
      item.addEventListener('click', () => {
          let arrowSvg = item.querySelector(".arrow") || null;
          if (activeItem === item) {
              document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.add("hide");
              document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.remove("show");
              arrowSvg && (arrowSvg.classList.remove("rotate-90"));
              item.classList.remove('active');
              faqDetails.classList.remove('active');
              activeItem = null;
          } else {
              if (activeItem) {
                  document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.add("hide");
                  document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.remove("show");
                  document.querySelector(".faq-item.active")?.querySelector(".arrow")?.classList.remove("rotate-90");
                  activeItem.classList.remove('active');
              }

              item.classList.add('active');
              activeItem = item;

              if (!isMobile) {
                  document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.add("hide");
                  document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.remove("show");
                  arrowSvg && (arrowSvg.classList.remove("rotate-90"));
                  faqDetails.classList.add('active');
                  updateFaqDetails(item);
                  updateDetailsPosition();
              }
              else {
                  faqDetails.classList.remove('active');
                  document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.remove("hide");
                  document.querySelector(".faq-item.active")?.querySelector(".mobile-answer")?.classList.add("show");
                  arrowSvg && (arrowSvg.classList.add("rotate-90"));
              }
          }
      });
  });

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', updateDetailsPosition);
  
  handleResize(); // Initial setup
}

async function get_blogs(endpoint){
    try {
        let headers = {
          
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
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
    let maxItems = Math.min(res.data.length, 4); // Ensure it doesn't exceed 4
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


let homepage_videos_endpoint = '/api/homepage/videos/active'
getHomePageVideos();
// Get and Render Videos
async function getHomePageVideos() {
    try {
        const response = await fetch(homepage_videos_endpoint);
        if (response.status == 200){
            const videos = await response.json();
            renderVideos(videos);
        }else{
            const container = document.getElementById("video-container");    
            container.classList.add("hide");
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

function renderVideos(video) {
    const container = document.getElementById("video-container");
    container.innerHTML = '';
    
    if (!video) {
        container.classList.add("hide");
        container.innerHTML = '<div class="text-center py-4">No videos available</div>';
        return;
    }
    
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.innerHTML = `
        <video controls>
            <source src="${video.video_file}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    `;
    container.appendChild(videoCard);
}
