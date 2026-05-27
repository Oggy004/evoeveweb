function isSupabaseConfigured() {
  const { url, anonKey } = window.EVOEVE_SUPABASE || {};
  return Boolean(
    url &&
      anonKey &&
      !String(url).includes("your-project") &&
      !String(anonKey).includes("your-anon")
  );
}

function getSupabaseClient() {
  if (!window.supabase?.createClient) {
    console.error("Supabase JS library not loaded.");
    return null;
  }
  if (!isSupabaseConfigured()) {
    console.warn(
      "Supabase is not configured. Add keys to .env and run: npm run config"
    );
    return null;
  }
  const { url, anonKey } = window.EVOEVE_SUPABASE;
  return window.supabase.createClient(url, anonKey);
}
