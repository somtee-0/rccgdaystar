document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CURRENT USER LOGIC ---
    const currentUser = localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser') || 'default_user';

    // User-specific keys
    const USER_SHOP_KEY = `shopData_${currentUser}`;
    const USER_BANNER_KEY = `shopBanner_${currentUser}`;
    const USER_LOGO_KEY = `shopLogo_${currentUser}`;

    // --- 2. ELEMENT REFERENCES ---
    const state1Card = document.getElementById('state1_RegistrationCard');
    const state2Card = document.getElementById('state2_PendingCard');
    const state3Card = document.getElementById('state3_VerifiedCard');

    const registrationForm = document.getElementById('shopRegistrationForm');
    const simulateAdminApproveBtn = document.getElementById('simulateAdminApproveBtn');
    const editPendingBtn = document.getElementById('editPendingBtn');

    const logoInput = document.getElementById('bizLogoFileInput');
    const bannerInput = document.getElementById('bannerInput');
    const bannerContainer = document.getElementById('bannerContainer');
    const vendorUploadedLogo = document.getElementById('vendorUploadedLogo');

    const logoutBtn = document.getElementById('auth-logout-btn');

    // --- 3. LOGOUT HANDLER ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUser');
            window.location.href = '../hub/index.html';
        });
    }

    // --- 4. BANNER UPLOAD HANDLER ---
    if (bannerInput && bannerContainer) {
        bannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const bannerUrl = event.target.result;
                    bannerContainer.style.backgroundImage = `url('${bannerUrl}')`;
                    bannerContainer.style.backgroundSize = 'cover';
                    bannerContainer.style.backgroundPosition = 'center';
                    localStorage.setItem(USER_BANNER_KEY, bannerUrl);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 5. LOGO UPLOAD PREVIEW HANDLER ---
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    localStorage.setItem(USER_LOGO_KEY, event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 6. REGISTRATION FORM SUBMIT ---
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const shopData = {
                user: currentUser,
                name: document.getElementById('bizNameInput').value,
                ownerName: document.getElementById('bizOwnerInput')?.value,
                category: document.getElementById('bizCategoryInput').value,
                location: document.getElementById('bizLocationInput').value,
                phone: document.getElementById('bizPhoneInput').value,
                email: document.getElementById('bizEmailInput').value,
                whatsapp: document.getElementById('bizWhatsappInput').value,
                social: document.getElementById('bizSocialInput').value,
                experience: document.getElementById('bizExperienceInput')?.value || '1 Year',
                memberSince: new Date().getFullYear().toString(),
                status: 'pending'
            };

            localStorage.setItem(USER_SHOP_KEY, JSON.stringify(shopData));
            showNoticeModal('Submission Received', 'Your business details have been sent for review!');
            loadShopState();
        });
    }

    // --- 7. ADMIN APPROVAL SIMULATION ---
    if (simulateAdminApproveBtn) {
        simulateAdminApproveBtn.addEventListener('click', () => {
            let shopData = JSON.parse(localStorage.getItem(USER_SHOP_KEY)) || {};
            shopData.status = 'verified';
            localStorage.setItem(USER_SHOP_KEY, JSON.stringify(shopData));
            loadShopState();
        });
    }

    // --- 8. EDIT PENDING DETAILS ---
    if (editPendingBtn) {
        editPendingBtn.addEventListener('click', () => {
            let shopData = JSON.parse(localStorage.getItem(USER_SHOP_KEY)) || {};
            shopData.status = 'draft';
            localStorage.setItem(USER_SHOP_KEY, JSON.stringify(shopData));
            loadShopState();
        });
    }

    // --- 9. RENDER USER / PUBLIC ADVERTS (UPDATED FOR MONGODB SYNC) ---
    async function renderShopAdverts(targetUser) {
        const emptyAdvertsBox = document.getElementById('emptyAdvertsBox');
        const activeAdvertsGrid = document.getElementById('activeAdvertsGrid');

        if (!activeAdvertsGrid || !emptyAdvertsBox) return;

        let validAdverts = [];

        try {
            const response = await fetch('https://rccgdaystar-backend.onrender.com/api/adverts');
            if (response.ok) {
                const serverAds = await response.json();
                validAdverts = serverAds.filter(ad => {
                    // Strict check: Must match the vendorId or user stamp exactly
                    return ad.vendorId === targetUser || ad.user === targetUser;
                });
            }
        } catch (err) {
            console.warn('Backend server unreachable, falling back to local storage adverts.', err);
        }

        // Fallback to localStorage if backend didn't yield items for this specific vendor
        if (validAdverts.length === 0) {
            const allAdverts =
                JSON.parse(localStorage.getItem(`userAdverts_${targetUser}`)) ||
                JSON.parse(localStorage.getItem('userAdverts')) ||
                JSON.parse(localStorage.getItem('adverts')) || [];

            validAdverts = allAdverts.filter(ad => {
                if (!ad) return false;
                const belongsToUser = !ad.user || ad.user === targetUser || ad.vendorId === targetUser;
                const hasImage = ad.image || ad.imageUrl || ad.img || ad.src || typeof ad === 'string';
                return belongsToUser && hasImage;
            });
        }

        if (validAdverts.length > 0) {
            emptyAdvertsBox.style.setProperty('display', 'none', 'important');
            activeAdvertsGrid.style.setProperty('display', 'grid', 'important');

            activeAdvertsGrid.innerHTML = validAdverts.slice(0, 4).map((ad, idx) => {
                const imgSrc = typeof ad === 'string' ? ad : (ad.imageUrl || ad.image || ad.img || ad.src || '../assets/images/default-ad.jpg');
                const title = typeof ad === 'object' ? (ad.title || ad.adTitle || `Advert #${idx + 1}`) : `Advert #${idx + 1}`;
                const category = typeof ad === 'object' ? (ad.category || 'Featured') : 'Featured';

                return `
                    <div class="vendor-ad-card" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="width: 100%; height: 160px; overflow: hidden; background: #f8f9fa;">
                            <img src="${imgSrc}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/images/default-ad.jpg'">
                        </div>
                        <div style="padding: 12px;">
                            <h5 style="font-size: 0.95rem; font-weight: 600; color: #110738; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</h5>
                            <span style="font-size: 0.75rem; color: #e2b74c; font-weight: 600; text-transform: uppercase;">${category}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            emptyAdvertsBox.style.setProperty('display', 'flex', 'important');
            activeAdvertsGrid.style.setProperty('display', 'none', 'important');
        }
    }

    // --- 10. DYNAMIC STATE LOADER (UPDATED FOR MONGODB VENDOR RESOLUTION) ---
    async function loadShopState() {
        const urlParams = new URLSearchParams(window.location.search);
        const requestedVendorId = urlParams.get('vendor');
        const isShopPage = window.location.pathname.includes('shop.html');

        // SCENARIO A: VISITING A PUBLIC VENDOR PROFILE VIA URL (?vendor=...)
        if (requestedVendorId && requestedVendorId === currentUser) {
            let vendorShopData = JSON.parse(localStorage.getItem(`shopData_${requestedVendorId}`));

            // If not found in localStorage, attempt to fetch vendor details from MongoDB backend API
            if (!vendorShopData) {
                try {
                    const res = await fetch(`https://rccgdaystar-backend.onrender.com/api/adverts`);
                    if (res.ok) {
                        const allAds = await res.json();
                        const foundAd = allAds.find(a => a.vendorId === requestedVendorId || a._id === requestedVendorId);
                        if (foundAd) {
                            vendorShopData = {
                                name: foundAd.vendorName || 'Verified Vendor',
                                ownerName: foundAd.vendorName || 'Verified Vendor',
                                category: foundAd.category || 'Verified Partner',
                                location: foundAd.location || 'RCCG Daystar Hub',
                                phone: foundAd.phone || 'N/A',
                                email: foundAd.email || 'N/A',
                                whatsapp: foundAd.whatsapp || '',
                                social: foundAd.social || '#',
                                experience: foundAd.experience || 'Verified Partner'
                            };
                        }
                    }
                } catch (e) {
                    console.warn('Could not fetch vendor info from server fallback', e);
                }
            }

            // CLEAN 404 STATE: If the vendor still does not exist anywhere, display clean error
            if (!vendorShopData) {
                if (isShopPage) {
                    const mainContainer = document.querySelector('.shop-setup-section .container') || document.body;
                    mainContainer.innerHTML = `
                        <div style="text-align: center; padding: 80px 20px; font-family: inherit;">
                            <i class="bi bi-shop-window" style="font-size: 3.5rem; color: #cbd5e1; display: block; margin-bottom: 16px;"></i>
                            <h2 style="color: #110738; font-size: 1.5rem; margin-bottom: 8px;">Shop Not Found</h2>
                            <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">The vendor profile you are trying to view does not exist or has not been registered.</p>
                            <a href="index.html" style="background: #110738; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; display: inline-block;">Return to Hub</a>
                        </div>
                    `;
                }
                return;
            }

            const vendorBanner = localStorage.getItem(`shopBanner_${requestedVendorId}`);
            const vendorLogo = localStorage.getItem(`shopLogo_${requestedVendorId}`);

            // Force Storefront view (State 3) only if on shop.html
            if (isShopPage) {
                if (state1Card) state1Card.style.display = 'none';
                if (state2Card) state2Card.style.display = 'none';
                if (state3Card) state3Card.style.display = 'block';
            }

            // Populate Public Header & Details
            const titleEl = document.getElementById('displayShopTitle') || document.getElementById('verifiedBizName');
            const tagEl = document.getElementById('displayShopTagline') || document.getElementById('verifiedCategory');
            const ownerEl = document.getElementById('detailOwnerName');
            if (ownerEl) {
                ownerEl.textContent = vendorShopData?.ownerName || vendorShopData?.name || requestedVendorId || 'N/A';
            }

            if (titleEl) titleEl.textContent = vendorShopData.name;
            if (tagEl) tagEl.textContent = vendorShopData.category;

            const locEl = document.getElementById('verifiedLocation') || document.getElementById('displayShopLocation');
            if (locEl) locEl.textContent = vendorShopData.location || 'RCCG Daystar Hub';

            if (vendorBanner && bannerContainer) {
                bannerContainer.style.backgroundImage = `url('${vendorBanner}')`;
                bannerContainer.style.backgroundSize = 'cover';
            }

            if (vendorLogo && vendorUploadedLogo) {
                vendorUploadedLogo.src = vendorLogo;
            }

            await renderShopAdverts(requestedVendorId);
            return;
        }

        // SCENARIO B: LOGGED IN USER'S OWN DASHBOARD LOGIC
        const shopData = JSON.parse(localStorage.getItem(USER_SHOP_KEY));
        const savedBanner = localStorage.getItem(USER_BANNER_KEY);
        const savedLogo = localStorage.getItem(USER_LOGO_KEY);

        if (savedBanner && bannerContainer) {
            bannerContainer.style.backgroundImage = `url('${savedBanner}')`;
            bannerContainer.style.backgroundSize = 'cover';
        }

        if (!shopData || shopData.status === 'draft') {
            if (isShopPage) {
                if (state1Card) state1Card.style.display = 'block';
                if (state2Card) state2Card.style.display = 'none';
                if (state3Card) state3Card.style.display = 'none';
            }
        } else if (shopData.status === 'pending') {
            if (isShopPage) {
                if (state1Card) state1Card.style.display = 'none';
                if (state2Card) state2Card.style.display = 'block';
                if (state3Card) state3Card.style.display = 'none';
            }
            if (document.getElementById('pendingBizName')) document.getElementById('pendingBizName').textContent = shopData.name;
            if (document.getElementById('pendingCategory')) document.getElementById('pendingCategory').textContent = shopData.category;
            if (document.getElementById('pendingLocation')) document.getElementById('pendingLocation').textContent = shopData.location;
            if (document.getElementById('pendingPhone')) document.getElementById('pendingPhone').textContent = shopData.phone;
            if (document.getElementById('pendingEmail')) document.getElementById('pendingEmail').textContent = shopData.email;
        } else if (shopData.status === 'verified') {
            if (isShopPage) {
                if (state1Card) state1Card.style.display = 'none';
                if (state2Card) state2Card.style.display = 'none';
                if (state3Card) state3Card.style.display = 'block';
            }

            if (document.getElementById('verifiedBizName')) document.getElementById('verifiedBizName').textContent = shopData.name;
            if (document.getElementById('detailBizName')) document.getElementById('detailBizName').textContent = shopData.name;

            // ADD THIS LINE TO FIX THE OWNER NAME:
            const detailOwnerEl = document.getElementById('detailOwnerName');
            if (detailOwnerEl) detailOwnerEl.textContent = shopData.ownerName || 'N/A';

            if (document.getElementById('verifiedLocation')) document.getElementById('verifiedLocation').textContent = shopData.location;
            if (document.getElementById('verifiedCategory')) document.getElementById('verifiedCategory').textContent = shopData.category;

            const expEl = document.getElementById('verifiedExperience');
            if (expEl) expEl.textContent = shopData.experience || '1 Year';

            if (document.getElementById('verifiedWhatsappLink')) document.getElementById('verifiedWhatsappLink').href = `https://wa.me/${shopData.whatsapp}`;
            if (document.getElementById('verifiedPhoneLink')) document.getElementById('verifiedPhoneLink').href = `tel:${shopData.phone}`;
            if (document.getElementById('verifiedEmailLink')) document.getElementById('verifiedEmailLink').href = `mailto:${shopData.email}`;
            if (document.getElementById('verifiedSocialLink')) document.getElementById('verifiedSocialLink').href = shopData.social || '#';

            if (savedLogo && vendorUploadedLogo) vendorUploadedLogo.src = savedLogo;

            await renderShopAdverts(currentUser);
        }
    }

    function showNoticeModal(title, message) {
        const modal = document.getElementById('shopReviewModal');
        const modalTitle = document.getElementById('modalNoticeTitle');
        const modalBody = document.getElementById('modalNoticeBody');
        const closeBtn = document.getElementById('closeShopModalBtn');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.textContent = message;
            modal.style.display = 'block';

            if (closeBtn) {
                closeBtn.onclick = () => { modal.style.display = 'none'; };
            }
        }
    }

    loadShopState();
});

