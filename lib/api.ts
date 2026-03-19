import { supabase } from "./supabaseClient";

/**
 * A production-ready wrapper around fetch that automatically 
 * retrieves the active Supabase session and attaches the JWT 
 * token to the Authorization header.
 * 
 * Use this for all calls to your Vercel/Next.js API routes.
 */
export async function authorizedFetch(url: string, options: RequestInit = {}) {
  // 1. Get the current session
  let session;
  try {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    session = currentSession;
  } catch (error: any) {
    // If we have an invalid refresh token error, sign out to clear the corrupted state
    if (error?.message?.includes('Refresh Token Not Found')) {
      await supabase.auth.signOut();
      window.location.href = "/login";
      return new Response(JSON.stringify({ error: "Session expired. Please sign in again." }), { status: 401 });
    }
    throw error;
  }

  if (!session?.access_token) {
    throw new Error("Authentication required. Please sign in to continue.");
  }

  // 2. Merge headers with Authorization Bearer token
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };

  // 3. Execute the fetch
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 4. Handle common error cases (401/403)
  if (response.status === 401 || response.status === 403) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Access Denied.");
  }

  return response;
}
