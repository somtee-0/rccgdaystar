document.addEventListener('DOMContentLoaded', () => {
    initHubAdvertsAndSearch();
});

async function initHubAdvertsAndSearch() {
    // Fetch adverts from MongoDB backend with local storage & fallback support
    const allAdverts = await getAllVendorAdverts();

    // Initial Display: Render 4 random adverts on page load
    renderAdvertGrid(getRandomAdverts(allAdverts, 4));

    // Prevent search form refresh
    const searchForm = document.getElementById('hubSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // --- COMPREHENSIVE MULTI-CATEGORY SYNONYM DICTIONARY ---
    const SEARCH_SYNONYMS = {
        // --- 1. GADGETS, TECH & ELECTRONICS ---
        'phone': ['iphone', 'mobile', 'smartphone', 'handset', 'gadget', 'device', 'android', 'apple', 'cellular', 'samsung'],
        'phones': ['iphone', 'mobile', 'smartphone', 'handset', 'gadget', 'device', 'android', 'apple', 'cellular', 'samsung'],
        'mobile': ['phone', 'iphone', 'smartphone', 'handset', 'gadget', 'device'],
        'iphone': ['phone', 'mobile', 'smartphone', 'apple', 'gadget', 'handset', 'ios'],
        'laptop': ['computer', 'pc', 'macbook', 'desktop', 'tech', 'computing', 'monitor'],
        'gadget': ['phone', 'laptop', 'tech', 'electronics', 'device', 'accessories'],

        // --- 2. CONSULTING, LEGAL & PROFESSIONAL SERVICES ---
        'consultant': ['consulting', 'legal', 'lawyer', 'attorney', 'barrister', 'doctor', 'accountant', 'advisory', 'professional', 'expert', 'counsel'],
        'consultants': ['consulting', 'legal', 'lawyer', 'attorney', 'barrister', 'doctor', 'accountant', 'advisory', 'professional', 'expert', 'counsel'],
        'consulting': ['consultant', 'legal', 'advisory', 'professional', 'strategy', 'lawyer', 'corporate', 'business'],
        'lawyer': ['legal', 'attorney', 'solicitor', 'barrister', 'court', 'agreement', 'contract', 'affidavit', 'consultant', 'law'],
        'doctor': ['health', 'medical', 'clinic', 'physician', 'nurse', 'wellness', 'consultant', 'healthcare', 'hospital', 'therapy'],
        'accountant': ['tax', 'audit', 'bookkeeping', 'finance', 'financial', 'accounting', 'consultant', 'cac'],

        // --- 3. FASHION, BEAUTY & APPAREL ---
        'fashion': ['tailor', 'designer', 'sewing', 'clothes', 'dress', 'apparel', 'outfit', 'wears', 'couture', 'styling', 'boutique'],
        'tailor': ['fashion', 'designer', 'sewing', 'clothes', 'dress', 'apparel', 'native', 'suit', 'shirt', 'wear', 'alteration'],
        'beauty': ['makeup', 'cosmetics', 'skincare', 'hair', 'salon', 'barber', 'nails', 'spa', 'facials', 'braids'],
        'hair': ['salon', 'stylist', 'barber', 'wigs', 'weaves', 'braids', 'beauty', 'haircut'],

        // --- 4. SKILLED TRADES, REPAIRS & UTILITIES ---
        'plumber': ['plumbing', 'pipe', 'leak', 'water', 'tap', 'sink', 'drain', 'utilities', 'fix', 'repairs', 'toilet'],
        'electrician': ['electrical', 'wiring', 'light', 'power', 'inverter', 'solar', 'socket', 'generator', 'repairs', 'maintenance'],
        'painter': ['painting', 'paint', 'wall', 'decor', 'screeding', 'interior', 'exterior', 'renovation'],
        'carpenter': ['wood', 'furniture', 'cabinet', 'wardrobe', 'door', 'woodwork', 'roofing', 'table', 'upholstery'],
        'mechanic': ['auto', 'car', 'vehicle', 'engine', 'repair', 'brake', 'servicing', 'automobile', 'mechanic'],

        // --- 5. DIGITAL, CREATIVE & TECH SKILLS ---
        'developer': ['coding', 'programmer', 'web', 'website', 'app', 'software', 'frontend', 'backend', 'tech', 'digital'],
        'designer': ['graphics', 'ui', 'ux', 'logo', 'branding', 'flyer', 'creative', 'artwork', 'graphics'],
        'photographer': ['photo', 'photography', 'video', 'videographer', 'media', 'shoot', 'studio', 'coverage', 'editing'],

        // --- 6. CATERING, FOOD & EVENT SERVICES ---
        'food': ['catering', 'restaurant', 'caterer', 'meals', 'kitchen', 'cakes', 'bakery', 'pastry', 'chef', 'cook', 'smallchops'],
        'catering': ['food', 'caterer', 'events', 'meals', 'cooking', 'chef', 'bakery', 'drinks', 'smallchops'],
        'event': ['planner', 'decoration', 'events', 'decor', 'hall', 'mc', 'dj', 'catering', 'party'],

        // --- 7. CLEANING, LOGISTICS & REAL ESTATE ---
        'cleaner': ['cleaning', 'janitorial', 'laundry', 'fumigation', 'housekeeping', 'washing', 'pest'],
        'logistics': ['delivery', 'dispatch', 'courier', 'shipping', 'haulage', 'rider', 'transport'],
        'real estate': ['property', 'house', 'apartment', 'rent', 'land', 'agent', 'realtor', 'accommodation']
    };

    // 5. Dynamic Smart Search Handler
    const searchInput = document.getElementById('hubSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const rawQuery = e.target.value.trim().toLowerCase();

            if (rawQuery === '') {
                renderAdvertGrid(getRandomAdverts(allAdverts, 4));
                return;
            }

            // Tokenize query into individual words
            const queryWords = rawQuery.split(/\s+/);

            let expandedTerms = new Set(queryWords);

            queryWords.forEach(word => {
                // Direct lookup
                if (SEARCH_SYNONYMS[word]) {
                    SEARCH_SYNONYMS[word].forEach(syn => expandedTerms.add(syn));
                }

                // Cross-reference partial key matches
                Object.keys(SEARCH_SYNONYMS).forEach(key => {
                    if (key.includes(word) || word.includes(key)) {
                        expandedTerms.add(key);
                        SEARCH_SYNONYMS[key].forEach(syn => expandedTerms.add(syn));
                    }
                });
            });

            const termList = Array.from(expandedTerms);

            // Filter adverts across all fields
            const filtered = allAdverts.filter(adv => {
                const combinedText = `${adv.title} ${adv.vendorName} ${adv.category} ${adv.description}`.toLowerCase();
                return termList.some(term => combinedText.includes(term));
            });

            renderAdvertGrid(filtered);
        });
    }
}

