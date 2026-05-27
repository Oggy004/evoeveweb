async function initResetPassword() {
  const client = getSupabaseClient();
  const form = document.getElementById("resetPasswordForm");
  const waitingEl = document.getElementById("resetWaiting");

  if (!client || !form) return;

  let ready = false;

  client.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      ready = true;
      waitingEl?.classList.add("hidden");
      form.classList.remove("hidden");
    }
  });

  const { data: { session } } = await client.auth.getSession();
  if (session) {
    ready = true;
    waitingEl?.classList.add("hidden");
    form.classList.remove("hidden");
  }

  setTimeout(() => {
    if (!ready && waitingEl) {
      waitingEl.innerHTML =
        '<p class="form-message form-message--error">Invalid or expired link. Request a new one from <a href="login.html">admin login</a>.</p>';
    }
  }, 3000);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showAuthMessage(form, "");

    const password = document.getElementById("newPassword")?.value;
    const confirm = document.getElementById("confirmPassword")?.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!password || password.length < 8) {
      showAuthMessage(form, "Password must be at least 8 characters.", "error");
      return;
    }
    if (password !== confirm) {
      showAuthMessage(form, "Passwords do not match.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating…";
    }

    const { error } = await client.auth.updateUser({ password });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Update password";
    }

    if (error) {
      showAuthMessage(form, error.message, "error");
      return;
    }

    showAuthMessage(form, "Password updated. Redirecting to login…", "success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", initResetPassword);
