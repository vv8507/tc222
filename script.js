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
  // 獲取登入成功的用戶資訊 (包含 email 和 nickname)
  return JSON.parse(localStorage.getItem(CURRENT_USER));
}

/* ===== Auth UI ===== */
function updateAuthUI(){
  const user = getUser();
  if(user){
    // 確保 authArea 顯示用戶暱稱和登出按鈕
    authArea.innerHTML = `Hi, ${user.nickname}
      <button class="btn outline small" id="logoutBtn">Logout</button>`;
    
    // 登入後顯示捐贈區塊
    if (donateSection) {
        donateSection.style.display = 'block';
    }

    document.getElementById('logoutBtn').onclick = () => {
      localStorage.removeItem(CURRENT_USER);
      location.reload();
    };
  }else{
    // 未登入則顯示登入按鈕
    authArea.innerHTML = `<a href="login.html" class="btn outline small">Login</a>`;
    
    // 未登入則隱藏捐贈區塊
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
  list.innerHTML = '';

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

  if(items.length === 0){
    list.innerHTML = '<p style="grid-column:1/-1;text-align:center;">No items found.</p>';
    return;
  }

  // 3. 渲染
  items.forEach(i => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <img src="${i.image || 'https://via.placeholder.com/400x300'}" alt="${i.name}">
      <div class="item-info">
        <h4>${i.name || 'Untitled Item'}</h4>
        <p>${i.desc || ''}</p>
        <p><strong>Donated by:</strong> ${i.nickname || 'Anonymous'}</p>
        <span class="tag">${i.category}</span>
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
    nickname: user.nickname // 使用登入用戶的暱稱
  });

  saveItems(items);
  form.reset();
  preview.innerHTML = '';
  imgData = null;
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

/* ===== Stories ===== */
if (storiesGrid) {
    const stories = [
      {title:'📚 Helping Students',text:'Textbooks donated to help students learn.'},
      {title:'🧥 Warm Winters',text:'Clothes donated to families in need.'},
      {title:'🍳 Community Kitchens',text:'Appliances shared with volunteers.'}
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
    // 確保 item-list 存在才渲染
    if (list) {
        renderItems();
    }
});