// --- 11. GLOBAL SHOP OWNER BADGE ROUTER ---
function handleShopOwnerClick() {
    if (!window.location.pathname.includes('shop.html')) {
        window.location.href = 'shop.html';
        return;
    }

    const currentUser = localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser') || 'default_user';
    const shopData = JSON.parse(localStorage.getItem(`shopData_${currentUser}`));

    const state1Card = document.getElementById('state1_RegistrationCard');
    const state2Card = document.getElementById('state2_PendingCard');
    const state3Card = document.getElementById('state3_VerifiedCard');

    if (shopData && shopData.status === 'verified') {
        if (state1Card) state1Card.style.display = 'none';
        if (state2Card) state2Card.style.display = 'none';
        if (state3Card) {
            state3Card.style.display = 'block';
            state3Card.scrollIntoView({ behavior: 'smooth' });
        }
    } else if (shopData && shopData.status === 'pending') {
        if (state1Card) state1Card.style.display = 'none';
        if (state3Card) state3Card.style.display = 'none';
        if (state2Card) {
            state2Card.style.display = 'block';
            state2Card.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        if (state2Card) state2Card.style.display = 'none';
        if (state3Card) state3Card.style.display = 'none';
        if (state1Card) {
            state1Card.style.display = 'block';
            state1Card.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// --- CLIENT FEEDBACK MODAL LOGIC ---
const openFeedbackBtn = document.getElementById('openClientFeedbackBtn');
const closeFeedbackBtn = document.getElementById('closeFeedbackModalBtn');
const feedbackModal = document.getElementById('clientFeedbackModal');
const feedbackForm = document.getElementById('clientFeedbackForm');

if (openFeedbackBtn && feedbackModal) {
    openFeedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'flex';
    });
}

if (closeFeedbackBtn && feedbackModal) {
    closeFeedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
    });
}

if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Check if viewing a public vendor profile via URL parameter, otherwise default to logged-in user
        const urlParams = new URLSearchParams(window.location.search);
        const requestedVendorId = urlParams.get('vendor');
        const targetUser = requestedVendorId || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser') || 'default_user';

        const USER_FEEDBACK_KEY = `userFeedbacks_${targetUser}`;

        const newFeedback = {
            id: 'fb-' + Date.now(),
            clientName: document.getElementById('feedbackClientName').value,
            clientContact: document.getElementById('feedbackClientContact').value || 'N/A',
            message: document.getElementById('feedbackClientMessage').value,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Verified'
        };

        let existingFeedback = JSON.parse(localStorage.getItem(USER_FEEDBACK_KEY)) || [];
        existingFeedback.unshift(newFeedback);

        localStorage.setItem(USER_FEEDBACK_KEY, JSON.stringify(existingFeedback));

        alert('Thank you! Your feedback has been submitted to the vendor.');
        feedbackForm.reset();
        feedbackModal.style.display = 'none';
    });
}