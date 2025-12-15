const CURRENT_USER = 'currentUser';
const ITEM_KEY = 'donatedItems';

const form = document.getElementById('donation-form');
const list = document.getElementById('item-list');
const imageInput = document.getElementById('itemImage');
const preview = document.getElementById('imagePreview');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter');

let imgData = null;
let currentCategory = 'All';

/* ===== 使用者 ===== */
function getUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER));
}

/* ===== Items ===== */
function getItems() {
  return JSON.parse(localStorage.getItem(ITEM_KEY)) || [];
}

function saveItems(items) {
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
}

/* ===== Render ===== */
function renderItems() {
  list.innerHTML = '';

  let items = getItems();

  if (currentCategory !== 'All') {
    items = items.filter(i => i.category === currentCategory);
  }

  const keyword = searchInput?.value.toLowerCase() || '';
  if (keyword) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(keyword) ||
      i.desc.toLowerCase().includes(keyword)
    );
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const imgSrc = item.image || 'https://via.placeholder.com/400x300?text=No+Image';

card.innerHTML = `
  <img src="${imgSrc}" alt="">
  <div class="item-info">
    <h4>${item.name}</h4>
    <p>${item.desc}</p>
    <span class="tag">${item.category}</span>
  </div>
`;


    list.appendChild(card);
  });

  if (items.length === 0) {
    list.innerHTML = `<p style="grid-column:1/-1;text-align:center;">No items found.</p>`;
  }
}

/* ===== Image Preview ===== */
imageInput?.addEventListener('change', e => {
  const reader = new FileReader();
  reader.onload = () => {
    imgData = reader.result;
    preview.innerHTML = `<img src="${imgData}">`;
  };
  reader.readAsDataURL(e.target.files[0]);
});

/* ===== Donate ===== */
form?.addEventListener('submit', e => {
  e.preventDefault();

  if (!getUser()) {
    alert('Please login first');
    location.href = 'login.html';
    return;
  }

  const data = new FormData(form);
  const items = getItems();

  items.push({
    name: data.get('itemName'),
    desc: data.get('description'),
    category: data.get('category'),
    image: imgData
  });

  saveItems(items);
  form.reset();
  preview.innerHTML = '';
  imgData = null;

  location.href = '#items';
  renderItems();
});

/* ===== Filter ===== */
filterBtns.forEach(btn => {
  btn.onclick = () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderItems();
  };
});

/* ===== Search ===== */
searchInput?.addEventListener('input', renderItems);

/* ===== Auth UI ===== */
const authArea = document.getElementById('authArea');

function updateAuthUI() {
  const user = getUser();
  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <span style="margin-right:10px;">Hi, ${user.email}</span>
      <button class="btn outline small" id="logoutBtn">Logout</button>
    `;
    document.getElementById('logoutBtn').onclick = () => {
      localStorage.removeItem(CURRENT_USER);
      location.reload();
    };
  } else {
    authArea.innerHTML = `<a href="login.html" class="btn outline small">Login</a>`;
  }
}

/* ===== Init ===== */
updateAuthUI();
renderItems();
