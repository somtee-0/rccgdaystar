document.addEventListener("DOMContentLoaded", () => {
    const headerContainer = document.querySelector('[data-include-header]');

    // Default to 'hub-includes/header.html' relative to pages inside hub/
    const headerPath = headerContainer ?
        (headerContainer.getAttribute('data-include-header') || 'hub-includes/header.html') :
        'hub-includes/header.html';

    if (headerContainer) {
        fetch(headerPath)
            .then(response => {
                if (response.ok) return response.text();
                throw new Error(`Failed to load header from ${headerPath}`);
            })
            .then(html => {
                headerContainer.innerHTML = html;
                initializeHeaderEvents();
            })
            .catch(err => console.error('Header Load Error:', err));
    }
});

function initializeHeaderEvents() {
    const logoutBtn = document.getElementById('auth-logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Clear current user session
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUser');

            // Redirect to hub index page
            window.location.href = 'index.html';
        });
    }
}