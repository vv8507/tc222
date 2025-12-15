/* ===== User Auth ===== */

function register() {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const nickname = document.getElementById("regNickname").value.trim();

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
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

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

/* ===== Init ===== */

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const authArea = document.getElementById("authArea");

  if (user && authArea) {
    authArea.innerHTML = `
      <span>Hi ${user.nickname}</span>
      <button class="btn outline small" onclick="logout()">Logout</button>
    `;
  }
});
