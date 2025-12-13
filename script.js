const ITEM_STORAGE_KEY = 'donatedItems';
const donationForm = document.getElementById('donation-form');
const itemImageInput = document.getElementById('itemImage');
const imagePreviewDiv = document.getElementById('imagePreview');
const itemListDiv = document.getElementById('item-list');
const cartCount = document.getElementById('cart-count');

let currentBase64Image = null; 

function getItems() {
    const data = localStorage.getItem(ITEM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveItems(items) {
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

function renderItems(items) {
    if(!itemListDiv) return;
    itemListDiv.innerHTML = '';
    if(items.length===0){ itemListDiv.innerHTML='<p>No donated items yet.</p>'; return;}
    items.forEach((item, index)=>{
        const card=document.createElement('div'); 
        card.classList.add('item-card');
        const imageUrl = item.image ? item.image : 'placeholder.jpg';
        card.innerHTML=`<div class="item-image-wrap"><img src="${imageUrl}" alt="${item.itemName}" class="item-image" /></div>
        <div class="item-info"><h4>${item.itemName} (${item.condition})</h4><p>Category: <strong>${item.category}</strong></p><p>${item.description.substring(0,50)}...</p>
        <button class="btn primary" onclick="addToCart(${index})">Add to Cart</button>
        </div>`;
        itemListDiv.appendChild(card);
    });
}

function addToCart(index){
    let itemsInCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    itemsInCart.push(index);
    localStorage.setItem('cart', JSON.stringify(itemsInCart));
    cartCount.innerText = itemsInCart.length;
}

if(itemImageInput && imagePreviewDiv){
    itemImageInput.addEventListener('change', function(event){
        const file = event.target.files[0]; 
        currentBase64Image = null;
        if(file){
            imagePreviewDiv.innerHTML='';
            if(!file.type.startsWith('image/')){ imagePreviewDiv.innerHTML='<p>Please upload a valid image file.</p>'; return; }
            const reader = new FileReader();
            reader.onload = function(e){ 
                currentBase64Image = e.target.result; 
                const img=document.createElement('img'); img.src=currentBase64Image; img.classList.add('preview-image'); imagePreviewDiv.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else { imagePreviewDiv.innerHTML=''; }
    });
}

if(donationForm){
    donationForm.addEventListener('submit', function(event){
        event.preventDefault();
        if(!currentBase64Image){ alert("Please wait for image to load."); return;}
        const formData=new FormData(donationForm);
        const newItem={ itemName:formData.get('itemName'), category:formData.get('category'), condition:formData.get('condition'), description:formData.get('description'), image: currentBase64Image };
        const items = getItems(); items.push(newItem); saveItems(items);
        renderItems(items); donationForm.reset(); imagePreviewDiv.innerHTML=''; currentBase64Image=null;
        alert("Item added!");
    });
}

// Initialize cart count
let itemsInCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
cartCount.innerText = itemsInCart.length;

renderItems(getItems());
