// supabase/functions/send-invite/index.ts
// Sends a family sharing invite email via Resend
//
// DEPLOY:
//   npx supabase functions deploy send-invite --no-verify-jwt --project-ref lfvpknapbzplcxrqqhbp --workdir C:\Users\49162\Downloads\OmniScanPro
//
// SECRETS (run once):
//   npx supabase secrets set RESEND_API_KEY=re_xxxx --project-ref lfvpknapbzplcxrqqhbp

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY  = Deno.env.get('RESEND_KEY') || Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PLAY_STORE_URL  = 'https://play.google.com/store/apps/details?id=com.omniscanpro.app';
const FROM_EMAIL      = 'onboarding@resend.dev';

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { to_email, join_code, role, invited_by_email, workspace_name } = await req.json();

    if (!to_email || !join_code) {
      return new Response(JSON.stringify({ error: 'Missing to_email or join_code' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const roleLabel     = role === 'editor' ? 'edit' : 'view';
    const roleDesc      = role === 'editor'
      ? 'You can view and edit the inventory, add items, and scan in/out.'
      : 'You can view the inventory in read-only mode.';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to OmniScan Pro</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">📦</div>
              <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">OmniScan Pro</div>
              <div style="font-size:12px;font-weight:600;color:#94a3b8;letter-spacing:2px;margin-top:4px;">INVENTORY MANAGER</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:24px;font-weight:900;color:#0f172a;margin:0 0 8px;">You're invited! 🎉</p>
              <p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.6;">
                <strong style="color:#0f172a;">${invited_by_email}</strong> has invited you to ${roleLabel} their inventory workspace
                <strong style="color:#0f172a;">"${workspace_name || 'My Workspace'}"</strong> on OmniScan Pro.
              </p>

              <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;font-weight:700;letter-spacing:1.5px;">YOUR JOIN CODE</p>
              <div style="background:#f1f5f9;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                <div style="font-size:42px;font-weight:900;color:#0f172a;letter-spacing:12px;">${join_code}</div>
                <div style="font-size:12px;color:#94a3b8;margin-top:8px;">Valid for 7 days</div>
              </div>

              <div style="background:#f0f9ff;border-radius:14px;padding:16px;margin-bottom:28px;border-left:3px solid #0284c7;">
                <p style="font-size:12px;font-weight:700;color:#0284c7;margin:0 0 4px;letter-spacing:1px;">${role.toUpperCase()} ACCESS</p>
                <p style="font-size:13px;color:#0f172a;margin:0;line-height:1.5;">${roleDesc}</p>
              </div>

              <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 12px;">How to join:</p>
              <ol style="padding-left:20px;margin:0 0 28px;">
                <li style="font-size:13px;color:#64748b;margin-bottom:8px;line-height:1.5;">Download <strong>OmniScan Pro</strong> from the Play Store</li>
                <li style="font-size:13px;color:#64748b;margin-bottom:8px;line-height:1.5;">Sign up or log in to your account</li>
                <li style="font-size:13px;color:#64748b;margin-bottom:8px;line-height:1.5;">Go to <strong>Profile → Family Sharing → Join with Code</strong></li>
                <li style="font-size:13px;color:#64748b;line-height:1.5;">Enter the code above</li>
              </ol>

              <a href="${PLAY_STORE_URL}"
                style="display:block;background:#0f172a;color:#ffffff;text-align:center;padding:16px;border-radius:14px;font-weight:800;font-size:14px;text-decoration:none;margin-bottom:12px;">
                📲 Download OmniScan Pro
              </a>

              <p style="font-size:11px;color:#94a3b8;text-align:center;margin:0;line-height:1.6;">
                Already have the app? Just enter the code in Profile → Family Sharing → Join with Code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="font-size:11px;color:#94a3b8;margin:0;">
                You received this because ${invited_by_email} invited you.<br/>
                If you didn't expect this, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [to_email],
        subject: `${invited_by_email} invited you to their OmniScan Pro inventory`,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('[send-invite] Resend error:', JSON.stringify(resendData));
      throw new Error(resendData.message || 'Failed to send email');
    }

    console.log('[send-invite] Email sent to:', to_email, 'id:', resendData.id);

    return new Response(JSON.stringify({ success: true, email_id: resendData.id }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[send-invite] Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }
});