// --- DATABASE & LOCAL STORAGE HYBRID SCANNER ---
async function getAllVendorAdverts() {
    let combinedAdverts = [];

    // 1. Fetch live adverts from MongoDB Backend API
    try {
        const response = await fetch('https://rccgdaystar-backend.onrender.com/api/adverts');
        if (response.ok) {
            const serverAds = await response.json();
            serverAds.forEach(ad => {
                combinedAdverts.push({
                    title: ad.title || ad.adTitle,
                    vendorName: ad.vendorName || 'Verified Vendor',
                    category: ad.category || 'Verified Partner',
                    description: ad.description || ad.desc || '',
                    imageUrl: ad.imageUrl || ad.image || '../assets/images/default-ad.jpg',
                    vendorId: ad.vendorId || ad._id || 'vendor'
                });
            });
        }
    } catch (err) {
        console.warn('Backend server unreachable, falling back to local storage cache.', err);
    }

    // 2. Scan LocalStorage thoroughly for any shop data or saved adverts
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;

            const itemRaw = localStorage.getItem(key);
            if (!itemRaw) continue;

            try {
                const parsed = JSON.parse(itemRaw);

                // Check if this key holds shop data containing adverts/products
                if (key.startsWith('shopData_') && parsed) {
                    const shopName = parsed.name || parsed.ownerName || 'Verified Vendor';
                    const shopId = parsed.user || parsed.id || key.replace('shopData_', '');
                    const shopCategory = parsed.category || 'Verified Partner';

                    const shopAds = parsed.adverts || parsed.ads || parsed.products || [];
                    if (Array.isArray(shopAds)) {
                        shopAds.forEach(ad => {
                            if (ad && (ad.title || ad.adTitle || ad.name)) {
                                combinedAdverts.push({
                                    title: ad.title || ad.adTitle || ad.name,
                                    vendorName: shopName,
                                    category: ad.category || shopCategory,
                                    description: ad.description || ad.details || '',
                                    imageUrl: ad.imageUrl || ad.image || '../assets/images/default-ad.jpg',
                                    vendorId: shopId
                                });
                            }
                        });
                    }
                }
                // General array or object fallback scan
                else if (Array.isArray(parsed)) {
                    parsed.forEach(item => {
                        if (item && (item.title || item.adTitle || item.name)) {
                            combinedAdverts.push(normalizeAdvert(item, 'Verified Vendor'));
                        }
                    });
                }
            } catch (e) {
                // Skip non-JSON values
            }
        }
    } catch (err) {
        console.error("Error scanning localStorage for adverts:", err);
    }

    // --- FALLBACK DEMO DATA REMOVED ---
    // combinedAdverts will stay empty if no live or local storage adverts exist,
    // which cleanly triggers your empty state view.

    return combinedAdverts;
}

