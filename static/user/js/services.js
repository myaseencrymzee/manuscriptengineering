const type = JSON.parse(document.getElementById('type').textContent);
let servicesContainer = document.getElementById('coaching-services-container');

window.addEventListener('load', getServicesData(type));


async function getServicesData(type) {
    try {
        let response = await requestAPI(`/api/${type}?perPage=1000`, null, {}, 'GET');
        let res = await response.json();
        if(response.status == 200) {
            renderServicesData(res)
        } 
    }
    catch(err) {
        console.log(err);   
    }
}


function renderServicesData(responseData) {
    
    servicesContainer.innerHTML = '';
    
    if (responseData.data.length > 0) {
      for (let i = 0; i < responseData.data.length; i++) {
          let data = responseData.data[i];
          let specificServicesWrapper = document.createElement('div');
          specificServicesWrapper.classList.add('coaching-services');
          specificServicesWrapper.innerHTML = `
              <img src="${data.image}" alt="">
              <div class="main-coaching-content">
                  <h4>${data.title}</h4>
                  <span>${data.description}</span>
                  <div class="book-now-coaching-btns">
                      <button onclick="location.pathname = '/book-now/'">Book Now</button>
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


