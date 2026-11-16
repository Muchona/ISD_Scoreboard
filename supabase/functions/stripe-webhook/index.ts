import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Reject timestamps older than 5 minutes
  const ageSeconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(ageSeconds) || Math.abs(ageSeconds) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signedPayload = `${timestamp}.${payload}`;
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const sigHeader = req.headers.get("stripe-signature");
  if (!webhookSecret || !sigHeader) {
    return new Response("Missing webhook secret or signature", { status: 400 });
  }

  const rawBody = await req.text();
  const isValid = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
  if (!isValid) {
    return new Response("Invalid Stripe signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const obj = event?.data?.object;
  const userId: string | undefined =
    obj?.client_reference_id ||
    obj?.metadata?.supabase_user_id;

  if (userId) {
    if (event.type === "checkout.session.completed") {
      const { data: existing } = await supabase
        .from("user_scorecards")
        .select("profile")
        .eq("user_id", userId)
        .maybeSingle();

      const nextProfile = {
        ...(existing?.profile || {}),
        isPro: true,
        subscription: {
          plan: "pro",
          status: "active",
          monthlyAmount: 5,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      };

      await supabase.from("user_scorecards").upsert(
        { user_id: userId, profile: nextProfile },
        { onConflict: "user_id" }
      );
    } else if (
      event.type === "customer.subscription.deleted" ||
      (event.type === "customer.subscription.updated" && obj?.status !== "active" && obj?.status !== "trialing")
    ) {
      const { data: existing } = await supabase
        .from("user_scorecards")
        .select("profile")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const nextProfile = {
          ...(existing.profile || {}),
          isPro: false,
          subscription: {
            ...(existing.profile?.subscription || {}),
            plan: "free",
            status: "cancelled",
          },
        };
        await supabase
          .from("user_scorecards")
          .update({ profile: nextProfile })
          .eq("user_id", userId);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
