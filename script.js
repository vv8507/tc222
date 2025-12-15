const ITEM_KEY = 'donatedItems';
const USER_KEY = 'users';
const CURRENT_USER = 'currentUser';

const donationForm = document.getElementById('donation-form');
const itemList = document.getElementById('item-list');
const imageInput = document.getElementById('itemImage');
const preview = document.getElementById('imagePreview');

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const authArea = document.getElementById('authArea');
const authClose = document.getElementById('authClose');

let mode = 'login';
let imgBase64 = null;

/* ---------- AUTH ---------- */
function getUsers(){return JSON.parse(localStorage.getItem(USER_KEY))||[]}
function setUser(u){localStorage.setItem(CURRENT_USER,JSON.stringify(u));updateAuthUI()}
function getUser(){return JSON.parse(localStorage.getItem(CURRENT_USER))}

loginBtn.onclick=()=>openAuth('login')
registerBtn.onclick=()=>openAuth('register')
authClose.onclick=()=>authModal.style.display='none'

function openAuth(m){
  mode=m;
  authTitle.textContent=m==='login'?'Login':'Register';
  authSubmit.textContent=authTitle.textContent;
  authModal.style.display='flex';
}

authForm.onsubmit=e=>{
  e.preventDefault();
  const email=authForm.email.value;
  const pw=authForm.password.value;
  let users=getUsers();

  if(mode==='register'){
    if(users.find(u=>u.email===email)) return alert('Email exists');
    users.push({email,pw});
    localStorage.setItem(USER_KEY,JSON.stringify(users));
    setUser({email});
  }else{
    const u=users.find(u=>u.email===email&&u.pw===pw);
    if(!u) return alert('Invalid');
    setUser({email});
  }
  authModal.style.display='none';
}

function updateAuthUI(){
  const u=getUser();
  if(u){
    authArea.innerHTML=`Hi, ${u.email} <button class="btn outline small" id="logout">Logout</button>`;
    document.getElementById('logout').onclick=()=>{
      localStorage.removeItem(CURRENT_USER);
      location.reload();
    }
  }
}
updateAuthUI();

/* ---------- ITEMS ---------- */
function getItems(){return JSON.parse(localStorage.getItem(ITEM_KEY))||[]}
function saveItems(i){localStorage.setItem(ITEM_KEY,JSON.stringify(i))}

function render(items){
  itemList.innerHTML='';
  items.forEach(i=>{
    itemList.innerHTML+=`
      <div class="item-card">
        <img src="${i.image}">
        <div style="padding:15px">
          <h4>${i.name}</h4>
          <p>${i.desc}</p>
        </div>
      </div>`;
  })
}

imageInput.onchange=e=>{
  const r=new FileReader();
  r.onload=()=>{imgBase64=r.result;preview.innerHTML=`<img src="${imgBase64}" style="max-height:140px">`}
  r.readAsDataURL(e.target.files[0]);
}

donationForm.onsubmit=e=>{
  e.preventDefault();
  if(!getUser()) return alert('Please login first');
  const f=new FormData(donationForm);
  const items=getItems();
  items.push({name:f.get('itemName'),desc:f.get('description'),image:imgBase64});
  saveItems(items);
  render(items);
  donationForm.reset();preview.innerHTML='';
}

render(getItems());
