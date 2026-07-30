function loadInclude(id, file) {

    fetch(file)

        .then(response => {

            if (!response.ok) {

                throw new Error("Unable to load " + file);

            }

            return response.text();

        })

        .then(data => {

            document.getElementById(id).innerHTML = data;

            // --- ADD THIS PIECE OF CODE RIGHT HERE ---
            // If we just loaded the header, immediately activate the mobile navigation buttons
            if (id === "header") {
                initializeMobileNav();
            }

        })

        .catch(error => console.error(error));

}

// New helper function that runs your menu logic safely the second the header exists
function initializeMobileNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
        console.log("Mobile navigation linked successfully!");
    }
}

loadInclude("header", "/includes/header/");
loadInclude("footer", "/includes/footer/");