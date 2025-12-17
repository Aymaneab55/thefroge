// ===== CONFIGURATION =====
const CONFIG = {
    API_KEY: "3b17a09c1ca2bba2d52ffadab4894374",
    USER_ID: "504359",
    API_URL: "https://d1y3y09sav47f5.cloudfront.net/public/offers/feed.php",
    MAX_SELECTIONS: 3,
    ACTIVE_USERS_INTERVAL: 4500
};

// ===== STATE MANAGEMENT =====
const State = { popupOpen: false, selectedItems: [] };

// ===== UTILITY FUNCTIONS =====
const Utils = {
    randomUsers: () => Math.floor(Math.random() * (900 - 90 + 1)) + 90,
    playSound: (soundId) => {
        const sound = document.getElementById(soundId);
        if (sound) { sound.currentTime = 0; sound.play().catch(() => {}); }
    },
    escapeHtml: (text) => { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
};

/* ==== LIGHT PROTECTION ==== */
document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault(); return false;
    }
});
console.log('%c⚠️ STOP!', 'color: red; font-size: 50px; font-weight: bold;');
console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your account.', 'color: red; font-size: 16px;');
console.log('%c© 2024 The Forge Landing Page. All rights reserved. Unauthorized copying is prohibited.', 'color: #d4511a; font-size: 14px;');

// ===== ACTIVE USERS =====
function updateActiveUsers() {
    const countElement = document.getElementById('activeUsersCount');
    if (countElement) { countElement.textContent = Utils.randomUsers() + " Smiths Online"; }
}
updateActiveUsers();
setInterval(updateActiveUsers, CONFIG.ACTIVE_USERS_INTERVAL);

// ===== LOCKER SYSTEM (unchanged core) =====
const LockerSystem = {
    open: function(username, itemName, itemImages) {
        State.popupOpen = true;
        document.body.classList.add('no-scroll');
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) { continueBtn.style.display = 'none'; }
        const locker = document.getElementById("locker");
        if (locker) { locker.style.display = "flex"; }
        const selectedItemsPreview = document.getElementById("selectedItemsPreview");
        if (selectedItemsPreview) {
            selectedItemsPreview.innerHTML = '';
            itemImages.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc; img.className = 'selected-item-preview'; img.alt = 'Selected Item';
                selectedItemsPreview.appendChild(img);
            });
        }
        this.loadOffers();
    },
    loadOffers: function() {
        const offersList = document.getElementById("offersList");
        if (!offersList) return;
        offersList.innerHTML = "<div style='color: #fff; text-align: center; padding: 15px; font-size: 0.75em;'>Loading offers...</div>";
        const apiUrl = `${CONFIG.API_URL}?user_id=${CONFIG.USER_ID}&api_key=${CONFIG.API_KEY}&s1=the%20forge&s2=`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        fetch(apiUrl, { signal: controller.signal })
        .then(res => res.json())
        .then(offers => {
            clearTimeout(timeoutId);
            if (!offers || !Array.isArray(offers) || offers.length === 0) { this.showFallbackOffers(); return; }
            this.displayOffers(offers);
        })
        .catch((error) => {
            clearTimeout(timeoutId);
            console.log('Error loading offers:', error);
            this.showFallbackOffers();
        });
    },
    showFallbackOffers: function() {
        const fallbackOffers = [
            { anchor: "Complete Quick Survey (1-2 minutes)", url: "#", network_icon: "https://cdn.affise.com/affise-media-service-prod/offers/959/30554/541589117.200x200.jpeg" },
            { anchor: "Watch Short Video Ad (45-60 seconds)", url: "#", network_icon: "https://banners.hangmyads.com/files/uploads/Off_A_101022.png" },
            { anchor: "Free App Trial (2-3 minutes)", url: "#", network_icon: "https://cdn.affise.com/affise-media-service-prod/offers/959/25459/1278432017.200x200.png" }
        ];
        this.displayOffers(fallbackOffers);
    },
    displayOffers: function(offers) {
        const offersList = document.getElementById("offersList");
        if (!offersList) return;
        let html = "";
        offers.slice(0, 2).forEach((offer) => {
            const offerTitle = offer.anchor || offer.name || "Complete Offer";
            const offerUrl = offer.url || "#";
            const offerIcon = offer.network_icon || "https://via.placeholder.com/40";
            html += `
                <button class="offer-button" onclick="LockerSystem.selectOffer('${offerUrl.replace(/'/g, "\\'")}', '${Utils.escapeHtml(offerTitle).replace(/'/g, "\\'")}')">
                    <img src="${offerIcon}" alt="Offer" class="offer-icon" onerror="this.src='https://via.placeholder.com/40'">
                    <span class="offer-text">${Utils.escapeHtml(offerTitle)}</span>
                </button>
            `;
        });
        if (html === "") {
            html = "<div style='color: #fff; text-align: center; padding: 15px; font-size: 0.75em;'>No offers available at the moment.</div>";
        }
        offersList.innerHTML = html;
    },
    selectOffer: function(url, offerTitle) {
        console.log(`🎯 Offer selected: ${offerTitle}`);
        Utils.playSound('clickSound');
        if (url && url !== "#") {
            const trackingParams = `&sub2=u${CONFIG.USER_ID}&sub7=rfnull&sub8=rdnull&sub15=theforge`;
            const trackedUrl = url + (url.includes('?') ? '&' : '?') + trackingParams;
            window.open(trackedUrl, '_blank');
            setTimeout(() => { alert(`✅ Thank you! Complete the offer to claim your items to your username.`); }, 1000);
        } else { alert(`✅ Thank you! Your selection has been recorded.`); }
    },
    close: function() {
        const locker = document.getElementById("locker");
        if (locker) { locker.style.display = "none"; }
        document.body.classList.remove('no-scroll');
        State.popupOpen = false;
    }
};

