document.addEventListener('DOMContentLoaded', () => {

    // 1. Tab Switching Handler
    document.querySelectorAll('.settings-tab-btn[data-tab]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.settings-tab-content').forEach(tab => tab.classList.remove('active'));

            button.classList.add('active');
            const targetTab = button.getAttribute('data-tab');
            const targetContent = document.getElementById(targetTab);

            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 2. Load Logged-in User Data Dynamically
    const currentUser = localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser') || 'default_user';
    const USER_SHOP_KEY = `shopData_${currentUser}`;

    const savedShopData = JSON.parse(localStorage.getItem(USER_SHOP_KEY)) || {};

    // Intelligently check every possible storage location including direct currentUserName
    const registeredFullName = localStorage.getItem('currentUserName') || savedShopData.ownerName || savedShopData.fullName || savedShopData.name || savedShopData.user || '';

    // Populate Personal Details Inputs dynamically
    const firstNameInput = document.getElementById('settingsFirstName');
    const lastNameInput = document.getElementById('settingsLastName');
    const birthdayInput = document.querySelector('#personal-form input[type="date"]');
    const sexSelect = document.querySelector('#personal-form select');
    const emailInput = document.getElementById('settingsEmailInput');

    if (registeredFullName && registeredFullName !== 'default_user') {
        const nameParts = registeredFullName.trim().split(' ');
        if (firstNameInput) firstNameInput.value = nameParts[0] || '';
        if (lastNameInput) lastNameInput.value = nameParts.slice(1).join(' ') || '';
    } else {
        // If no name is stored yet, leave fields completely empty for user input instead of showing placeholder text
        if (firstNameInput) firstNameInput.value = '';
        if (lastNameInput) lastNameInput.value = '';
    }

    if (birthdayInput && savedShopData.birthday) birthdayInput.value = savedShopData.birthday;
    if (sexSelect && savedShopData.sex) sexSelect.value = sexSelect.value;
    if (emailInput && (savedShopData.email || currentUser)) emailInput.value = savedShopData.email || currentUser;

    // Populate Business Details Inputs
    const bizNameInput = document.querySelector('#business-form input[type="text"]');
    const bizDescInput = document.querySelector('#business-form textarea');
    const bizPhoneInput = document.querySelector('#business-form input[type="tel"]');

    if (bizNameInput && savedShopData.name) bizNameInput.value = savedShopData.name;
    if (bizDescInput && savedShopData.category) bizDescInput.value = savedShopData.category;
    if (bizPhoneInput && savedShopData.phone) bizPhoneInput.value = savedShopData.phone;

    // 3. DOM Elements
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const updateEmailBtn = document.getElementById('updateEmailBtn');
    const businessForm = document.getElementById('business-form');
    const reviewModal = document.getElementById('reviewNoticeModal');
    const closeNoticeBtn = document.getElementById('close-notice-btn');
    const logoutLink = document.querySelector('aside.settings-sidebar-card a[href="index.html"]');
    const deleteAccountBtn = document.querySelector('#delete-account-tab button');

    // Reusable handler for save/update actions
    const handleSaveAction = (e, targetBtn, originalText) => {
        if (e) e.preventDefault();

        if (firstNameInput && lastNameInput) {
            savedShopData.ownerName = `${firstNameInput.value} ${lastNameInput.value}`.trim();
        }
        if (birthdayInput) savedShopData.birthday = birthdayInput.value;
        if (sexSelect) savedShopData.sex = sexSelect.value;
        if (bizNameInput) savedShopData.name = bizNameInput.value;
        if (bizDescInput) savedShopData.category = bizDescInput.value;
        if (bizPhoneInput) savedShopData.phone = bizPhoneInput.value;

        localStorage.setItem(USER_SHOP_KEY, JSON.stringify(savedShopData));

        if (targetBtn) {
            targetBtn.innerText = 'Saved';
            targetBtn.classList.add('disabled');
        }

        if (reviewModal) {
            reviewModal.classList.add('active');
        }

        setTimeout(() => {
            if (targetBtn) {
                targetBtn.innerText = originalText;
                targetBtn.classList.remove('disabled');
            }
        }, 2500);
    };

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (e) => handleSaveAction(e, saveProfileBtn, 'Save'));
    }

    if (updateEmailBtn) {
        updateEmailBtn.addEventListener('click', (e) => {
            if (emailInput && savedShopData) {
                savedShopData.email = emailInput.value;
                localStorage.setItem(USER_SHOP_KEY, JSON.stringify(savedShopData));
            }
            handleSaveAction(e, updateEmailBtn, 'Update Email');
        });
    }

    if (businessForm) {
        businessForm.addEventListener('submit', (e) => handleSaveAction(e, saveProfileBtn, 'Save'));
    }

    if (closeNoticeBtn) {
        closeNoticeBtn.addEventListener('click', () => {
            if (reviewModal) reviewModal.classList.remove('active');
        });
    }

    // 4. WhatsApp Verification Trigger
    const btnWhatsapp = document.getElementById('btn-whatsapp-code');
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', () => {
            alert('A 6-digit confirmation code has been sent to your WhatsApp!');
        });
    }

    // 5. Proper Logout Implementation
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // 6. Account Deletion
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            const confirmDelete = confirm('Are you sure you want to permanently delete your account? This will remove your shop from the live site.');
            if (confirmDelete) {
                savedShopData.isDeleted = true;
                localStorage.setItem(USER_SHOP_KEY, JSON.stringify(savedShopData));

                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUserEmail');
                localStorage.removeItem('currentUser');

                alert('Your account has been successfully deleted from the frontend and flagged for admin review.');
                window.location.href = 'index.html';
            }
        });
    }
});