document.addEventListener("DOMContentLoaded", () => {
    loadVendorFeedbacks();
});

function loadVendorFeedbacks() {
    // 1. Get logged-in user
    const currentUser = localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser') || 'default_user';
    const USER_FEEDBACK_KEY = `userFeedbacks_${currentUser}`;

    // 2. Fetch feedback array
    const feedbackList = JSON.parse(localStorage.getItem(USER_FEEDBACK_KEY)) || [];

    // 3. Target your existing right content card
    const mainCard = document.querySelector('.feedback-content-card');

    if (!mainCard) return;

    // If feedback exists, render feedback items inside the card
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

        // Re-attach copy button listener if replaced
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
    }
}