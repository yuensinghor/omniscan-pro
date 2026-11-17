// supabase/functions/share-item/index.ts
// Public share page for OmniScan Pro items.
// URL: https://<project>.supabase.co/functions/v1/share-item?token=<token>
//
// DEPLOY WITH:
//   npx supabase functions deploy share-item --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.omniscanpro.app';

Deno.serve(async (req: Request) => {
  const url    = new URL(req.url);
  const token  = url.searchParams.get('token');

  if (!token) {
    return new Response(errorPage('Invalid link.'), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff' } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Look up shared item
  const { data: shared, error: sharedErr } = await supabase
    .from('shared_items')
    .select('barcode, owner_id')
    .eq('token', token)
    .single();

  if (sharedErr || !shared) {
    return new Response(errorPage('This link is invalid or has expired.'), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff' },
    });
  }

  // Get product details
  const { data: product } = await supabase
    .from('products')
    .select('name, category, image_url')
    .eq('barcode', shared.barcode)
    .eq('owner_id', shared.owner_id)
    .single();

  const name     = product?.name     || shared.barcode;
  const category = product?.category || 'Product';
  const imageUrl = product?.image_url || '';

  // Try Open Food Facts for description
  let description = '';
  try {
    const offRes  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${shared.barcode}.json`);
    const offData = await offRes.json();
    if (offData.status === 1) {
      const p = offData.product;
      description =
        p.generic_name_en ||
        p.generic_name ||
        p.product_name_en ||
        '';
      if (!description && p.ingredients_text_en) {
        description = 'Ingredients: ' + p.ingredients_text_en.substring(0, 120) + '…';
      }
    }
  } catch (_) { /* not a food product, skip */ }

  return new Response(sharePage({ name, category, imageUrl, description, barcode: shared.barcode }), {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff' },
  });
});

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

// ─── Page templates ───────────────────────────────────────────────────────────

function sharePage({ name, category, imageUrl, description, barcode }: {
  name: string; category: string; imageUrl: string; description: string; barcode: string;
}) {
  const safeName = escapeHtml(name);
  const safeCategory = escapeHtml(category);
  const safeDescription = escapeHtml(description);
  const safeBarcode = escapeHtml(barcode);
  const safeImageUrl = /^https:\/\/[^\s"'<>]+$/i.test(imageUrl) ? escapeHtml(imageUrl) : "";

  const imgTag = safeImageUrl
    ? `<img src="${safeImageUrl}" alt="${safeName}" class="product-img" />`
    : `<div class="product-img-placeholder">📦</div>`;

  const descTag = safeDescription
    ? `<p class="description">${safeDescription}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta property="og:title" content="${safeName}" />
  <meta property="og:description" content="${safeDescription || 'Shared via OmniScan Pro'}" />
  ${safeImageUrl ? `<meta property="og:image" content="${safeImageUrl}" />` : ''}
  <title>${safeName} — OmniScan Pro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 40px;
    }
    .logo {
      font-size: 12px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 2px;
      margin-bottom: 24px;
      text-transform: uppercase;
    }
    .card {
      background: #fff;
      border-radius: 24px;
      border: 1px solid #f1f5f9;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      width: 100%;
      max-width: 400px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .product-img {
      width: 100%;
      height: 240px;
      object-fit: contain;
      background: #f8fafc;
      display: block;
    }
    .product-img-placeholder {
      width: 100%;
      height: 240px;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
    }
    .card-body { padding: 24px; }
    .category {
      font-size: 10px;
      font-weight: 800;
      color: #10b981;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .name {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .description {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .barcode {
      font-size: 11px;
      color: #cbd5e1;
      font-family: monospace;
    }
    .cta {
      background: #0f172a;
      border-radius: 20px;
      width: 100%;
      max-width: 400px;
      padding: 20px 24px;
      text-align: center;
      text-decoration: none;
      display: block;
      color: #fff;
    }
    .cta-tag {
      font-size: 10px;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .cta-title {
      font-size: 18px;
      font-weight: 900;
      color: #fff;
      margin-bottom: 4px;
    }
    .cta-sub {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 16px;
    }
    .cta-btn {
      background: #10b981;
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 1px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="logo">OmniScan Pro</div>

  <div class="card">
    ${imgTag}
    <div class="card-body">
      <div class="category">${safeCategory}</div>
      <div class="name">${safeName}</div>
      ${descTag}
      <div class="barcode">${safeBarcode}</div>
    </div>
  </div>

  <a href="${PLAY_STORE_URL}" class="cta">
    <div class="cta-tag">Free Download</div>
    <div class="cta-title">Build your own Mini Market</div>
    <div class="cta-sub">with OmniScan Pro</div>
    <div class="cta-btn">↓ Get it on Google Play</div>
  </a>
</body>
</html>`;
}

function errorPage(msg: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>OmniScan Pro</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;}
.box{text-align:center;padding:40px;}.icon{font-size:48px;margin-bottom:16px;}.msg{color:#64748b;font-size:14px;}</style>
</head><body><div class="box"><div class="icon">🔗</div><div class="msg">${msg}</div></div></body></html>`;
}
