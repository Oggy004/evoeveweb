function escapeHtml(value) {
  const el = document.createElement("span");
  el.textContent = value == null ? "" : String(value);
  return el.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatBudget(k) {
  if (k == null || k === "") return "—";
  return `AED ${k}K`;
}

function showDashboardMessage(text, type) {
  const el = document.getElementById("adminDashboardMessage");
  if (!el) return;
  if (!text) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.textContent = text;
  el.className = `form-message form-message--${type}`;
  el.hidden = false;
}

function redirectToLogin() {
  window.location.href = "login.html?redirect=admin.html";
}

async function loadInquiries() {
  const client = getSupabaseClient();
  const tbody = document.getElementById("adminInquiriesBody");
  const totalEl = document.getElementById("adminTotalCount");
  const showingEl = document.getElementById("adminShowingCount");

  if (!client || !tbody) {
    showDashboardMessage("Supabase is not configured.", "error");
    return;
  }

  tbody.innerHTML = `<tr><td colspan="9" class="admin-empty">Loading…</td></tr>`;
  showDashboardMessage("");

  const { count, error: countError } = await client
    .from("contact_inquiries")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error(countError);
    tbody.innerHTML = `<tr><td colspan="10" class="admin-empty">Could not load count. Check the table and your login.</td></tr>`;
    showDashboardMessage(countError.message, "error");
    return;
  }

  const { data, error } = await client
    .from("contact_inquiries")
    .select(
      "id, created_at, full_name, email, phone, country, company, client_type, budget_k, project_details"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="10" class="admin-empty">Could not load inquiries.</td></tr>`;
    showDashboardMessage(error.message, "error");
    return;
  }

  const rows = data || [];
  if (totalEl) totalEl.textContent = String(count ?? rows.length);
  if (showingEl) showingEl.textContent = String(rows.length);

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="admin-empty">No inquiries yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(
      (row) => `
    <tr>
      <td>${escapeHtml(formatDate(row.created_at))}</td>
      <td>${escapeHtml(row.full_name)}</td>
      <td><a href="mailto:${escapeHtml(row.email)}">${escapeHtml(row.email)}</a></td>
      <td>${escapeHtml(row.phone || "—")}</td>
      <td>${escapeHtml(row.country || "—")}</td>
      <td>${escapeHtml(row.company || "—")}</td>
      <td>${escapeHtml(row.client_type || "—")}</td>
      <td>${escapeHtml(formatBudget(row.budget_k))}</td>
      <td class="admin-details-cell">${escapeHtml(row.project_details || "—")}</td>
      <td>
        <button type="button" class="btn btn-secondary btn-danger" data-record-id="${escapeHtml(row.id)}">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");
}

async function initAdmin() {
  const client = getSupabaseClient();
  const signOutBtn = document.getElementById("adminSignOutBtn");
  const refreshBtn = document.getElementById("adminRefreshBtn");
  const signedInAs = document.getElementById("adminSignedInAs");

  if (!client) {
    redirectToLogin();
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) {
    redirectToLogin();
    return;
  }

  if (signedInAs) {
    signedInAs.textContent = `Signed in as ${session.user.email}`;
  }

  await loadInquiries();

  signOutBtn?.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "login.html";
  });

  refreshBtn?.addEventListener("click", () => loadInquiries());

  const tbody = document.getElementById("adminInquiriesBody");
  tbody?.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-record-id]");
    if (btn) {
      deleteInquiry(btn.dataset.recordId);
    }
  });

  client.auth.onAuthStateChange((_event, newSession) => {
    if (!newSession) {
      redirectToLogin();
    }
  });
}

async function deleteInquiry(id) {
  const client = getSupabaseClient();
  if (!client) {
    showDashboardMessage("Supabase is not configured.", "error");
    return;
  }

  if (!id || !window.confirm("Delete this inquiry? This action cannot be undone.")) {
    return;
  }

  const { error } = await client
    .from("contact_inquiries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    showDashboardMessage(error.message, "error");
    return;
  }

  showDashboardMessage("Inquiry deleted successfully.", "success");
  await loadInquiries();
}

document.addEventListener("DOMContentLoaded", initAdmin);
