import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function cleanCategory(raw: string): string {
  if (!raw) return 'General';
  const cleaned = raw
    .split(',')
    .map(c => c.trim())
    .map(c => c.replace(/^[a-z]{2}:/i, ''))
    .filter(c => c.length > 0 && !c.includes(':'))
    .filter(c => c.length < 30)
    .filter(c => !/^\d+$/.test(c))
    .pop();
  return cleaned || 'General';
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const response = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.1,
      }),
    },
    8000
  );
  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

// Query any Open Food Facts-style API (they all share the same response format)
async function queryOpenFactsAPI(url: string, apiName: string): Promise<{name?: string, category?: string, image?: string} | null> {
  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status === 1 && data.product) {
      const p = data.product;
      const name = p.product_name || p.generic_name || null;
      const category = p.categories ? cleanCategory(p.categories) : null;
      const image = p.image_front_url || p.image_url || null;
      if (name || image) {
        console.log(`[swift-action] ${apiName} found — name: ${name}, cat: ${category}`);
        return { name, category, image };
      }
    }
    return null;
  } catch (e) {
    console.error(`[swift-action] ${apiName} failed:`, e.message);
    return null;
  }
}

interface ProductResult {
  product_name?: string;
  category?: string;
  images: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { barcode: rawBarcode, owner_id: rawOwnerId } = await req.json();
    const barcode = typeof rawBarcode === "string" ? rawBarcode.trim() : "";
    if (!/^[A-Za-z0-9._:-]{1,64}$/.test(barcode)) {
      return new Response(JSON.stringify({ error: "A valid barcode is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const authorization = req.headers.get("Authorization") || "";
    const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    const isScannerCall = req.headers.get("apikey") === SUPABASE_SERVICE_ROLE_KEY;
    let rateLimitSubject: string;
    let rateLimitBucket: string;
    let requestLimit: number;

    if (isScannerCall) {
      if (typeof rawOwnerId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawOwnerId)) {
        return new Response(JSON.stringify({ error: "Invalid scanner owner" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
        });
      }
      rateLimitSubject = rawOwnerId;
      rateLimitBucket = "swift-action-device";
      requestLimit = 120;
    } else {
      if (!bearer) return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: authorization } },
      });
      const { data: { user }, error: authError } = await authClient.auth.getUser(bearer);
      if (authError || !user) return new Response(JSON.stringify({ error: "Invalid session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
      rateLimitSubject = user.id;
      rateLimitBucket = "swift-action-user";
      requestLimit = 30;
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: rateAllowed, error: rateError } = await admin.rpc("consume_edge_rate_limit", {
      p_subject_id: rateLimitSubject,
      p_bucket: rateLimitBucket,
      p_limit: requestLimit,
      p_window_seconds: 60,
    });
    if (rateError) {
      console.error("[swift-action] Rate-limit check failed");
      return new Response(JSON.stringify({ error: "Lookup service is temporarily unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503,
      });
    }
    if (!rateAllowed) return new Response(JSON.stringify({ error: "Lookup limit reached. Try again shortly." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429,
    });
    console.log(`[swift-action] Looking up barcode: ${barcode}`);

    if (!barcode) {
      return new Response(JSON.stringify({ error: "Barcode is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const barcodeLookupKey = Deno.env.get("BARCODE_LOOKUP_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const goUpcKey = Deno.env.get("GO_UPC_API_KEY");

    const best: ProductResult = { images: [] };

    // Helper to merge result into best
    function mergeResult(result: {name?: string, category?: string, image?: string} | null) {
      if (!result) return;
      if (!best.product_name && result.name) best.product_name = result.name;
      if (!best.category && result.category) best.category = result.category;
      if (result.image && !best.images.includes(result.image)) best.images.push(result.image);
    }

    // ── Run all Open Facts APIs in parallel for speed ─────────────────────
    console.log("[swift-action] Querying all Open Facts databases in parallel...");
    const [offResult, beautyResult, productsResult] = await Promise.all([
      // 1. Open Food Facts — food & beverages
      queryOpenFactsAPI(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        "Open Food Facts"
      ),
      // 2. Open Beauty Facts — cosmetics, skincare, haircare
      queryOpenFactsAPI(
        `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
        "Open Beauty Facts"
      ),
      // 3. Open Products Facts — household, cleaning products
      queryOpenFactsAPI(
        `https://world.openproductsfacts.org/api/v0/product/${barcode}.json`,
        "Open Products Facts"
      ),
    ]);

    mergeResult(offResult);
    mergeResult(beautyResult);
    mergeResult(productsResult);

    // ── 4. UPCitemdb ──────────────────────────────────────────────────────
    if (!best.product_name || !best.category) {
      try {
        console.log("[swift-action] Trying UPCitemdb...");
        const upcResponse = await fetchWithTimeout(
          `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
        );
        if (upcResponse.ok) {
          const upcData = await upcResponse.json();
          if (upcData.code === "OK" && upcData.items?.length > 0) {
            const item = upcData.items[0];
            if (!best.product_name && item.title) best.product_name = item.title;
            if (!best.category && item.category) best.category = cleanCategory(item.category);
            if (item.images?.length > 0) {
              for (const img of item.images) {
                if (!best.images.includes(img)) best.images.push(img);
              }
            }
            console.log(`[swift-action] UPC result — name: ${best.product_name}, cat: ${best.category}`);
          }
        }
      } catch (e) {
        console.error("[swift-action] UPCitemdb failed:", e.message);
      }
    }

    // ── 5. Go UPC (free tier 100/day) ─────────────────────────────────────
    if (goUpcKey && (!best.product_name || !best.category)) {
      try {
        console.log("[swift-action] Trying Go UPC...");
        const goUpcResponse = await fetchWithTimeout(
          `https://go-upc.com/api/v1/code/${barcode}`,
          { headers: { 'Authorization': `Bearer ${goUpcKey}` } }
        );
        if (goUpcResponse.ok) {
          const goData = await goUpcResponse.json();
          if (goData.product) {
            const p = goData.product;
            if (!best.product_name && p.name) best.product_name = p.name;
            if (!best.category && p.category) best.category = cleanCategory(p.category);
            if (p.imageUrl && !best.images.includes(p.imageUrl)) best.images.push(p.imageUrl);
            console.log(`[swift-action] Go UPC result — name: ${best.product_name}`);
          }
        }
      } catch (e) {
        console.error("[swift-action] Go UPC failed:", e.message);
      }
    }

    // ── 6. BarcodeLookup paid API ─────────────────────────────────────────
    if (barcodeLookupKey && (!best.product_name || !best.category)) {
      try {
        console.log("[swift-action] Trying BarcodeLookup...");
        const blResponse = await fetchWithTimeout(
          `https://api.barcodelookup.com/v3/products?barcode=${barcode}&key=${barcodeLookupKey}`
        );
        if (blResponse.ok) {
          const data = await blResponse.json();
          if (data.products?.length > 0) {
            const p = data.products[0];
            if (!best.product_name && p.title) best.product_name = p.title;
            if (!best.category && p.category) best.category = cleanCategory(p.category);
            if (p.images?.length > 0) {
              for (const img of p.images) {
                if (!best.images.includes(img)) best.images.push(img);
              }
            }
            console.log(`[swift-action] BarcodeLookup result — name: ${best.product_name}`);
          }
        }
      } catch (e) {
        console.error("[swift-action] BarcodeLookup failed:", e.message);
      }
    }

    // ── 7. Groq — identify unknown OR normalize category ──────────────────
    if (groqKey) {
      try {
        if (!best.product_name) {
          // Product completely unknown — ask Groq to identify
          console.log("[swift-action] Asking Groq to identify product...");
          const result = await callGroq(groqKey,
            `What product has barcode "${barcode}"? Return JSON only: {"name":"Product Name","category":"Category"} or {"name":"NOT_FOUND","category":"General"} if unknown. No other text.`
          );
          const cleaned = result.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.name && parsed.name !== 'NOT_FOUND') {
            best.product_name = parsed.name;
            best.category = parsed.category || 'General';
            console.log(`[swift-action] Groq identified: ${best.product_name} / ${best.category}`);
          }
        } else {
          // Product found — normalize category
          console.log(`[swift-action] Normalizing category: "${best.category}"`);
          const normalized = await callGroq(groqKey,
            `Product: "${best.product_name}", Raw category: "${best.category || 'unknown'}".
Return a single clean English category (1-2 words max).
Choose from: Beverages, Food, Snacks, Dairy, Bakery, Medicine, Supplements, Cosmetics, Skincare, Haircare, Electronics, Household, Cleaning, Stationery, Clothing, Toys, Sports, Automotive.
Same product type always gets same category regardless of size or variant.
Return ONLY the category word, nothing else.`
          );
          if (normalized && normalized.length < 30) {
            console.log(`[swift-action] Category: "${best.category}" → "${normalized}"`);
            best.category = normalized;
          }
        }
      } catch (e) {
        console.error("[swift-action] Groq failed:", e.message);
      }
    }

    // ── Return final result ───────────────────────────────────────────────
    const finalName = best.product_name || `Unknown (${barcode})`;
    const finalCategory = best.category || 'General';

    console.log(`[swift-action] Final — name: ${finalName}, cat: ${finalCategory}, images: ${best.images.length}`);

    return new Response(JSON.stringify({
      products: [{
        product_name: finalName,
        category: finalCategory,
        images: best.images
      }]
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[swift-action] Unhandled error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
