const ITEM_STORAGE_KEY='donatedItems';
const APPLICATION_STORAGE_KEY='borrowApplications';
const donationForm=document.getElementById('donation-form');
const itemImageInput=document.getElementById('itemImage');
const imagePreviewDiv=document.getElementById('imagePreview');
const itemListDiv=document.getElementById('item-list');
let currentBase64Image=null;

function getItems(){const data=localStorage.getItem(ITEM_STORAGE_KEY);return data?JSON.parse(data):[];}
function saveItems(items){localStorage.setItem(ITEM_STORAGE_KEY,JSON.stringify(items));}
function getApplications(){const data=localStorage.getItem(APPLICATION_STORAGE_KEY);return data?JSON.parse(data):[];}
function saveApplications(apps){localStorage.setItem(APPLICATION_STORAGE_KEY,JSON.stringify(apps));}

function renderItems(items){
itemListDiv.innerHTML='';
if(items.length===0){itemListDiv.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#888;">No donated items yet.</p>';return;}
items.forEach(item=>{
const card=document.createElement('div');card.classList.add('item-card');
card.innerHTML=`<div class="item-image-wrap"><img src="${item.image}" alt="${item.itemName}" class="item-image"/></div>
<div class="item-info"><h4>${item.itemName} (${item.condition})</h4><p>Category: <strong>${item.category}</strong></p>
<p class="item-description">${item.description.substring(0,50)}...</p>
<button class="btn outline borrow-btn" data-item="${item.itemName}">Apply to Borrow</button></div>`;
itemListDiv.appendChild(card);
setTimeout(()=>{card.classList.add('visible');},100);});}

if(itemImageInput&&imagePreviewDiv){
itemImageInput.addEventListener('change',function(e){
const file=e.target.files[0];currentBase64Image=null;
if(file){imagePreviewDiv.innerHTML='';
if(!file.type.startsWith('image/')){imagePreviewDiv.innerHTML='<p style="color:red;">Please upload a valid image file.</p>';return;}
const reader=new FileReader();
reader.onload=function(e){currentBase64Image=e.target.result;
const img=document.createElement('img');img.src=currentBase64Image;img.classList.add('preview-image');imagePreviewDiv.appendChild(img);}
reader.readAsDataURL(file);}else{imagePreviewDiv.innerHTML='';}});}

if(donationForm){
donationForm.addEventListener('submit',function(e){
e.preventDefault();
if(!currentBase64Image){alert("Please wait for image to load.");return;}
const formData=new FormData(donationForm);
const newItem={itemName:formData.get('itemName'),category:formData.get('category'),condition:formData.get('condition'),description:formData.get('description'),image:currentBase64Image};
const items=getItems();items.push(newItem);saveItems(items);donationForm.reset();imagePreviewDiv.innerHTML='';currentBase64Image=null;renderItems(getItems());alert("Item added!");});}

document.addEventListener('click',function(e){
if(e.target.classList.contains('borrow-btn')){
const itemName=e.target.dataset.item;
const modal=document.getElementById('applicationsModal');modal.style.display='flex';
const name=prompt(`Enter your name to apply for "${itemName}":`);
if(!name)return;
const apps=getApplications();apps.push({itemName,applicant:name,date:new Date().toLocaleString()});saveApplications(apps);
renderApplications();
alert(`Application submitted for "${itemName}"!`);}});

function renderApplications(){
const list=document.getElementById('application-list');
list.innerHTML='';const apps=getApplications();if(apps.length===0){list.innerHTML='<p>No applications yet.</p>';return;}
apps.slice().reverse().forEach(a=>{const div=document.createElement('div');div.style.borderBottom='1px solid #ccc';div.style.padding='5px 0';div.innerHTML=`<strong>${a.itemName}</strong> by ${a.applicant} <small>${a.date}</small>`;list.appendChild(div);});}

document.getElementById('viewApplicationsBtn').addEventListener('click',function(){
document.getElementById('applicationsModal').style.display='flex';renderApplications();});
document.getElementById('closeModal').addEventListener('click',function(){document.getElementById('applicationsModal').style.display='none';});

renderItems(getItems());
