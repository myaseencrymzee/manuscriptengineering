let id = document.getElementById("id").textContent || null;

window.addEventListener("resize", ()=> {
  // if(window.innerWidth < 768){
  //   seeMoreBtn.classList.add("hide");
  // }
  // else{
  //   seeMoreBtn.classList.add("hide");
  // }
})


window.addEventListener('load', getServicesData);

async function getServicesData() {
    try {
        let response = await requestAPI(`/api/course/${id}`, null, {}, 'GET');
        let res = await response.json();
        if(response.status == 200) {
            console.log(res)
            renderServicesData(res)
        } 
    }
    catch(err) {
        console.log(err);   
    }
}

function renderServicesData(responseData, type) {
  console.log(type)
    let videos_container = document.querySelector(`.videos-container`);
    videos_container.innerHTML = '';

    let videos = responseData.videos;
    if (videos.length == 0) {
        let span = document.createElement('span');
        span.classList.add('text-center');
        span.innerHTML = 'No videos currently available';
        videos_container.appendChild(span);
    }



    videos.forEach(video => {
        let video_card = document.createElement("div");
        video_card.classList.add("video-card")
        video_card.innerHTML = `<video controls="">
                                    <source src="${video.video_file}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>`;
        videos_container.appendChild(video_card)
    });
}
