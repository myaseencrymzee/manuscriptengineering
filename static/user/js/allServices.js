let seeMoreBtn = document.getElementById('seemore-button')

window.addEventListener("resize", ()=> {
  // if(window.innerWidth < 768){
  //   seeMoreBtn.classList.add("hide");
  // }
  // else{
  //   seeMoreBtn.classList.add("hide");
  // }
})


seeMoreBtn.addEventListener('click', navigateToSpecificServicesPage);

let servicesTabLength = {
  'coaching' : 0,
  'consulting' : 0,
  'speaking' : 0,
  'courses' : 0
}

function navigateToSpecificServicesPage() {
  location.pathname = `/services/${seeMoreBtn.getAttribute('data-value')}/`
}

document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      window.location.hash = tab.value;
      
      seeMoreBtn.setAttribute('data-value', tab.value);
      console.log(servicesTabLength[tab.value] > 4)
      if(servicesTabLength[tab.value] > 4) {
        seeMoreBtn.classList.remove('visibility-hidden')
        console.log('there')
      } else {
        console.log('here')
        seeMoreBtn.classList.add('visibility-hidden')
      }
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      this.classList.add('active');

      const contentId = this.id.replace('-tab', '-content');
      document.getElementById(contentId).classList.add('active');
    });
  });

  let hashValue = getHashValue();
  document.getElementById(`${hashValue}-tab`)?.click();
});

function selectTabFromNavbar(type) {
  document.getElementById(`${type}-tab`)?.click();
  
}


let hashValueOptions = ["manuscript", "coaching", "consulting", "speaking", "courses"];

function getHashValue() {
  let hashValue = window.location.hash;
  let value;

  if (hashValue) {
      value = hashValue.substring(1);
      if (!hashValueOptions.includes(value)) {
          value = "manuscript";
      }
  } else {
      value = "manuscript";
      console.log("No hash present in URL.");
  }

  return value;
}


window.addEventListener('load', getServicesData('coaching'));
window.addEventListener('load', getServicesData('consulting'));
window.addEventListener('load', getServicesData('speaking'));
window.addEventListener('load', getServicesData('course'));

// let faqUrl = '/api/faqs?perPage=1000'
// let blogs_endpoint = '/api/blog?perPage=1000&status=published';
// window.addEventListener('load', getFaqData(faqUrl));
// window.addEventListener('load', get_blogs(blogs_endpoint));


async function getServicesData(type) {
    try {
        let response = await requestAPI(`${CONTENT_API_URL}api/${type}`, null, {}, 'GET');
        let res = await response.json();
        if(response.status == 200) {
            renderServicesData(res, type)
        } 
    }
    catch(err) {
        console.log(err);   
    }
}

function renderServicesData(responseData, type) {
    let servicesContainer = document.getElementById(`${type}-services-container`);
    servicesContainer.innerHTML = '';
    if(responseData.data.length > 4 && type == 'manuscript') {
      seeMoreBtn.classList.remove('visibility-hidden');
    }

    servicesTabLength[`${type}`] = responseData.data.length;
    
    if (responseData.data.length > 0) {
      // let maxItems = Math.min(responseData.data.length, 4); // Ensure it doesn't exceed 4
      let maxItems = responseData.data.length; 
      for (let i = 0; i < maxItems; i++) {
          let data = responseData.data[i];
          let specificServicesWrapper = document.createElement('div');
          specificServicesWrapper.classList.add('coaching-services');
          specificServicesWrapper.innerHTML = `
              <img src="${data.image}" alt="">
              <div class="main-coaching-content">
                  <h4>${data.title}</h4>
                  <span>${data.description}</span>
                  ${ type == "course"? `<a href="/course/${data.id}/videos/">Course Videos</a>` : ""}
                  
                  <div class="book-now-coaching-btns">
                      <button ${type == "courses" ? `onclick="location.pathname='/contact-us/'"` : `onclick="Calendly.initPopupWidget({url: 'https://calendly.com/alinyear2002/${type}'}`}); return false;">${type == 'courses'? 'Enroll Now' : 'Book Now'}</button>
                      <div class="img-container hide">
                          <img src="/static/web/images/userimg1.jpg" alt="" style="position: relative; right: -60px;">
                          <img src="/static/web/images/userimg2.jpg" alt="" style="position: relative; right: -40px;">
                          <img src="/static/web/images/userimg3.jpg" alt="" style="position: relative; right: -20px;">
                          <img src="/static/web/images/userimg1.jpg" alt="" style="position: relative; z-index: 1;">
                      </div>
                  </div>
              </div>
          `;
          servicesContainer.appendChild(specificServicesWrapper);
      }
  } else {
      let span = document.createElement('span');
      span.classList.add('text-center');
      span.innerHTML = 'Service Currently not available';
      servicesContainer.appendChild(span);
  }
     
}



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


let manuscripting_endpoint = `${CONTENT_API_URL}api/manuscript?perPage=1`;


async function get_manuscripts(endpoint){
    try {
        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        };
        let response = await requestAPI(endpoint, null, headers, 'GET');
        response.json().then(function(res) {
            if (response.status == 200) {
                console.log(res);
                renderManuscriptData(res.data);
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
window.addEventListener('load', get_manuscripts(manuscripting_endpoint)); 

function renderManuscriptData(data) {
    if (data.length > 0) {
      document.getElementById("manuscript-title").innerText = data[0].title;
      document.getElementById("manuscript-description").innerText = data[0].description;
      document.getElementById("manuscript-img").src = data[0].image;
      document.getElementById("no-manuscript-data").classList.add("hide");
    } else {
      document.getElementById("no-manuscript-data").classList.remove("hide");
      document.getElementById("manuscript-data").classList.add("hide");
    }
}

