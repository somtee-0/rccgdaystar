document.addEventListener('DOMContentLoaded', () => {

    // 1. Tab Switching Handler (Switch between settings tabs)
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
    const USER_SHOP_KEY = 'rccg_user_shop'; // Update key if your app uses a different naming convention
    const savedShopData = JSON.parse(localStorage.getItem(USER_SHOP_KEY)) || {};

    // Populate Personal Details Inputs if available
    const firstNameInput = document.querySelector('#personal-form input:nth-of-type(1)');
    const lastNameInput = document.querySelector('#personal-form input:nth-of-type(2)');
    const birthdayInput = document.querySelector('#personal-form input[type="date"]');
    const sexSelect = document.querySelector('#personal-form select');

    if (savedShopData.ownerName) {
        const nameParts = savedShopData.ownerName.trim().split(' ');
        if (firstNameInput && nameParts[0]) firstNameInput.value = nameParts[0];
        if (lastNameInput && nameParts[1]) lastNameInput.value = nameParts.slice(1).join(' ');
    }
    if (birthdayInput && savedShopData.birthday) birthdayInput.value = savedShopData.birthday;
    if (sexSelect && savedShopData.sex) sexSelect.value = savedShopData.sex;

    // Populate Business Details Inputs if available
    const bizNameInput = document.querySelector('#business-form input[type="text"]');
    const bizDescInput = document.querySelector('#business-form textarea');
    const bizPhoneInput = document.querySelector('#business-form input[type="tel"]');
    const emailInput = document.querySelector('#change-email-tab input[type="email"]');

    if (bizNameInput && savedShopData.name) bizNameInput.value = savedShopData.name;
    if (bizDescInput && savedShopData.category) bizDescInput.value = savedShopData.category;
    if (bizPhoneInput && savedShopData.phone) bizPhoneInput.value = savedShopData.phone;
    if (emailInput && savedShopData.email) emailInput.value = savedShopData.email;

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

        // Save updated inputs back to storage object
        if (firstNameInput && lastNameInput) {
            savedShopData.ownerName = `${firstNameInput.value}్రి``.trim();
        }
        if (birthdayInput) savedShopData.birthday = birthdayInput.value;
        if (sexSelect) savedShopData.sex = sexSelect.value;
        if (bizNameInput) savedShopData.name = bizNameInput.value;
        if (bizDescInput) savedShopData.category = bizDescInput.value;
        if (bizPhoneInput) savedShopData.phone = bizPhoneInput.value;
        
        localStorage.setItem(USER_SHOP_KEY, JSON.stringify(savedShopData));

        // Visual feedback on the clicked button
        if (targetBtn) {
            targetBtn.innerText = 'Saved';
            targetBtn.classList.add('disabled');
        }

        // Trigger the Admin Review Modal
        if (reviewModal) {
            reviewModal.classList.add('active');
        }

        // Reset button back to its original text after 2.5 seconds
        setTimeout(() => {
            if (targetBtn) {
                targetBtn.innerText = originalText;
                targetBtn.classList.remove('disabled');
            }
        }, 2500);
    };

    // Attach handler to Profile / Business Save Button
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (e) => handleSaveAction(e, saveProfileBtn, 'Save'));
    }

    // Attach handler to Update Email Button
    if (updateEmailBtn) {
        updateEmailBtn.addEventListener('click', (e) => {
            if (emailInput && savedShopData) {
                savedShopData.email = emailInput.value;
                localStorage.setItem(USER_SHOP_KEY, JSON.stringify(savedShopData));
            }
            handleSaveAction(e, updateEmailBtn, 'Update Email');
        });
    }

    // Attach to Form submit (if business form exists)
    if (businessForm) {
        businessForm.addEventListener('submit', (e) => handleSaveAction(e, saveProfileBtn, 'Save'));
    }

    // Close Modal Button Handler
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
            // Clear active auth/session flags while keeping records safe if needed, or clear all session tokens
            localStorage.removeItem('rccg_logged_in'); 
            // Redirect safely back to the root or landing index page
            window.location.href = 'index.html';
        });
    }

    // 6. Account Deletion (Frontend removal + Admin flag toggle)
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            const confirmDelete = confirm('Are you sure you want to permanently delete your account? This will remove your shop from the live site.');
            if (confirmDelete) {
                // Flag account as deleted/deactivated for frontend views while leaving data for admin review
                savedShopData.isDeleted = true;
                localStorage.setItem(USER_SHOP_KEY, JSON.stringify(savedShopData));
                
                // Clear user session credentials
                localStorage.removeItem('rccg_logged_in');
                
                alert('Your account has been successfully deleted from the frontend and flagged for admin review.');
                window.location.href = 'index.html';
            }
        });
    }
});