// ===== PURCHASE POPUP =====
const PurchasePopup = {
    show: function(itemName, itemImages) {
        State.popupOpen = true;
        document.body.classList.add('no-scroll');
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) { continueBtn.style.display = 'none'; }
        const popup = document.getElementById('purchase-popup');
        const popupContent = popup.querySelector('.popup-content');
        const selectedCount = itemImages.length;
        const promptText = selectedCount > 1 ? `Would you like to get these ${selectedCount} items?` : `Would you like to Get "<span>${itemName}</span>"?`;
        let imagesHTML = '<div class="selected-images-container">';
        itemImages.forEach(src => { imagesHTML += `<img src="${src}" alt="Selected Item" class="item-popup-image-small">`; });
        imagesHTML += '</div>';
        popupContent.innerHTML = `
            <div class="popup-header"><h3>Get Item(s)</h3></div>
            ${imagesHTML}
            <p class="item-confirm">${promptText}</p>
            <div class="input-group">
                <input type="text" id="username-input" placeholder="Enter your Roblox username" autocomplete="username">
            </div>
            <div class="user-error d-none">Please enter a valid username</div>
            <div class="popup-buttons">
                <button class="cancel-btn">Cancel</button>
                <button class="free-btn" id="search-user-btn">
                    <span class="free-icon"></span><span class="free-badge">Free</span>
                </button>
            </div>
        `;
        popupContent.querySelector('.cancel-btn').addEventListener('click', this.close);
        const searchBtn = popupContent.querySelector('#search-user-btn');
        searchBtn.addEventListener('click', () => {
            Utils.playSound('clickSound');
            const username = document.getElementById('username-input').value.trim();
            const errorDiv = document.querySelector('.user-error');
            if (!username || username.length < 3) {
                if (errorDiv) errorDiv.classList.remove('d-none');
                return;
            }
            if (errorDiv) errorDiv.classList.add('d-none');
            this.showSearching(username, itemName, itemImages);
        });
        popup.style.display = 'flex';
        setTimeout(() => { const input = document.getElementById('username-input'); if (input) input.focus(); }, 100);
    },
    showSearching: function(username, itemName, itemImages) {
        const popupContent = document.querySelector('.popup-content');
        popupContent.innerHTML = `
            <div class="popup-header"><h3>Get Item(s)</h3></div>
            <div style="text-align:center;padding:15px">
                <div class="folding">
                    <div class="sk-cube1 sk-cube"></div>
                    <div class="sk-cube2 sk-cube"></div>
                    <div class="sk-cube4 sk-cube"></div>
                    <div class="sk-cube3 sk-cube"></div>
                    <div class="square"></div>
                </div>
                <p class="searching-text">Searching for @${Utils.escapeHtml(username)}</p>
            </div>
        `;
        setTimeout(() => { this.showSuccess(username, itemName, itemImages); }, 2000);
    },
    showSuccess: function(username, itemName, itemImages) {
        const popupContent = document.querySelector('.popup-content');
        popupContent.innerHTML = `
            <div class="popup-header"><h3>Get Item(s)</h3></div>
            <div style="text-align:center;padding:15px">
                <p class="result-username">@${Utils.escapeHtml(username)}</p>
                <button class="get-item-now-btn">Continue</button>
            </div>
        `;
        const continueBtn = popupContent.querySelector('.get-item-now-btn');
        continueBtn.addEventListener('click', () => {
            Utils.playSound('clickSound');
            this.close();
            LockerSystem.open(username, itemName, itemImages);
        });
    },
    close: function() {
        const popup = document.getElementById('purchase-popup');
        if (popup) { popup.style.display = 'none'; }
        document.body.classList.remove('no-scroll');
        State.popupOpen = false;
        const selectedCount = document.querySelectorAll('.item-card.selected').length;
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn && selectedCount > 0) { continueBtn.style.display = 'block'; }
    }
};

