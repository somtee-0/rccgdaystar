/* ==========================================================================
   DAYSTAR CHURCH HUB ENGINE ACTIONS & GATEWAY CONTROLS
   ========================================================================== */

// Initialize Scroll Animations Safely
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        once: true
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. AUTH & NAVIGATION STATE ENGINE
    // -------------------------------------------------------------
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const guestNav = document.getElementById('nav-guest-state');
    const userNav = document.getElementById('nav-user-state');

    const authModal = document.getElementById('authModal');
    const credentialModal = document.getElementById('credentialModal');
    const registerGateModal = document.getElementById('registerGateModal');
    const registerFormModal = document.getElementById('registerFormModal');
    const logoutBtn = document.getElementById('auth-logout-btn');

    function refreshNavigationUI() {
        if (isLoggedIn) {
            if (guestNav) guestNav.style.setProperty('display', 'none', 'important');
            if (userNav) userNav.style.setProperty('display', 'flex', 'important');
        } else {
            if (guestNav) guestNav.style.setProperty('display', 'flex', 'important');
            if (userNav) userNav.style.setProperty('display', 'none', 'important');
        }
    }
    refreshNavigationUI();

    // -------------------------------------------------------------
    // 2. MODAL FLOW LOGIC
    // -------------------------------------------------------------
    function closeAllModals() {
        document.querySelectorAll('.hub-modal-overlay, #authModal, #credentialModal, #registerGateModal, #registerFormModal').forEach(m => {
            m.classList.remove('active');
        });
    }

    const triggerEmailPhone = document.getElementById('triggerEmailPhone');
    if (triggerEmailPhone) {
        triggerEmailPhone.addEventListener('click', () => {
            closeAllModals();
            if (credentialModal) credentialModal.classList.add('active');
        });
    }

    const triggerRegisterForm = document.getElementById('triggerRegisterForm');
    if (triggerRegisterForm) {
        triggerRegisterForm.addEventListener('click', () => {
            closeAllModals();
            if (registerFormModal) registerFormModal.classList.add('active');
        });
    }

    document.querySelectorAll('.open-signin-flow').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            if (authModal) authModal.classList.add('active');
        });
    });

    document.querySelectorAll('.open-register-flow').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            if (registerGateModal) registerGateModal.classList.add('active');
        });
    });

    document.querySelectorAll('.close-btn, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('hub-modal-overlay')) {
            closeAllModals();
        }
    });

    document.querySelectorAll('.password-toggle-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const inputField = this.parentElement.querySelector('input');
            if (inputField) {
                const isPassword = inputField.getAttribute('type') === 'password';
                inputField.setAttribute('type', isPassword ? 'text' : 'password');
                this.classList.toggle('bi-eye');
                this.classList.toggle('bi-eye-slash');
            }
        });
    });

    // -------------------------------------------------------------
    // 3. AUTH FORM SUBMISSIONS (CONNECTED TO BACKEND)
    // -------------------------------------------------------------
    const signinForm = document.getElementById('signin-credentials-form') || document.querySelector('#credentialModal form');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputField = signinForm.querySelector('input[type="email"], input[type="text"], input:not([type="password"])') || document.getElementById('signinEmail');
            const passwordInput = signinForm.querySelector('input[type="password"]') || document.getElementById('signinPassword');

            const emailOrPhone = inputField ? inputField.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            try {
                const response = await fetch('https://rccgdaystar-backend.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emailOrPhone, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUserEmail', data.user.email);
                    localStorage.setItem('currentUser', data.user.name || data.user.email);
                    localStorage.setItem('currentUserPhone', data.user.phone || 'No phone provided');

                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                    }

                    isLoggedIn = true;
                    closeAllModals();
                    refreshNavigationUI();
                    window.location.reload();
                } else {
                    alert(data.error || 'Invalid email/phone or password');
                }
            } catch (error) {
                console.error('Login network error:', error);
                alert('Unable to connect to the server. Please try again.');
            }
        });
    }

    const registerForm = document.getElementById('register-full-form') || document.querySelector('#registerFormModal form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = registerForm.querySelector('input[type="email"]');
            const passwordInput = registerForm.querySelector('input[type="password"]');
            const textInputs = registerForm.querySelectorAll('input[type="text"]');
            const phoneInput = registerForm.querySelector('input[type="tel"]');

            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const password = passwordInput ? passwordInput.value : '';

            const firstName = textInputs[0] ? textInputs[0].value.trim() : '';
            const lastName = textInputs[1] ? textInputs[1].value.trim() : '';
            const name = `${firstName} ${lastName}`.trim();

            const phone = phoneInput ? phoneInput.value.trim() : '';

            try {
                const response = await fetch('https://rccgdaystar-backend.onrender.com/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUserEmail', email);
                    localStorage.setItem('currentUser', name || email);

                    isLoggedIn = true;
                    registerForm.reset();
                    closeAllModals();
                    refreshNavigationUI();
                    window.location.reload();
                } else {
                    alert(data.error || 'Registration failed.');
                }
            } catch (error) {
                console.error('Registration network error:', error);
                alert('Unable to connect to the server.');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            isLoggedIn = false;
            refreshNavigationUI();
            window.location.reload();
        });
    }

    // -------------------------------------------------------------
    // 4. ADVERT CARD CLICK HANDLER
    // -------------------------------------------------------------
    const cards = document.querySelectorAll('.vendor-card-click');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (!isLoggedIn) {
                if (authModal) authModal.classList.add('active');
            } else {
                const vendorTarget = card.getAttribute('data-vendor') || 'somxpress';
                window.location.href = `shop.html?view=${vendorTarget}`;
            }
        });
    });

    // -------------------------------------------------------------
    // 5. HUB SEARCH FILTER
    // -------------------------------------------------------------
    const searchForm = document.querySelector('.hub-search-box');
    const searchInput = document.getElementById('hub-search-input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();

            if (!query) {
                cards.forEach(card => card.style.display = 'block');
                return;
            }

            cards.forEach(card => {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const tags = (card.getAttribute('data-tags') || '').toLowerCase();
                const cardText = card.innerText.toLowerCase();

                if (title.includes(query) || tags.includes(query) || cardText.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});