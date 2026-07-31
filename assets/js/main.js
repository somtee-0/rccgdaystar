/*=========================================
    HERO VIDEO PLAYER
=========================================*/

const playBtn = document.getElementById("playVideo");
const closeBtn = document.getElementById("closeVideo");

const heroImage = document.getElementById("heroImage");
const heroVideo = document.getElementById("heroVideo");
const youtubeVideo = document.getElementById("youtubeVideo");

if (playBtn && closeBtn && heroVideo && youtubeVideo) {

    playBtn.addEventListener("click", () => {

        const videoID = playBtn.dataset.video;

        heroImage.parentElement.classList.add("playing");

        heroVideo.classList.add("show");

        // Change this line in your main.js:
        youtubeVideo.src = `https://www.youtube-nocookie.com/embed/${videoID}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;
    });

    closeBtn.addEventListener("click", () => {

        heroImage.parentElement.classList.remove("playing");

        heroVideo.classList.remove("show");

        youtubeVideo.src = "";

    });

}

/*=========================================
    MOBILE NAVIGATION (Fixed)
=========================================*/
document.addEventListener("DOMContentLoaded", () => {

    // This forces the computer to wait until the HTML is fully drawn on the screen
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

});