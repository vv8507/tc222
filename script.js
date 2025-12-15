const CURRENT_USER = 'currentUser';
const ITEM_KEY = 'donatedItems';

const form = document.getElementById('donation-form');
const list = document.getElementById('item-list');
const imageInput = document.getElementById('itemImage');
const preview = document.getElementById('imagePreview');

let img = null;

function getUser(){
  return JSON.parse(localStorage.getItem(CURRENT_USER));
}

function getItems(){
  return JSON.parse(localStorage.getItem(ITEM_KEY)) || [];
}

function saveItems(i){
  localStorage.setItem(ITEM_KEY, JSON.stringify(i));
}

function render(){
  list.innerHTML = '';
  getItems().forEach(i=>{
    list.innerHTML += `
      <div class="item-card">
        <img src="${i.image}">
        <div style="padding:15px">
          <h4>${i.name}</h4>
          <p>${i.desc}</p>
        </div>
      </div>`;
  });
}

imageInput.onchange = e => {
  const r = new FileReader();
  r.onload = () => {
    img = r.result;
    preview.innerHTML = `<img src="${img}" style="max-height:140px">`;
  };
  r.readAsDataURL(e.target.files[0]);
};

form.onsubmit = e => {
  e.preventDefault();
  if(!getUser()){
    alert('Please login first');
    location.href = 'login.html';
    return;
  }

  const f = new FormData(form);
  const items = getItems();
  items.push({
    name: f.get('itemName'),
    desc: f.get('description'),
    image: img
  });

  saveItems(items);
  render();
  form.reset();
  preview.innerHTML = '';
};

render();
