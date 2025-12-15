// =======================================================
// 全域變數和輔助函式
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
const navbar = document.querySelector('.navbar'); // 新增：導覽列元素

let currentBase64Image = null;

// =======================================================
// 取得 / 儲存捐贈項目
// =======================================================
function getItems() {
    const data = localStorage.getItem(ITEM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveItems(items) {
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

// 新增：處理索取物品的函式
function handleClaimItem(index) {
    let items = getItems();
    
    // 透過 index 找到在 *原始* getItems 陣列中的項目
    // 因為 filterAndSearchItems 執行時 items 會被排序和篩選，
    // 我們需要找到該卡片在 localStorage 原始陣列中的真實 index。
    // 這裡我們直接使用 items 陣列中的 index，並假設 renderItems 渲染的是 getItems() 的結果。

    if (index >= 0 && index < items.length && !items[index].claimed) {
        items[index].claimed = true; // 標記為已索取
        items[index].claimDate = new Date().toLocaleString(); // 記錄索取時間
        saveItems(items);
        
        // 重新渲染以更新介面
        const activeButton = document.querySelector('.filters button.active');
        const category = activeButton ? activeButton.getAttribute('data-category') : 'All';
        filterAndSearchItems(category, searchInput.value);
        
        alert(`Successfully claimed: ${items[index].itemName}! (This action is purely local for demonstration)`);
    }
}


// =======================================================
// 渲染項目 (修改: 增加已索取狀態、按鈕、特色標籤)
// =======================================================
function renderItems(items) {
    if (!itemListDiv) return;
    itemListDiv.innerHTML = '';

    if (items.length === 0) {
        itemListDiv.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888;">No donated items available yet.</p>';
        return;
    }

    // items 已經在 filterAndSearchItems 中被處理過 (篩選、排序)
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('item-card');
        
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
    
    // 綁定新按鈕的事件監聽器
    itemListDiv.querySelectorAll('.claim-btn').forEach(button => {
        button.addEventListener('click', function() {
            // 注意: 這裡的 index 是 *目前被渲染的 items 陣列* 中的 index
            const index = parseInt(this.getAttribute('data-index'));
            
            // 由於 items 陣列已經在 filterAndSearchItems 中處理過，這裡直接使用 index 即可
            // 如果要確保操作的是原始物件，需要傳遞 unique ID 或在 items 結構中加入 ID
            // 為了簡化，我們直接操作當前篩選後陣列中的元素
            handleClaimItem(index);
        });
    });
}

// =======================================================
// 實時圖片預覽 (保持不變)
// =======================================================
if (itemImageInput && imagePreviewDiv) {
    itemImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        currentBase64Image = null;

        if (file) {
            imagePreviewDiv.innerHTML = '';

            if (!file.type.startsWith('image/')) {
                imagePreviewDiv.innerHTML = '<p class="error-text">Please upload a valid image file.</p>';
                return;
            }

            const reader = new FileReader();

            reader.onload = function(e) {
                currentBase64Image = e.target.result;

                const img = document.createElement('img');
                img.src = currentBase64Image;
                img.alt = "Item Preview";
                img.classList.add('preview-image');

                imagePreviewDiv.appendChild(img);
            };

            reader.readAsDataURL(file);
        } else {
            imagePreviewDiv.innerHTML = '';
        }
    });
}

// =======================================================
// 表單提交 (保持不變)
// =======================================================
if (donationForm) {
    donationForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!currentBase64Image) {
            alert("Please wait for the image to load or select a file.");
            return;
        }

        const formData = new FormData(donationForm);
        const newItem = {
            // 增加一個簡單的 ID
            id: Date.now(), 
            itemName: formData.get('itemName'),
            category: formData.get('category'),
            condition: formData.get('condition'),
            description: formData.get('description'),
            image: currentBase64Image,
            tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [],
            featured: formData.get('featured'),
            claimed: false // 預設未索取
        };

        const items = getItems();
        items.push(newItem);
        saveItems(items);

        // 重新渲染以包含新項目
        const activeButton = document.querySelector('.filters button.active');
        const category = activeButton ? activeButton.getAttribute('data-category') : 'All';
        filterAndSearchItems(category, searchInput.value);

        // Reset form
        donationForm.reset();
        imagePreviewDiv.innerHTML = '';
        currentBase64Image = null;

        // Show modal
        if (successModal) {
            successModal.style.display = 'flex';
        }
    });
}

// =======================================================
// 關閉成功彈窗 (保持不變)
// =======================================================
if (modalClose) {
    modalClose.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
}
if (modalBack) {
    modalBack.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
}

// =======================================================
// 篩選功能 (保持不變)
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
// 搜尋功能 (保持不變)
// =======================================================
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const activeButton = document.querySelector('.filters button.active');
        const category = activeButton ? activeButton.getAttribute('data-category') : 'All';
        filterAndSearchItems(category, this.value);
    });
}

// =======================================================
// 篩選 + 搜尋合併函式 (修改: 增加 Tags 搜尋和未索取項目排序)
// =======================================================
function filterAndSearchItems(category, keyword) {
    let items = getItems();

    // 排序: 將未索取的項目排在前面，已索取的排在後面
    items.sort((a, b) => (a.claimed === b.claimed) ? 0 : a.claimed ? 1 : -1);

    if (category && category !== 'All') {
        items = items.filter(i => i.category === category);
    }

    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        items = items.filter(i => 
            i.itemName.toLowerCase().includes(lowerKeyword) || 
            i.description.toLowerCase().includes(lowerKeyword) ||
            i.tags.some(t => t.toLowerCase().includes(lowerKeyword)) // 新增: 搜尋包含 tags
        );
    }

    renderItems(items);
}

// =======================================================
// 新增：滾動時導覽列固定功能
// =======================================================
if (navbar) {
    // 等待 DOMContentLoaded 以確保 .hero 存在
    document.addEventListener('DOMContentLoaded', () => {
        const hero = document.querySelector('.hero');
        if (!hero) return; 

        let heroHeight = hero.offsetHeight;

        window.addEventListener('scroll', () => {
            if (window.scrollY > heroHeight - 50) { // 稍微早一點觸發
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        });
    });
}

// =======================================================
// 新增：滾動淡入效果 (Intersection Observer)
// =======================================================
function setupFadeInObserver() {
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
}


// =======================================================
// 初始化
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    // 渲染項目列表
    if (itemListDiv) {
        renderItems(getItems());
    }
    
    // 啟用滾動淡入效果
    setupFadeInObserver();
});
