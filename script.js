// =======================================================
// Global Variables
// =======================================================
const ITEM_STORAGE_KEY = 'donatedItems';
const APPLICATION_STORAGE_KEY = 'borrowApplications';

const donationForm = document.getElementById('donation-form');
const itemImageInput = document.getElementById('itemImage');
const imagePreviewDiv = document.getElementById('imagePreview');
const itemListDiv = document.getElementById('item-list');

let currentBase64Image = null;

// =======================================================
// Helper Functions
// =======================================================

function getItems() {
    const data = localStorage.getItem(ITEM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveItems(items) {
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

function getApplications() {
    const data = localStorage.getItem(APPLICATION_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveApplications(apps) {
    localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(apps));
}

// =======================================================
// Render Items
// =======================================================

function renderItems(items) {
    if (!itemListDiv) return;
    itemListDiv.innerHTML = '';
    
    if (items.length === 0) {
        itemListDiv.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #888;">No donated items yet.</p>';
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
                <button class="btn outline borrow-btn" data-item="${item.itemName}">Apply to Borrow</button>
            </div>
        `;
        itemListDiv.appendChild(card);
    });
}

// =======================================================
// Image Preview
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
// Form Submission
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
            featured: formData.get('featured') || 'no'
        };

        const items = getItems();
        items.push(newItem);
        saveItems(items);

        donationForm.reset();
        imagePreviewDiv.innerHTML = '';
        currentBase64Image = null;

        renderItems(getItems());
        alert("✅ Item successfully added!");
    });
}

// =======================================================
// Borrow Application Logic
// =======================================================

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('borrow-btn')) {
        const itemName = e.target.dataset.item;
        const userName = prompt(`Enter your name to apply for "${itemName}":`);
        if (!userName) return alert("Application cancelled.");
        const apps = getApplications();
        apps.push({ itemName, applicant: userName, date: new Date().toLocaleString() });
        saveApplications(apps);
        alert(`Application submitted successfully for "${itemName}"!`);
    }
});

// =======================================================
// Initial Render
// =======================================================

renderItems(getItems());
