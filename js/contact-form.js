function getContactFormElements(form) {
  const inputs = form.querySelectorAll("input, textarea");
  const byPlaceholder = (text) =>
    [...inputs].find((el) => el.placeholder === text);

  const fullName = byPlaceholder("Full Name");
  const email = byPlaceholder("Email");
  const phone = byPlaceholder("Phone Number");
  const country = form.querySelector('select[name="country"]');
  const company = byPlaceholder("Company Name");
  const projectDetails = form.querySelector("textarea");
  const clientType = form.querySelector('input[name="type"]:checked');
  const budgetRange = document.getElementById("budgetRange");
  const terms = form.querySelector('input[type="checkbox"]');

  return {
    fullName,
    email,
    phone,
    country,
    company,
    projectDetails,
    clientType,
    budgetRange,
    terms,
  };
}

function showFormMessage(form, message, type) {
  let el = form.querySelector(".form-message");
  if (!el) {
    el = document.createElement("p");
    el.className = "form-message";
    form.insertBefore(el, form.querySelector(".submit-btn"));
  }
  el.textContent = message;
  el.className = `form-message form-message--${type}`;
  el.hidden = false;
}

function clearFormMessage(form) {
  const el = form.querySelector(".form-message");
  if (el) {
    el.hidden = true;
    el.textContent = "";
  }
}

async function submitContactToSupabase(form) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      error:
        "Supabase is not connected. Check .env, run npm run config, then run supabase/schema.sql in the Supabase SQL editor.",
    };
  }

  const {
    fullName,
    email,
    phone,
    country,
    company,
    projectDetails,
    clientType,
    budgetRange,
    terms,
  } = getContactFormElements(form);

  if (!fullName?.value?.trim() || !email?.value?.trim()) {
    return { ok: false, error: "Please enter your name and email." };
  }
  if (!terms?.checked) {
    return { ok: false, error: "Please accept the Terms & Conditions." };
  }

  let normalizedPhone = phone?.value?.trim()?.replace(/\s+/g, "") || null;
  const payload = {
    full_name: fullName.value.trim(),
    email: email.value.trim(),
    phone: normalizedPhone,
    country: country?.value || null,
    company: company?.value?.trim() || null,
    client_type: clientType?.value || null,
    budget_k: budgetRange ? Number(budgetRange.value) : null,
    project_details: projectDetails?.value?.trim() || null,
    terms_accepted: true,
  };

  const { error } = await client.from("contact_inquiries").insert(payload);

  if (error) {
    console.error("Supabase contact insert failed:", error);
    return {
      ok: false,
      error:
        error.message ||
        "Could not save your inquiry. Check the database table and RLS policies.",
    };
  }

  return { ok: true };
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormMessage(form);

    const submitBtn = form.querySelector(".submit-btn");
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    let result;
    try {
      result = await submitContactToSupabase(form);
    } catch (err) {
      console.error("Contact form error:", err);
      result = {
        ok: false,
        error: "Something went wrong. Refresh the page and try again.",
      };
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText || "Submit";
    }

    if (result.ok) {
      showFormMessage(
        form,
        "Thank you! Your inquiry was saved. We'll get back to you soon.",
        "success"
      );
      form.reset();
      const range = document.getElementById("budgetRange");
      const value = document.getElementById("rangeValue");
      if (range && value) {
        value.textContent = `Budget : AED ${range.value}K`;
      }
      return;
    }

    showFormMessage(form, result.error, "error");
  });
}

document.addEventListener("DOMContentLoaded", initContactForm);
