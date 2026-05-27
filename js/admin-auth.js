function getLoginErrorMessage(error) {
  if (!error) return "Sign in failed.";
  // Avoid exposing whether an account exists or confirmation state.
  if (
    error.message === "Invalid login credentials" ||
    error.message?.includes("Email not confirmed")
  ) {
    return "Invalid email or password.";
  }
  return "Unable to sign in right now. Please try again.";
}

async function initAdminAuth() {
  const client = getSupabaseClient();
  const signInForm = document.getElementById("adminSignInForm");
  const forgotForm = document.getElementById("adminForgotForm");

  if (!client) {
    showAuthMessage(signInForm || document.body, "Supabase is not configured.", "error");
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (session?.user) {
    window.location.href = getPostLoginRedirect();
    return;
  }

  document.querySelectorAll("[data-show-view]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setAuthView(btn.dataset.showView);
      showAuthMessage(signInForm, "");
      showAuthMessage(forgotForm, "");
    });
  });

  signInForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showAuthMessage(signInForm, "");

    const email = document.getElementById("adminEmail")?.value?.trim();
    const password = document.getElementById("adminPassword")?.value;
    const submitBtn = signInForm.querySelector('button[type="submit"]');

    if (!email || !password) {
      showAuthMessage(signInForm, "Enter email and password.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing in…";
    }

    const { error } = await client.auth.signInWithPassword({ email, password });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign in";
    }

    if (error) {
      showAuthMessage(signInForm, getLoginErrorMessage(error, email), "error");
      return;
    }

    window.location.href = getPostLoginRedirect();
  });

  forgotForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showAuthMessage(forgotForm, "");

    const email = document.getElementById("forgotEmail")?.value?.trim();
    const submitBtn = forgotForm.querySelector('button[type="submit"]');

    if (!email) {
      showAuthMessage(forgotForm, "Enter your admin email address.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send reset link";
    }

    if (error) {
      showAuthMessage(
        forgotForm,
        "If this email is registered, a reset link will be sent shortly.",
        "success"
      );
      return;
    }

    showAuthMessage(
      forgotForm,
      "If this email is registered, a reset link will be sent shortly.",
      "success"
    );
    forgotForm.reset();
  });
}

document.addEventListener("DOMContentLoaded", initAdminAuth);
