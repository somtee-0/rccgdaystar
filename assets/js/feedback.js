/* ==========================================================================
   VENDOR FEEDBACK & DYNAMIC USER PROFILE ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfileInfo();
    loadVendorFeedbacks();
});

// 1. Dynamically update user profile name and phone card (Replaces hardcoded Dwayne Henry)
function loadUserProfileInfo() {
    // Targets both IDs and classes to ensure it catches the elements successfully
    const nameHeading = document.getElementById('profileDisplayName') || document.querySelector('.user-display-name');
    const phonePara = document.getElementById('profileDisplayPhone') || document.querySelector('.user-phone-number');

    // Retrieve real user info stored during registration/login
    const currentUserName = localStorage.getItem('currentUser') || localStorage.getItem('currentUserName') || 'Church Member';
    const currentUserPhone = localStorage.getItem('currentUserPhone') || localStorage.getItem('userPhone') || 'No phone provided';

    if (nameHeading) {
        nameHeading.textContent = currentUserName;
    }
    if (phonePara) {
        phonePara.textContent = currentUserPhone;
    }
}

// 2. Load and render dynamic feedbacks or empty states
function loadVendorFeedbacks() {
    // Get logged-in user identifier
    const currentUser = localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser') || 'default_user';[cite: 6]
    const USER_FEEDBACK_KEY = `userFeedbacks_${currentUser}`;[cite: 6]

    // Fetch feedback array[cite: 6]
    const feedbackList = JSON.parse(localStorage.getItem(USER_FEEDBACK_KEY)) || [];[cite: 6]

    // Target your existing right content card[cite: 6]
    const mainCard = document.querySelector('.feedback-content-card');

    if (!mainCard) return;

    // If feedback exists, render feedback items inside the card[cite: 6]
    if (feedbackList.length > 0) {
        mainCard.innerHTML = `
            <div class="feedback-header-bar" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color, #e2e8f0);">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; margin: 0; color: var(--primary-color, #110738);">
                    <i class="bi bi-chat-square-quote-fill" style="color: var(--accent-color, #e2b74c); margin-right: 8px;"></i>Customer Feedback
                </h2>
                <button type="button" class="btn-copy-link" id="copyFeedbackBtn" style="padding: 8px 16px; font-size: 0.85rem;">
                    <i class="bi bi-link-45deg"></i> Copy link
                </button>
            </div>

            <div class="feedback-list-wrapper" style="width: 100%; text-align: left;">
                ${feedbackList.map(item => `
                    <div class="feedback-item-card" style="background: var(--bg-surface, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                            <div>
                                <h4 style="margin: 0; font-weight: 600; color: var(--primary-color, #110738); font-size: 1rem;">${item.clientName || 'Anonymous Client'}</h4>
                                <small style="color: #64748b; font-size: 0.82rem;"><i class="bi bi-telephone-fill" style="font-size: 0.75rem; margin-right: 4px;"></i> ${item.clientContact}</small>
                            </div>
                            <span style="font-size: 0.75rem; color: #94a3b8; background: #f8fafc; padding: 4px 10px; border-radius: 20px; border: 1px solid #f1f5f9;">${item.date}</span>
                        </div>
                        <p style="margin: 0; color: #334155; font-size: 0.92rem; line-height: 1.6; background: #f8fafc; padding: 12px 16px; border-radius: 8px;">
                            "${item.message}"
                        </p>
                    </div>
                `).join('')}
            </div>
        `;

        // Re-attach copy button listener if replaced[cite: 6]
        const copyBtn = document.getElementById('copyFeedbackBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                navigator.clipboard.writeText(window.location.href);
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="bi bi-check2"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        }
    } else {
        // Fallback layout when no feedback exists yet so it looks clean and dynamic
        mainCard.innerHTML = `
            <div class="feedback-header-bar" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color, #e2e8f0);">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; margin: 0; color: var(--primary-color, #110738);">
                    <i class="bi bi-chat-square-quote-fill" style="color: var(--accent-color, #e2b74c); margin-right: 8px;"></i>Customer Feedback
                </h2>
            </div>
            <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                <i class="bi bi-chat-heart" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
                <h3 style="font-size: 1.1rem; color: #334155; margin-bottom: 8px;">No customer feedback yet</h3>
                <p style="font-size: 0.9rem; margin: 0;">Share your vendor profile link with clients to start receiving reviews and feedback here.</p>
            </div>
        `;
    }
}