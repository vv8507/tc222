const CURRENT_USER = 'currentUser';
const ITEM_KEY = 'donatedItems';

const list = document.getElementById('item-list');
const form = document.getElementById('donation-form');
const donateSection = document.getElementById('donate');
const authArea = document.getElementById('authArea');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter');
const imageInput = document.getElementById('itemImage');
const preview = document.getElementById('imagePreview');
const storiesGrid = document.getElementById('storiesGrid');

let imgData = null;
let currentCategory = 'All';

/* ===== User ===== */
function getUser(){
  return JSON.parse(localStorage.getItem(CURRENT_USER));
}

/* ===== Auth UI ===== */
function updateAuthUI(){
  const user = getUser();

  if(user){
    // 使用暱稱，如果沒有，則使用 Email
    const userName = user.nickname || user.email; 
    authArea.innerHTML = `Hi, ${userName}
      <button class="btn outline small" id="logoutBtn">Logout</button>`;
    
    // 確保 donateSection 存在才修改樣式
    if (donateSection) {
        donateSection.style.display = 'block';
    }

    document.getElementById('logoutBtn').onclick = () => {
      localStorage.removeItem(CURRENT_USER);
      // 使用 location.href = './index.html' 確保登出後回到主頁
      location.href = './index.html'; 
    };
  }else{
    authArea.innerHTML = `<a href="login.html" class="btn outline small">Login</a>`;
    if (donateSection) {
        donateSection.style.display = 'none';
    }
  }
}

/* ===== Items ===== */
function getItems(){
  return JSON.parse(localStorage.getItem(ITEM_KEY)) || [];
}
function saveItems(items){
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
}

function renderItems(){
  let items = getItems();
  
  // 檢查 list 元素是否存在
  if (!list) return;

  list.innerHTML = ''; // 清空列表

  // 1. 篩選
  if(currentCategory !== 'All'){
    items = items.filter(i => i.category === currentCategory);
  }

  // 2. 搜尋
  const keyword = searchInput.value.toLowerCase();
  if(keyword){
    items = items.filter(i =>
        (i.name || '').toLowerCase().includes(keyword) ||
        (i.desc || '').toLowerCase().includes(keyword) ||
        (i.category || '').toLowerCase().includes(keyword)
    );
  }
  
  // 3. 處理空列表
  if(items.length === 0){
    // 使用 grid-column:1/-1 確保提示文本橫跨整個網格區域並居中
    list.innerHTML = '<p style="grid-column:1/-1; text-align:center; font-size:1.2em; color:#777;">No items found in this category or search.</p>';
    return;
  }
  
  // 4. 渲染項目 (修正 undefined 和圖片問題)
  items.forEach(i => {
    const div = document.createElement('div');
    div.className = 'item-card';
    
    // 提供安全的預設值，特別是圖片
    const imageSrc = i.image || 'https://via.placeholder.com/400x300'; 
    const itemName = i.name || 'Untitled Item';
    const itemDesc = i.desc || 'No description provided.';
    const donatedBy = i.nickname || i.email || 'Anonymous'; 
    
    div.innerHTML = `
      <img src="${imageSrc}" alt="${itemName}">
      <div class="item-info">
        <h4>${itemName}</h4>
        <p>${itemDesc}</p>
        <p><strong>Donated by:</strong> ${donatedBy}</p>
        <span class="tag">${i.category || 'Unknown'}</span>
      </div>`;
    list.appendChild(div);
  });
}

/* ===== Donate (Image Upload) ===== */
imageInput?.addEventListener('change', e => {
  const reader = new FileReader();
  reader.onload = () => {
    imgData = reader.result;
    preview.innerHTML = `<img src="${imgData}" alt="Item Preview">`;
  };
  reader.readAsDataURL(e.target.files[0]);
});

/* ===== Donate (Form Submit) ===== */
form?.addEventListener('submit', e => {
  e.preventDefault();
  const user = getUser();
  if (!user) {
      alert("Please login to donate.");
      return;
  }
  
  const data = new FormData(form);
  const items = getItems();

  items.push({
    name: data.get('itemName'),
    desc: data.get('description'),
    category: data.get('category'),
    image: imgData,
    email: user.email,
    nickname: user.nickname // 儲存 nickname 供渲染使用
  });

  saveItems(items);
  form.reset();
  preview.innerHTML = '';
  imgData = null; // 清除圖片資料
  alert('Item successfully donated!');
  renderItems();
});

/* ===== Filter & Search ===== */
filterBtns.forEach(b => {
  b.onclick = () => {
    filterBtns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    currentCategory = b.dataset.category;
    renderItems();
  };
});
searchInput?.addEventListener('input', renderItems);

/* ===== Stories (Dynamic) ===== */
if (storiesGrid) {
    const stories = [
      {title:'📚 Helping Students',text:'Donated textbooks helped students learn.'},
      {title:'🧥 Warm Winters',text:'Winter clothes supported families.'},
      {title:'🍳 Community Kitchens',text:'Appliances helped prepare meals.'}
    ];

    stories.forEach(s => {
      const div = document.createElement('div');
      div.className = 'story-card';
      div.innerHTML = `<h4>${s.title}</h4><p>${s.text}</p>`;
      storiesGrid.appendChild(div);
    });
}


/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    if (list) {
        renderItems();
    }
});