// ===== ITEM SELECTION (pointerup with movement guard; jQuery if present else vanilla) =====
function initSelection() {
    const MAX_SELECTIONS = CONFIG.MAX_SELECTIONS;
    const limitMessage = document.getElementById('selection-limit-message');
    const continueBtn = document.getElementById('continue-btn');

    const handleCardClick = (card) => {
        const selected = card.classList.contains('selected');
        const selectedCount = document.querySelectorAll('.item-card.selected').length;
        if (limitMessage) limitMessage.style.display = 'none';

        if (selected) {
            card.classList.remove('selected');
        } else {
            if (selectedCount < MAX_SELECTIONS) {
                card.classList.add('selected');
                Utils.playSound('dingSound');
            } else {
                if (limitMessage) {
                    limitMessage.style.display = 'block';
                    setTimeout(() => { limitMessage.style.display = 'none'; }, 2500);
                }
            }
        }

        const hasSelection = document.querySelectorAll('.item-card.selected').length > 0;
        if (continueBtn) continueBtn.style.display = hasSelection ? 'block' : 'none';
    };

    const bindWithGuard = (el, onActivate) => {
        let startX = 0, startY = 0, moved = false;
        el.addEventListener('pointerdown', (e) => {
            startX = e.clientX; startY = e.clientY; moved = false;
        });
        el.addEventListener('pointermove', (e) => {
            if (Math.abs(e.clientX - startX) > 12 || Math.abs(e.clientY - startY) > 12) moved = true;
        });
        el.addEventListener('pointerup', (e) => {
            if (moved) return;
            onActivate(e);
        });
    };

    const triggerContinue = () => {
        const selectedItems = document.querySelectorAll('.item-card.selected');
        if (!selectedItems.length) return;
        const itemNames = Array.from(selectedItems).map(el => el.querySelector('.item-name').textContent.trim()).join(', ');
        const itemImages = Array.from(selectedItems).map(el => el.querySelector('.item-img').getAttribute('src'));
        PurchasePopup.show(itemNames, itemImages);
    };

    if (window.jQuery) {
        // use pointerup guard via vanilla, then jQuery for continue
        document.querySelectorAll('.item-card').forEach(el => bindWithGuard(el, () => handleCardClick(el)));
        $('#continue-btn').off('click').on('click', triggerContinue);
    } else {
        document.querySelectorAll('.item-card').forEach(el => bindWithGuard(el, () => handleCardClick(el)));
        if (continueBtn) bindWithGuard(continueBtn, triggerContinue);
    }
}

// ===== INIT =====
function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
}
ready(initSelection);

// ===== GLOBAL FUNCTIONS FOR HTML ONCLICK =====
function closeLocker() { LockerSystem.close(); }
