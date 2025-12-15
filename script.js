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

// 渲染項目

// =======================================================

function renderItems(items) {

    if (!itemListDiv) return;

    itemListDiv.innerHTML = '';



    if (items.length === 0) {

        itemListDiv.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888;">No donated items available yet.</p>';

        return;

    }



    items.forEach(item => {

        const card = document.createElement('div');

        card.classList.add('item-card');



        const imageUrl = item.image ? item.image : 'placeholder.jpg';



        card.innerHTML = `

            <div class="item-image-wrap">

                <img src="${imageUrl}" alt="${item.itemName}" class="item-image" />

            </div>

            <div class="item-info">

                <h4>${item.itemName} (${item.condition})</h4>

                <p>Category: <strong>${item.category}</strong></p>

                <p class="item-description">${item.description.substring(0, 50)}...</p>

            </div>

        `;

        itemListDiv.appendChild(card);

    });

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



        renderItems(items);



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

        items = items.filter(i => i.itemName.toLowerCase().includes(lowerKeyword) || i.description.toLowerCase().includes(lowerKeyword));

    }



    renderItems(items);

}



// =======================================================

// 初始化

// =======================================================

document.addEventListener('DOMContentLoaded', () => {

    renderItems(getItems());

});
