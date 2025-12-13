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

// 新增的 DOM 元素
const navbar = document.getElementById('main-navbar');
const hero = document.querySelector('.hero');
const heroDecor1 = document.querySelector('.decor-1');
const heroDecor2 = document.querySelector('.decor-2');
const featuredListDiv = document.getElementById('featured-list'); 

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

// =======================================================
// 渲染項目 (可重複利用，接受目標容器)
// =======================================================
function renderItems(items, container) {
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
        
        let message = 'No donated items available yet.';
        if (container.id === 'item-list') {
            const hasFilterOrSearch = (document.querySelector('.filters button.active') && document.querySelector('.filters button.active').getAttribute('data-category') !== 'All') || (searchInput && searchInput.value.length > 0);
            if (hasFilterOrSearch) {
                message = 'No items found matching your filter/search criteria.';
            }
        } else if (container.id === 'featured-list') {
             message = 'No featured items listed this week.';
        }


        container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#888;">${message}</p>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('item-card');
        
        // 確保新渲染的卡片也有淡入動畫的類別
        if (container.id !== 'featured-list') {
            // Featured 區塊會在 DOMContentLoaded 時處理所有卡片淡入，這裡只處理主列表
            card.classList.add('invisible'); 
        }

        const imageUrl = item.image ? item.image : 'placeholder.jpg';
        const isFeatured = item.featured === 'yes';

        card.innerHTML = `
            <div class="item-image-wrap">
                <img src="${imageUrl}" alt="${item.itemName}" class="item-image" />
                ${isFeatured ? '<span class="item-badge featured-badge">🌟 Featured</span>' : ''}
                <span class="item-badge condition-badge">${item.condition}</span>
            </div>
            <div class="item-info">
                <h4>${item.itemName}</h4>
                <p>Category: <strong>${item.category}</strong></p>
                <p class="item-description">${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</p>
            </div>
        `;
        container.appendChild(card);
    });
    
    // 如果是主列表，需要重新對新元素設定觀察器
    if (container.id === 'item-list') {
        setupFadeInOnScroll();
    }
}

// =======================================================
// 渲染精選項目 (新增函式)
// =======================================================
function renderFeaturedItems() {
    if (!featuredListDiv) return;

    const items = getItems();
    const featuredItems = items.filter(item => item.featured === 'yes'); 

    // 注意：這裡不強制限制 3 個，讓水平滾動條可以展示更多
    renderItems(featuredItems, featuredListDiv); 
}


// =======================================================
// 實時圖片預覽
// =======================================================
if (itemImageInput && imagePreviewDiv) {
    itemImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        currentBase64Image = null;

        if (file) {
            imagePreviewDiv.innerHTML = '';
            imagePreviewDiv.style.border = '2px dashed #4CAF50'; 

            if (!file.type.startsWith('image/')) {
                imagePreviewDiv.innerHTML = '<p class="error-text">Please upload a valid image file.</p>';
                imagePreviewDiv.style.border = '2px solid red'; 
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
                imagePreviewDiv.style.border = 'none'; 
            };

            reader.readAsDataURL(file);
        } else {
            imagePreviewDiv.innerHTML = '';
            imagePreviewDiv.style.border = '2px dashed var(--color-border)'; 
        }
    });
}

// =======================================================
// 表單提交
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
            itemName: formData.get('itemName'),
            category: formData.get('category'),
            condition: formData.get('condition'),
            description: formData.get('description'),
            image: currentBase64Image,
            tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [],
            featured: formData.get('featured')
        };

        const items = getItems();
        items.push(newItem);
        saveItems(items);

        // 重新渲染列表時，保持目前的篩選/搜尋狀態
        const activeButton = document.querySelector('.filters button.active');
        const currentCategory = activeButton ? activeButton.getAttribute('data-category') : 'All';
        const currentKeyword = searchInput ? searchInput.value : '';

        filterAndSearchItems(currentCategory, currentKeyword);
        renderFeaturedItems(); // 重新渲染精選項目

        // Reset form
        donationForm.reset();
        imagePreviewDiv.innerHTML = '';
        imagePreviewDiv.style.border = '2px dashed var(--color-border)'; 
        currentBase64Image = null;

        // Show modal
        if (successModal) {
            successModal.style.display = 'flex';
        }
    });
}

// =======================================================
// 關閉成功彈窗
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
// 篩選功能
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
// 搜尋功能
// =======================================================
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const activeButton = document.querySelector('.filters button.active');
        const category = activeButton ? activeButton.getAttribute('data-category') : 'All';
        filterAndSearchItems(category, this.value);
    });
}

// =======================================================
// 篩選 + 搜尋合併函式
// =======================================================
function filterAndSearchItems(category, keyword) {
    let items = getItems();

    if (category && category !== 'All') {
        items = items.filter(i => i.category === category);
    }

    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        items = items.filter(i => 
            i.itemName.toLowerCase().includes(lowerKeyword) || 
            i.description.toLowerCase().includes(lowerKeyword) ||
            i.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)) 
        );
    }

    renderItems(items, itemListDiv); 
}


// =======================================================
// 導航欄滾動鎖定 (Sticky Nav)
// =======================================================
function setupStickyNav() {
    if (navbar && hero) {
        window.addEventListener('load', () => {
            const stickyOffset = hero.offsetHeight; 
            window.addEventListener('scroll', () => {
                if (window.scrollY >= stickyOffset) {
                    navbar.classList.add('sticky');
                } else {
                    navbar.classList.remove('sticky');
                }
            });
        });
    }
}

// =======================================================
// 滾動視差 (Hero Parallax)
// =======================================================
function setupHeroParallax() {
    if (heroDecor1 && heroDecor2) {
        window.addEventListener('scroll', () => {
            const scrollDistance = window.scrollY;

            heroDecor1.style.transform = `translateY(${scrollDistance * 0.2}px)`; 
            heroDecor2.style.transform = `translateY(${scrollDistance * -0.1}px)`; 
        });
    }
}

// =======================================================
// Intersection Observer (物件滾動偵測與淡入)
// =======================================================
let observer;

function setupFadeInOnScroll() {
    // 如果觀察器已經存在，先清除舊的觀察者，以處理新加載的元素
    if (observer) {
        observer.disconnect();
    }

    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('invisible');
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // 取得所有要做淡入效果的元素
    const elementsToAnimate = document.querySelectorAll(
        // 排除 Featured 區塊的卡片，因為它們通常不需要延遲載入 (除非它們滾出螢幕)
        '.feature-card, .story-card, .about-item, #item-list .item-card'
    );

    elementsToAnimate.forEach(el => {
        // 只有還沒有被設定為可見的元素才需要重新觀察
        if (!el.classList.contains('visible')) {
             el.classList.add('invisible'); 
             observer.observe(el);
        }
    });
}


// =======================================================
// 初始化
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    // 確保 'All' 按鈕在載入時是 active
    const allButton = document.querySelector('.filters button[data-category="All"]');
    if (allButton && !allButton.classList.contains('active')) {
        allButton.classList.add('active');
    }
    
    // 渲染項目
    renderItems(getItems(), itemListDiv);
    renderFeaturedItems();

    // 啟動進階功能
    setupStickyNav();
    setupHeroParallax();
    setupFadeInOnScroll();
});
