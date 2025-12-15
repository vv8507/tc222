/* 將以下全部內容替換您現有的 script.js 檔案 */

const CURRENT_USER='currentUser';
const ITEM_KEY='donatedItems';

const list=document.getElementById('item-list');
const form=document.getElementById('donation-form');
const donateSection=document.getElementById('donate');
const authArea=document.getElementById('authArea');
const searchInput=document.getElementById('searchInput');
const filterBtns=document.querySelectorAll('.filter');
const imageInput=document.getElementById('itemImage');
const preview=document.getElementById('imagePreview');
const storiesGrid=document.getElementById('storiesGrid');

let imgData=null;
let currentCategory='All';

/* ===== User ===== */
function getUser(){
  return JSON.parse(localStorage.getItem(CURRENT_USER));
}

/* ===== Auth UI ===== */
function updateAuthUI(){
  const user=getUser();

  if(user){
    // 使用暱稱，如果沒有則退回使用 Email
    const displayName = user.nickname || user.email; 
    authArea.innerHTML=`Hi, ${displayName}
      <button class="btn outline small" id="logoutBtn">Logout</button>`;
    donateSection.style.display='block';

    document.getElementById('logoutBtn').onclick=()=>{
      localStorage.removeItem(CURRENT_USER);
      location.reload();
    };
  }else{
    authArea.innerHTML=`<a href="login.html" class="btn outline small">Login</a>`;
    donateSection.style.display='none';
  }
}

/* ===== Items ===== */
function getItems(){
  return JSON.parse(localStorage.getItem(ITEM_KEY))||[];
}
function saveItems(items){
  localStorage.setItem(ITEM_KEY,JSON.stringify(items));
}

function renderItems(){
  let items=getItems();
  list.innerHTML='';
  
  // 檢查 list 元素是否存在
  if (!list) return;

  if(currentCategory!=='All'){
    items=items.filter(i=>i.category===currentCategory);
  }

  const keyword=searchInput.value.toLowerCase();
  if(keyword){
    items=items.filter(i=>i.name.toLowerCase().includes(keyword));
  }

  if(items.length===0){
    // 使用 grid-column:1/-1 確保提示文本橫跨整個網格區域並居中
    list.innerHTML='<p style="grid-column:1/-1; text-align:center; font-size:1.2em; color:#777;">No items found in this category or search.</p>';
    return;
  }
  
  items.forEach(i=>{
    const div=document.createElement('div');
    div.className='item-card';
    
    // 🌟 核心修正：提供預設值，解決 undefined 和圖片缺失問題 🌟
    const imageSrc = i.image || 'https://via.placeholder.com/400x300'; // 圖片佔位符
    const itemName = i.name || 'Untitled Item';
    const itemDesc = i.desc || 'No description provided.';
    const donatedBy = i.nickname || i.email || 'Anonymous'; 

    div.innerHTML=`
      <img src="${imageSrc}" alt="${itemName}">
      <div class="item-info">
        <h4>${itemName}</h4>
        <p>${itemDesc}</p>
        <p><strong>Donated by:</strong> ${donatedBy}</p>
        <span class="tag">${i.category}</span>
      </div>`;
    list.appendChild(div);
  });
}

/* ===== Donate ===== */
imageInput?.addEventListener('change',e=>{
  const reader=new FileReader();
  reader.onload=()=>{imgData=reader.result;preview.innerHTML=`<img src="${imgData}">`};
  reader.readAsDataURL(e.target.files[0]);
});

form?.addEventListener('submit',e=>{
  e.preventDefault();
  const user=getUser();
  const data=new FormData(form);
  const items=getItems();

  items.push({
    name:data.get('itemName'),
    desc:data.get('description'),
    category:data.get('category'),
    image:imgData,
    email:user.email,
    nickname: user.nickname 
  });

  saveItems(items);
  form.reset();
  preview.innerHTML='';
  imgData = null;
  alert('Item successfully donated!');
  renderItems();
});

/* ===== Filter & Search ===== */
filterBtns.forEach(b=>{
  b.onclick=()=>{
    filterBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentCategory=b.dataset.category;
    renderItems();
  };
});
searchInput?.addEventListener('input',renderItems);

/* ===== Stories (Dynamic) ===== */
const stories=[
  {title:'📚 Helping Students',text:'Donated textbooks helped students learn.'},
  {title:'🧥 Warm Winters',text:'Winter clothes supported families.'},
  {title:'🍳 Community Kitchens',text:'Appliances helped prepare meals.'}
];

stories.forEach(s=>{
  const div=document.createElement('div');
  div.className='story-card';
  div.innerHTML=`<h4>${s.title}</h4><p>${s.text}</p>`;
  storiesGrid.appendChild(div);
});

/* ===== Init ===== */
updateAuthUI();
renderItems();
