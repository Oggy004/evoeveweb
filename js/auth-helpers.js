function getAuthRedirectUrl() {
  return new URL("reset-password.html", window.location.href).href;
}

function getPostLoginRedirect() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get("redirect");
  if (target && !target.includes("://") && !target.startsWith("//")) {
    return target;
  }
  return "admin.html";
}

function showAuthMessage(container, text, type) {
  let el = container.querySelector(".form-message");
  if (!el) {
    el = document.createElement("p");
    el.className = "form-message";
    container.appendChild(el);
  }
  if (!text) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.textContent = text;
  el.className = `form-message form-message--${type}`;
  el.hidden = false;
}

function setAuthView(viewName) {
  document.querySelectorAll("[data-auth-view]").forEach((el) => {
    el.classList.toggle("hidden", el.dataset.authView !== viewName);
  });
}
