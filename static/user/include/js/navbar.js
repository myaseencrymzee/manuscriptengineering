var navCollapser = document.getElementById("navbarsExample05");

let previousWidth = window.innerWidth;
if (window.innerWidth < 768) {
    document.querySelector(".main-container").insertAdjacentElement("afterbegin", navCollapser);
    navCollapser.classList.add("nav-collapser");
}

window.addEventListener("resize", positionNavbarLinks);

function positionNavbarLinks() {
    var navCollapser = document.getElementById("navbarsExample05");
    if (window.innerWidth < 768 && previousWidth >= 768) {
        document.querySelector(".main-container").insertAdjacentElement("afterbegin", navCollapser);
        navCollapser.classList.add("nav-collapser");
    } else if (window.innerWidth > 768 && previousWidth <= 768) {
        document.querySelector("#navbar-collapser-container").appendChild(navCollapser);
        navCollapser.classList.remove("nav-collapser");
    }

    previousWidth = window.innerWidth;
}

positionNavbarLinks();



const navbar = document.querySelector('.navbar');
const navbarCollapse = document.querySelector('.navbar-collapse');

// Listen for Bootstrap collapse events
navbarCollapse?.addEventListener('show.bs.collapse', () => {
    document.querySelector(".main-container").classList.add('main-content-responsive');
});

navbarCollapse?.addEventListener('hide.bs.collapse', () => {
    document.querySelector(".main-container").classList.remove('main-content-responsive');
});