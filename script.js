/* ===== User Auth ===== */
function register() {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const nickname = document.getElementById("regNickname").value;

  if (!email || !password || !nickname) {
    alert("Please fill in all fields");
    return;
  }

  const user = { email, password, nickname };
  localStorage.setItem("user", JSON.stringify(user));

  alert("Register successful! Please login.");
  window.location.href = "login.html";
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (!savedUser) {
    alert("No user found. Please register first.");
    return;
  }

  if (email === savedUser.email && password === savedUser.password) {
    localStorage.setItem("currentUser", JSON.stringify(savedUser));
    window.location.href = "index.html";
  } else {
    alert("Wrong email or password");
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.reload();
}

/* ===== Auth UI Control ===== */
function checkLogin() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const donateSection = document.getElementById("donate");
  const authArea = document.getElementById("authArea");
  const welcomeText = document.getElementById("welcomeText");

  if (user) {
    if (donateSection) donateSection.style.display = "block";
    if (authArea) {
      authArea.innerHTML = `
        <span id="welcomeText">Hi ${user.nickname}</span>
        <button class="btn outline small" onclick="logout()">Logout</button>
      `;
    }
  } else {
    if (donateSection) donateSection.style.display = "none";
  }
}

/* ===== Items ===== */
let items = JSON.parse(localStorage.getItem("items")) || [];

function renderItems(list = items) {
  const container = document.getElementById("itemsGrid");
  if (!container) return;

  container.innerHTML = "";

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const imgSrc = item.image || "https://via.placeholder.com/400x300?text=No+Image";

    card.innerHTML = `
      <img src="${imgSrc}">
      <div class="item-info">
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
        <p><strong>Donated by:</strong> ${item.donor}</p>
        <span class="tag">${item.category}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ===== Donate ===== */
function donateItem() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Please login first");
    return;
  }

  const name = document.getElementById("itemName").value;
  const desc = document.getElementById("itemDesc").value;
  const category = document.getElementById("itemCategory").value;
  const image = document.getElementById("itemImage").value;

  if (!name || !desc) {
    alert("Please fill required fields");
    return;
  }

  items.push({
    name,
    desc,
    category,
    image,
    donor: user.nickname
  });

  localStorage.setItem("items", JSON.stringify(items));
  renderItems();
  alert("Item donated successfully!");
}

/* ===== Filter ===== */
function filterItems(category) {
  document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");

  if (category === "All") {
    renderItems(items);
  } else {
    renderItems(items.filter(i => i.category === category));
  }
}

/* ===== Search ===== */
function searchItems() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(keyword) ||
    i.desc.toLowerCase().includes(keyword)
  );
  renderItems(filtered);
}

/* ===== Stories ===== */
const stories = [
  {
    title: "📚 Helping Students Learn",
    text: "Donated books helped students who couldn’t afford textbooks."
  },
  {
    title: "🧥 Staying Warm Together",
    text: "Warm clothes were shared with families during winter."
  },
  {
    title: "🍳 Community Kitchen Support",
    text: "Appliances donated to help volunteers cook meals."
  }
];

function renderStories() {
  const grid = document.getElementById("storiesGrid");
  if (!grid) return;

  grid.innerHTML = "";
  stories.forEach(s => {
    const div = document.createElement("div");
    div.className = "story-card";
    div.innerHTML = `<h4>${s.title}</h4><p>${s.text}</p>`;
    grid.appendChild(div);
  });
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  renderItems();
  renderStories();
});
