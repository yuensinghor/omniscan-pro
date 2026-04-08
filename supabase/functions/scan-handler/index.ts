import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { barcode, action, device_id } = await req.json()
    console.log(`!!! [REPORT] !!! Incoming MAC: ${device_id}, Barcode: ${barcode}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. LOOKUP: Find owner in 'devices' table
    const { data: deviceData } = await supabase
      .from('devices')
      .select('owner_id')
      .eq('mac_address', device_id.trim())
      .single()

    // Reject scans from unregistered devices
    if (!deviceData?.owner_id) {
      console.log(`[scan-handler] Unregistered device: ${device_id} — scan rejected`);
      return new Response(JSON.stringify({
        error: 'Device not registered. Please add it via the OmniScan Pro app.',
        registered: false,
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const foundOwnerId = deviceData.owner_id;

    // 2. PRODUCT LOOKUP: Call swift-action to get product info
    let product_name = barcode;
    let category = 'General';
    let image_url = '';
    let product_found = false;

    try {
      console.log(`[scan-handler] Looking up product info for barcode: ${barcode}`);
      const lookupResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/swift-action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({ barcode }),
        }
      );

      if (lookupResponse.ok) {
        const lookupData = await lookupResponse.json();
        if (lookupData.products && lookupData.products.length > 0) {
          const p = lookupData.products[0];
          product_name = p.product_name || barcode;
          category = p.category || 'General';
          image_url = p.images?.[0] || '';
          product_found = product_name !== barcode;
          console.log(`[scan-handler] Product found: ${product_name}, category: ${category}`);
        }
      } else {
        console.log(`[scan-handler] swift-action returned ${lookupResponse.status}, using barcode as name`);
      }
    } catch (lookupErr) {
      console.error(`[scan-handler] Product lookup failed: ${lookupErr.message}, using barcode as name`);
    }

    // 3. INSERT: Save into inventory_logs
    // quantity: +1 for IN, -1 for OUT — drives inventory_summary SUM
    const quantity = (action === 'OUT') ? -1 : 1;

    const { error } = await supabase
      .from('inventory_logs')
      .insert([{
        barcode:     barcode,
        action_type: action,
        device_id:   device_id,
        owner_id:    foundOwnerId,
        name:        product_name,
        category:    category,
        image_url:   image_url,
        quantity:    quantity,
      }])

    if (error) throw error

    console.log(`[scan-handler] Successfully saved. owner_id: ${foundOwnerId}, product_found: ${product_found}`);

    return new Response(JSON.stringify({
      message: 'DATABASE UPDATED!',
      product_found: product_found,
      registered: true,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.log(`!!! [REPORT] !!! Critical Error: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
