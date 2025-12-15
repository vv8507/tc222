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
    authArea.innerHTML=`Hi, ${user.nickname}
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
    items=items.filter(i=>
      (i.name||'').toLowerCase().includes(keyword) ||
      (i.desc||'').toLowerCase().includes(keyword) ||
      (i.category||'').toLowerCase().includes(keyword)
    );
  }

  if(items.length===0){
    list.innerHTML='<p style="grid-column:1/-1;text-align:center;">No items found.</p>';
    return;
  }

  items.forEach(i=>{
    const div=document.createElement('div');
    div.className='item-card';
    div.innerHTML=`
      <img src="${i.image||'https://via.placeholder.com/400x300'}">
      <div class="item-info">
        <h4>${i.name||'Untitled Item'}</h4>
        <p>${i.desc||''}</p>
        <p><strong>Donated by:</strong> ${i.nickname}</p>
        <span class="tag">${i.category}</span>
      </div>`;
    list.appendChild(div);
  });
}

/* ===== Donate ===== */
imageInput?.addEventListener('change',e=>{
  const reader=new FileReader();
  reader.onload=()=>{
    imgData=reader.result;
    preview.innerHTML=`<img src="${imgData}">`;
  };
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
    nickname:user.nickname
  });

  saveItems(items);
  form.reset();
  preview.innerHTML='';
  imgData=null;
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

/* ===== Stories ===== */
const stories=[
  {title:'📚 Helping Students',text:'Textbooks donated to help students learn.'},
  {title:'🧥 Warm Winters',text:'Clothes donated to families in need.'},
  {title:'🍳 Community Kitchens',text:'Appliances shared with volunteers.'}
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
