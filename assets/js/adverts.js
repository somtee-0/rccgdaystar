document.addEventListener('DOMContentLoaded', () => {
    // --- 0. USER & LOCALSTORAGE KEYS ---
    const currentUser = localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUser') || 'default_user';
    const USER_SHOP_KEY = `shopData_${currentUser}`;
    const USER_LOGO_KEY = `shopLogo_${currentUser}`;

    // --- DOM REFERENCES ---
    const toggleAdFormBtn = document.getElementById('toggleAdFormBtn');
    const cancelAdFormBtn = document.getElementById('cancelAdFormBtn');
    const uploadAdFormCard = document.getElementById('uploadAdFormCard');
    const createAdvertForm = document.getElementById('createAdvertForm');
    const adImageInput = document.getElementById('adImageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const vendorAdvertsGrid = document.getElementById('vendorAdvertsGrid');
    const searchInput = document.getElementById('searchAdvertsInput');

    let uploadedFiles = [];

    // --- 1. HYDRATE HEADER FROM GENESIS SHOP DATA ---
    function hydrateVendorHeader() {
        const shopData = JSON.parse(localStorage.getItem(USER_SHOP_KEY));
        const savedLogo = localStorage.getItem(USER_LOGO_KEY);

        // Update Store Name & Category
        const nameHeading = document.querySelector('.advert-header-title') || document.querySelector('h1') || document.querySelector('h2');
        if (shopData && nameHeading) {
            nameHeading.textContent = shopData.name;
        }

        // Replace Purple Icon with Actual Uploaded Logo
        if (savedLogo) {
            const logoBox = document.querySelector('.advert-header-logo-box') || document.querySelector('.shop-logo-box');
            if (logoBox) {
                logoBox.innerHTML = `<img src="${savedLogo}" alt="Business Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
            }
        }
    }

    // --- 2. LOAD EXISTING ADVERTS FROM MONGO DB ---
    async function loadExistingAdverts() {
        if (!vendorAdvertsGrid) return;
        vendorAdvertsGrid.innerHTML = ''; // Clear default markup

        try {
            const response = await fetch('http://localhost:5000/api/adverts');
            const savedAds = await response.json();

            savedAds.forEach(ad => {
                const formattedAd = {
                    id: ad._id,
                    title: ad.title,
                    price: ad.price || 'Contact for price',
                    desc: ad.description || ad.desc,
                    image: ad.imageUrl || ad.image || 'https://via.placeholder.com/300'
                };
                renderAdvertCard(formattedAd, false);
            });
            updateAdvertCount();
        } catch (error) {
            console.error('Error fetching adverts from database:', error);
        }
    }

    // --- 3. TOGGLE FORM VISIBILITY ---
    if (toggleAdFormBtn && uploadAdFormCard) {
        toggleAdFormBtn.addEventListener('click', () => {
            uploadAdFormCard.style.display =
                uploadAdFormCard.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (cancelAdFormBtn && uploadAdFormCard) {
        cancelAdFormBtn.addEventListener('click', () => {
            uploadAdFormCard.style.display = 'none';
            resetFormState();
        });
    }

    // --- 4. HANDLE MULTI-IMAGE SELECTION ---
    if (adImageInput) {
        adImageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);

            files.forEach(file => {
                if (file.type.startsWith('image/') && uploadedFiles.length < 4) {
                    uploadedFiles.push(file);
                }
            });

            if (uploadedFiles.length >= 4) {
                alert('Maximum 4 images allowed per advert.');
            }

            renderPreviews();
        });
    }

    function renderPreviews() {
        if (!imagePreviewContainer) return;
        imagePreviewContainer.innerHTML = '';
        uploadedFiles.forEach((file, idx) => {
            const imgUrl = URL.createObjectURL(file);
            const thumb = document.createElement('div');
            thumb.className = 'preview-thumb-box';
            thumb.innerHTML = `
                <img src="${imgUrl}" alt="Preview ${idx + 1}">
                <button type="button" class="btn-remove-thumb" onclick="removeImage(${idx})">
                    <i class="bi bi-x"></i>
                </button>
            `;
            imagePreviewContainer.appendChild(thumb);
        });
    }

    window.removeImage = function (index) {
        uploadedFiles.splice(index, 1);
        renderPreviews();
    };

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // --- 5. FORM SUBMISSION (POST to MongoDB) ---
    if (createAdvertForm) {
        createAdvertForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (uploadedFiles.length === 0) {
                alert('Please upload at least 1 image for your advert.');
                return;
            }

            const title = document.getElementById('adTitle').value;
            const price = document.getElementById('adPrice').value || 'Contact for price';
            const desc = document.getElementById('adDesc').value;

            for (let index = 0; index < uploadedFiles.length; index++) {
                const base64Img = await fileToBase64(uploadedFiles[index]);

                const advertPayload = {
                    title: uploadedFiles.length > 1 ? `${title} (${index + 1})` : title,
                    description: desc,
                    price: price,
                    imageUrl: base64Img,
                    category: 'General'
                };

                try {
                    const response = await fetch('http://localhost:5000/api/adverts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(advertPayload)
                    });

                    if (response.ok) {
                        const savedAd = await response.json();
                        const formattedAd = {
                            id: savedAd._id,
                            title: savedAd.title,
                            price: savedAd.price || price,
                            desc: savedAd.description,
                            image: savedAd.imageUrl
                        };
                        renderAdvertCard(formattedAd, true);
                    } else {
                        alert('Failed to save advert to database.');
                    }
                } catch (error) {
                    console.error('Error posting advert:', error);
                }
            }

            updateAdvertCount();
            resetFormState();
            uploadAdFormCard.style.display = 'none';
        });
    }

    // Render individual card layout
    function renderAdvertCard(ad, prepend = false) {
        const cardHTML = `
            <div class="ad-card" data-id="${ad.id}">
                <div class="ad-image-container">
                    <span class="ad-status-badge"><i class="bi bi-record-fill"></i> Active</span>
                    <img src="${ad.image}" alt="${ad.title}">
                </div>

                <div class="ad-body">
                    <h4 class="ad-title">${ad.title}</h4>
                    <p class="ad-desc">${ad.desc}</p>
                    <div class="ad-footer">
                        <div class="ad-price-tag">
                            <strong>${ad.price}</strong>
                        </div>
                        <button type="button" class="btn-delete-ad" onclick="deleteAdvert('${ad.id}')">
                            <i class="bi bi-trash3-fill"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (prepend) {
            vendorAdvertsGrid.insertAdjacentHTML('afterbegin', cardHTML);
        } else {
            vendorAdvertsGrid.insertAdjacentHTML('beforeend', cardHTML);
        }
    }

    function resetFormState() {
        if (createAdvertForm) createAdvertForm.reset();
        uploadedFiles = [];
        if (imagePreviewContainer) imagePreviewContainer.innerHTML = '';
    }

    // --- 6. SEARCH FILTER ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = vendorAdvertsGrid.querySelectorAll('.ad-card');
            cards.forEach(card => {
                const title = card.querySelector('.ad-title').innerText.toLowerCase();
                const desc = card.querySelector('.ad-desc').innerText.toLowerCase();
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Initialize Page
    hydrateVendorHeader();
    loadExistingAdverts();
});

function updateAdvertCount() {
    const grid = document.getElementById('vendorAdvertsGrid');
    const catCountAll = document.getElementById('catCountAll');
    if (!grid) return;

    const total = grid.querySelectorAll('.ad-card').length;
    if (catCountAll) catCountAll.innerText = `(${total})`;
}

// Global Delete Function (Cleans up DOM & MongoDB)
async function deleteAdvert(adId) {
    if (confirm('Are you sure you want to delete this advert listing?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/adverts/${adId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const adCard = document.querySelector(`[data-id="${adId}"]`);
                if (adCard) {
                    adCard.remove();
                    updateAdvertCount();
                }
            } else {
                alert('Failed to delete advert from database.');
            }
        } catch (error) {
            console.error('Error deleting advert:', error);
        }
    }
}