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

  if(currentCategory!=='All'){
    items=items.filter(i=>i.category===currentCategory);
  }

  const keyword=searchInput.value.toLowerCase();
  if(keyword){
    items=items.filter(i=>i.name.toLowerCase().includes(keyword));
  }

  items.forEach(i=>{
    const div=document.createElement('div');
    div.className='item-card';
    
    // 優先顯示 nickname，若無則顯示 email
    const donatedBy = i.nickname || i.email || 'undefined'; 

    div.innerHTML=`
      <img src="${i.image}">
      <div class="item-info">
        <h4>${i.name}</h4>
        <p>${i.desc}</p>
        <p><strong>Donated by:</strong> ${donatedBy}</p>
        <span class="tag">${i.category}</span>
      </div>`;
    list.appendChild(div);
  });

  if(items.length===0){
    list.innerHTML='<p>No items found.</p>';
  }
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
    nickname: user.nickname // 儲存 nickname 
  });

  saveItems(items);
  form.reset();
  preview.innerHTML='';
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
