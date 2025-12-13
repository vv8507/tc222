// =======================================================
// 全域變數
// =======================================================
const ITEM_STORAGE_KEY = 'donatedItems';
const donationForm = document.getElementById('donation-form');
const itemImageInput = document.getElementById('itemImage');
const imagePreviewDiv = document.getElementById('imagePreview');
const itemListDiv = document.getElementById('item-list');
const successModal = document.getElementById('success-modal');
const modalClose = document.getElementById('modalClose');
const modalBack = document.getElementById('modalBack');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter');

let currentBase64Image = null;

// =======================================================
// 讀取與儲存
// =======================================================
function getItems() {
    const data = localStorage.getItem(ITEM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveItems(items) {
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

// =======================================================
// 渲染
// =======================================================
function renderItems(items) {
    if (!itemListDiv) return;
    itemListDiv.innerHTML = '';

    if (items.length === 0) {
        itemListDiv.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #888;">No donated items available yet.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('item-card');
        card.innerHTML = `
            <div class="item-image-wrap">
                <img src="${item.image ? item.image : 'placeholder.jpg'}" alt="${item.itemName}" class="item-image" />
            </div>
            <div class="item-info">
                <h4>${item.itemName} (${item.condition})</h4>
                <p>Category: <strong>${item.category}</strong></p>
                <p class="item-description">${item.description.substring(0,50)}...</p>
                <p><strong>Tags:</strong> ${item.tags}</p>
                <p><strong>Featured:</strong> ${item.featured}</p>
            </div>
        `;
        itemListDiv.appendChild(card);
    });
}

// =======================================================
// 圖片預覽
// =======================================================
if (itemImageInput && imagePreviewDiv) {
    itemImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        currentBase64Image = null;
        imagePreviewDiv.innerHTML = '';

        if (!file) return;
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
            tags: formData.get('tags') || '',
            featured: formData.get('featured') || 'no'
        };

        const items = getItems();
        items.push(newItem);
        saveItems(items);
        renderItems(items);
        donationForm.reset();
        currentBase64Image = null;
        imagePreviewDiv.innerHTML = '';
        successModal.style.display = 'flex';
    });
}

// =======================================================
// Modal 控制
// =======================================================
if (modalClose) {
    modalClose.addEventListener('click', () => successModal.style.display = 'none');
}
if (modalBack) {
    modalBack.addEventListener('click', () => successModal.style.display = 'none');
}

// =======================================================
// 篩選分類
// =======================================================
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.category;
        const items = getItems();
        if (category === 'All') renderItems(items);
        else renderItems(items.filter(item => item.category === category));
    });
});

// =======================================================
// 搜尋
// =======================================================
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const items = getItems();
        const filtered = items.filter(item => 
            item.itemName.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query) ||
            (item.tags && item.tags.toLowerCase().includes(query))
        );
        renderItems(filtered);
    });
}

// =======================================================
// 初始化
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    renderItems(getItems());
});
