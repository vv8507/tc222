// =======================================================
// 全域變數和輔助函式 (保留既有)
// =======================================================

const ITEM_STORAGE_KEY = 'donatedItems';
const donationForm = document.getElementById('donation-form');
const itemImageInput = document.getElementById('itemImage');
const imagePreviewDiv = document.getElementById('imagePreview');
const itemListDiv = document.getElementById('item-list');
const successModal = document.getElementById('success-modal');
const modalClose = document.getElementById('modalClose');
const modalBack = document.getElementById('modalBack');
const filters = document.querySelectorAll('.filters button');
const searchInput = document.getElementById('searchInput');
const navbar = document.querySelector('.navbar'); // 📌 新增：導覽列元素

let currentBase64Image = null;

// =======================================================
// 取得 / 儲存捐贈項目 (保留既有)
// =======================================================
function getItems() {
    const data = localStorage.getItem(ITEM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveItems(items) {
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

// 📌 新增：處理索取物品的函式
function handleClaimItem(index) {
    let items = getItems();
    // 簡單的檢查，確保 index 有效且項目未被索取
    if (index >= 0 && index < items.length && !items[index].claimed) {
        items[index].claimed = true; // 標記為已索取
        items[index].claimDate = new Date().toLocaleString(); // 記錄索取時間
        saveItems(items);
        
        // 重新渲染以更新介面
        const activeButton = document.querySelector('.filters button.active');
        const category = activeButton ? activeButton.getAttribute('data-category') : 'All';
        filterAndSearchItems(category, searchInput.value);
        
        alert(`Successfully claimed: ${items[index].itemName}! (Index: ${index})`);
    }
}

// =======================================================
// 渲染項目 (修改: 增加已索取狀態和按鈕)
// =======================================================
function renderItems(items) {
    if (!itemListDiv) return;
    itemListDiv.innerHTML = '';

    if (items.length === 0) {
        itemListDiv.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888;">No donated items available yet.</p>';
        return;
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('item-card');
        
        // 📌 確保我們只顯示未索取的項目，或者如果需要顯示所有項目，則調整此邏輯。
        // 為了讓使用者看到他們捐贈的東西，我們在此處顯示所有項目，但將已索取的項目標記出來。
        
        const imageUrl = item.image ? item.image : 'placeholder.jpg';
        const isClaimed = item.claimed;
        const buttonHtml = isClaimed 
            ? '<button class="btn claimed" disabled>已被索取 ✅</button>'
            : `<button class="btn primary claim-btn" data-index="${index}">立即索取</button>`;
            
        const featuredTag = item.featured === 'yes' 
            ? '<div class="featured-tag">✨ Featured</div>' : '';

        card.innerHTML = `
            <div class="item-image-wrap">
                ${featuredTag}
                <img src="${imageUrl}" alt="${item.itemName}" class="item-image" />
            </div>
            <div class="item-info">
                <h4>${item.itemName} (${item.condition})</h4>
                <p>Category: <strong>${item.category}</strong></p>
                <p class="item-description">${item.description.substring(0, 70)}${item.description.length > 70 ? '...' : ''}</p>
                <div class="item-actions">
                    ${buttonHtml}
                </div>
            </div>
        `;
        itemListDiv.appendChild(card);
    });
    
    // 📌 綁定新按鈕的事件監聽器
    itemListDiv.querySelectorAll('.claim-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            handleClaimItem(index);
        });
    });
}

// (實時圖片預覽、表單提交、關閉成功彈窗函式保持不變)

// =======================================================
// 篩選功能 (保留既有)
// =======================================================
filters.forEach(button => {
    button.addEventListener('click', function() {
        filters.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const category = this.getAttribute('data-category');
        filterAndSearchItems(category, searchInput.value);
    });
});

// =======================================================
// 搜尋功能 (保留既有)
// =======================================================
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const activeButton = document.querySelector('.filters button.active');
        const category = activeButton ? activeButton.getAttribute('data-category') : 'All';
        filterAndSearchItems(category, this.value);
    });
}

// =======================================================
// 篩選 + 搜尋合併函式 (保留既有)
// =======================================================
function filterAndSearchItems(category, keyword) {
    let items = getItems();

    // 📌 排序: 將未索取的項目排在前面
    items.sort((a, b) => (a.claimed === b.claimed) ? 0 : a.claimed ? 1 : -1);

    if (category && category !== 'All') {
        items = items.filter(i => i.category === category);
    }

    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        items = items.filter(i => i.itemName.toLowerCase().includes(lowerKeyword) || i.description.toLowerCase().includes(lowerKeyword) || i.tags.some(t => t.toLowerCase().includes(lowerKeyword))); // 📌 搜尋包含 tags
    }

    renderItems(items);
}

// =======================================================
// 📌 新增：滾動時導覽列固定功能
// =======================================================
if (navbar) {
    let heroHeight = document.querySelector('.hero').offsetHeight;

    window.addEventListener('scroll', () => {
        if (window.scrollY > heroHeight) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
    });
}


// =======================================================
// 📌 新增：淡入效果 (如果你想要一個簡單的 Vanilla JS 淡入)
// =======================================================
// const fadeInElements = document.querySelectorAll('.fade-in');

// const observerOptions = {
//     root: null,
//     rootMargin: '0px',
//     threshold: 0.1 
// };

// const observer = new IntersectionObserver((entries, observer) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             entry.target.classList.add('visible');
//             observer.unobserve(entry.target);
//         }
//     });
// }, observerOptions);

// fadeInElements.forEach(element => {
//     element.classList.add('invisible');
//     observer.observe(element);
// });
// 
// // 由於您原有的 HTML 已經有 .fade-in 且 CSS 中有 .invisible 和 .visible，
// // 可以考慮加入這個 Intersection Observer 邏輯來啟用滾動淡入動畫。


// =======================================================
// 初始化 (保留既有)
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    // 確保 item-list 容器存在時才執行 renderItems
    if (itemListDiv) {
        renderItems(getItems());
    }
    
    // 📌 啟用滾動淡入效果
    const fadeInElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('invisible');
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInElements.forEach(element => {
        element.classList.add('invisible'); // 確保開始時是隱藏的
        observer.observe(element);
    });
});
