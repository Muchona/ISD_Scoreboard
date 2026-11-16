import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripePriceId = Deno.env.get("STRIPE_PRICE_ID");

    if (!stripeSecretKey || !stripePriceId) {
      return new Response(
        JSON.stringify({
          error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Supabase Edge Function secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const returnUrl = typeof body.returnUrl === "string" && body.returnUrl.startsWith("http")
      ? body.returnUrl.replace(/\/$/, "")
      : "https://citizenscore.ie";

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("payment_method_types[0]", "card");
    params.set("line_items[0][price]", stripePriceId);
    params.set("line_items[0][quantity]", "1");
    params.set("client_reference_id", user.id);
    if (user.email) params.set("customer_email", user.email);
    params.set("metadata[supabase_user_id]", user.id);
    params.set("subscription_data[metadata][supabase_user_id]", user.id);
    params.set("success_url", `${returnUrl}/?checkout=success`);
    params.set("cancel_url", `${returnUrl}/?checkout=cancelled`);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return new Response(
        JSON.stringify({ error: session?.error?.message || "Failed to create Stripe checkout session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
