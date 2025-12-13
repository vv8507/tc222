const ITEM_STORAGE_KEY = 'donatedItems';
const donationForm = document.getElementById('donation-form');
const itemImageInput = document.getElementById('itemImage');
const imagePreviewDiv = document.getElementById('imagePreview');
const itemListDiv = document.getElementById('item-list');
let currentBase64Image = null;

// 取得 localStorage
function getItems() {
    const data = localStorage.getItem(ITEM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 儲存 localStorage
function saveItems(items) {
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

// 渲染項目
function renderItems(items) {
    if(!itemListDiv) return;
    itemListDiv.innerHTML = '';
    if(items.length===0){
        itemListDiv.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#888;">No donated items available yet.</p>';
        return;
    }

    items.forEach((item,index)=>{
        const card = document.createElement('div');
        card.classList.add('item-card');
        const tagsHTML = item.tags ? item.tags.split(',').map(tag=>`<span>${tag.trim()}</span>`).join('') : '';
        const featuredHTML = item.featured==='yes' ? '<span class="item-tags">🌟 Featured</span>' : '';
        card.innerHTML=`
        <div class="item-image-wrap">
            <img src="${item.image}" alt="${item.itemName}" class="item-image"/>
        </div>
        <div class="item-info">
            <h4>${item.itemName} (${item.condition})</h4>
            <p>Category: <strong>${item.category}</strong></p>
            <p class="item-description">${item.description.substring(0,50)}...</p>
            ${featuredHTML}
            <div class="item-tags">${tagsHTML}</div>
            <button class="delete-btn">❌ Delete</button>
        </div>
        `;
        itemListDiv.appendChild(card);

        card.querySelector('.delete-btn').addEventListener('click',()=>{
            const allItems = getItems();
            allItems.splice(index,1);
            saveItems(allItems);
            renderItems(allItems);
        });
    });
}

// 初始渲染
renderItems(getItems());

// 圖片預覽
if(itemImageInput && imagePreviewDiv){
    itemImageInput.addEventListener('change',function(e){
        const file=e.target.files[0];
        currentBase64Image=null;
        imagePreviewDiv.innerHTML='';
        if(file && file.type.startsWith('image/')){
            const reader=new FileReader();
            reader.onload=function(evt){
                currentBase64Image=evt.target.result;
                const img=document.createElement('img');
                img.src=currentBase64Image;
                img.classList.add('preview-image');
                imagePreviewDiv.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 表單提交
if(donationForm){
    donationForm.addEventListener('submit',function(e){
        e.preventDefault();
        if(!currentBase64Image){ alert("Please wait for image to load"); return;}
        const fd=new FormData(donationForm);
        const newItem={
            itemName:fd.get('itemName'),
            category:fd.get('category'),
            condition:fd.get('condition'),
            description:fd.get('description'),
            tags:fd.get('tags'),
            featured:fd.get('featured'),
            image:currentBase64Image
        };
        const allItems=getItems();
        allItems.push(newItem);
        saveItems(allItems);
        renderItems(allItems);
        donationForm.reset();
        imagePreviewDiv.innerHTML='';
        currentBase64Image=null;
    });
}

// 搜尋功能
const searchInput=document.getElementById('searchInput');
if(searchInput){
    searchInput.addEventListener('input',function(){
        const query=this.value.toLowerCase();
        const filtered=getItems().filter(item=>{
            return item.itemName.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
        });
        renderItems(filtered);
    });
}

// 類別篩選
const filterButtons=document.querySelectorAll('.filter');
filterButtons.forEach(btn=>{
    btn.addEventListener('click',function(){
        filterButtons.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const cat=btn.getAttribute('data-category');
        const filtered=cat==='All'?getItems():getItems().filter(item=>item.category===cat);
        renderItems(filtered);
    });
});
