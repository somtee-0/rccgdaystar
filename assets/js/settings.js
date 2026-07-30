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

    // 2. DOM Elements
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const updateEmailBtn = document.getElementById('updateEmailBtn');
    const businessForm = document.getElementById('business-form');
    const reviewModal = document.getElementById('reviewNoticeModal');
    const closeNoticeBtn = document.getElementById('close-notice-btn');

    // Reusable handler for save/update actions
    const handleSaveAction = (e, targetBtn, originalText) => {
        if (e) e.preventDefault();

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
        updateEmailBtn.addEventListener('click', (e) => handleSaveAction(e, updateEmailBtn, 'Update Email'));
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

    // 3. WhatsApp Verification Trigger
    const btnWhatsapp = document.getElementById('btn-whatsapp-code');
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', () => {
            alert('A 6-digit confirmation code has been sent to your WhatsApp!');
        });
    }
});