// --- HELPER: Normalize advert object ---
function normalizeAdvert(ad, fallbackVendorName, shopObject = null) {
    let rawCategory = ad.category || (shopObject ? shopObject.category : '');

    // Clean up generic category names across all industries
    if (!rawCategory || rawCategory.toLowerCase() === 'general') {
        rawCategory = 'Verified Partner';
    }

    return {
        title: ad.title || ad.adTitle || ad.name || fallbackVendorName,
        vendorName: ad.vendorName || (shopObject ? shopObject.name : fallbackVendorName),
        category: rawCategory,
        description: ad.description || ad.details || ad.tagline || '',
        imageUrl: ad.imageUrl || ad.image || '../assets/images/default-ad.jpg',
        vendorId: ad.vendorId || (shopObject ? shopObject.user || shopObject.id : 'vendor')
    };
}

// --- HELPER: Random Shuffle ---
function getRandomAdverts(advertsArray, count) {
    if (!advertsArray || advertsArray.length === 0) return [];
    const shuffled = [...advertsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

// --- HELPER: Clean Jiji-Style Clickable Cards with Auth Check ---
function renderAdvertGrid(advertsToDisplay) {
    const container = document.getElementById('hubAdvertGrid');
    if (!container) return;

    if (!advertsToDisplay || advertsToDisplay.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #ffffff; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <i class="bi bi-search" style="font-size: 2rem; color: #94a3b8;"></i>
                <h5 style="margin-top: 12px; color: #110738; font-weight: 600;">No Adverts Found</h5>
                <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Try searching for another service, consultant, or product.</p>
            </div>
        `;
        return;
    }

    // Removed <a> tag wrapper and replaced with onclick event handler
    container.innerHTML = advertsToDisplay.map(ad => `
        <div onclick="handleHubAdvertClick('${encodeURIComponent(ad.vendorId)}')" class="vendor-card visual-card" style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; height: 100%;">
            <div class="vendor-image-wrapper" style="height: 180px; width: 100%; overflow: hidden; position: relative; background: #f1f5f9;">
                <img src="${ad.imageUrl}" alt="${ad.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/images/default-ad.jpg'">
                <div class="vendor-badge" style="position: absolute; top: 12px; right: 12px; background: rgba(17, 7, 56, 0.9); backdrop-filter: blur(4px); color: #e2b74c; font-size: 0.72rem; padding: 4px 10px; border-radius: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">
                    ${ad.category}
                </div>
            </div>
            <div class="vendor-card-body" style="padding: 16px;">
                <h3 style="margin: 0 0 6px 0; font-weight: 700; color: #110738; font-size: 1.05rem; line-height: 1.3;">${ad.title}</h3>
                <p class="vendor-tagline" style="margin: 0 0 8px 0; color: #64748b; font-size: 0.82rem; font-weight: 600;">By ${ad.vendorName}</p>
                <p style="margin: 0; color: #475569; font-size: 0.85rem; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${ad.description}
                </p>
            </div>
        </div>
    `).join('');
}

// Global click function that checks auth before opening vendor store
function handleHubAdvertClick(vendorId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authModal = document.getElementById('authModal');

    if (!isLoggedIn) {
        if (authModal) {
            authModal.classList.add('active');
        } else {
            alert('Please sign in to view vendor details.');
        }
    } else {
        window.location.href = `shop.html?vendor=${vendorId}`;
    }
}