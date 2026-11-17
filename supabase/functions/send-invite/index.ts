import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_KEY") || Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("INVITE_FROM_EMAIL") || "no-reply@barcodesscanner.com";
const APP_NAME = "BarcodesScanner Pro";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.barcodesscanner.pro";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
function escapeHtml(value: string) { return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!authorization || !token) return json({ error: "Authentication required" }, 401);
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Invalid session" }, 401);
    const body = await req.json().catch(() => null);
    const joinCode = typeof body?.join_code === "string" ? body.join_code.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{4,32}$/.test(joinCode)) return json({ error: "Invalid invite code" }, 400);
    if (!RESEND_API_KEY) return json({ error: "Email service is not configured" }, 503);
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: rateAllowed, error: rateError } = await admin.rpc('consume_edge_rate_limit', {
      p_subject_id: user.id,
      p_bucket: 'send-invite',
      p_limit: 6,
      p_window_seconds: 3600,
    });
    if (rateError) {
      console.error('[send-invite] Rate limit check failed');
      return json({ error: 'Invite service is temporarily unavailable' }, 503);
    }
    if (!rateAllowed) return json({ error: 'Invite email limit reached. Try again later.' }, 429);

    const { data: invite, error: inviteError } = await admin.from("workspace_invites")
      .select("id, workspace_id, invited_email, invited_by, role, accepted, expires_at")
      .eq("join_code", joinCode).eq("invited_by", user.id).maybeSingle();
    if (inviteError || !invite || invite.accepted || !invite.expires_at || new Date(invite.expires_at) <= new Date()) return json({ error: "Pending invite not found" }, 404);
    if (!invite.invited_email || !user.email) return json({ error: "Invite recipient is not set" }, 400);
    if (!["viewer", "editor"].includes(invite.role)) return json({ error: "Invalid invite role" }, 400);
    const { data: workspace, error: workspaceError } = await admin.from("workspaces")
      .select("name, owner_id").eq("id", invite.workspace_id).maybeSingle();
    if (workspaceError || !workspace || workspace.owner_id !== user.id) return json({ error: "Not authorized to send this invite" }, 403);
    const ownerEmail = user.email;
    const workspaceName = escapeHtml(workspace.name || "My Workspace");
    const code = escapeHtml(joinCode);
    const role = invite.role;
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>You're invited to ${escapeHtml(APP_NAME)}</title></head><body style="font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:32px 16px"><main style="max-width:480px;margin:auto;background:white;border-radius:20px;padding:32px"><h1>You're invited to ${escapeHtml(APP_NAME)}</h1><p><strong>${escapeHtml(ownerEmail)}</strong> invited you to ${role === "editor" ? "edit" : "view"} <strong>${workspaceName}</strong>.</p><p>Your join code:</p><p style="padding:20px;background:#f1f5f9;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p><p>${role.toUpperCase()} ACCESS</p><p>Sign in, open Family Sharing, and choose Join with Code.</p><p><a href="${PLAY_STORE_URL}">Get it on Google Play</a></p><small>This invite expires in 7 days. Ignore this email if you did not expect it.</small></main></body></html>`;
    const resendResponse = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` }, body: JSON.stringify({ from: `${APP_NAME} <${FROM_EMAIL}>`, to: [invite.invited_email], subject: `${ownerEmail} invited you to their ${APP_NAME} inventory`, html }) });
    const resendData = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) { console.error("[send-invite] Resend error", resendResponse.status); return json({ error: "Unable to send invite email" }, 502); }
    return json({ success: true, email_id: resendData.id });
  } catch (error) {
    console.error("[send-invite] Request failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Unable to process invite" }, 500);
  }
});
