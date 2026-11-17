import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportPayload {
  category?: string;
  contactEmail?: string | null;
  description?: string;
  activeTab?: string;
  pageUrl?: string;
  userAgent?: string;
  userId?: string | null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: ReportPayload = await req.json().catch(() => ({}));
    const description = (body.description || "").trim();
    if (description.length < 5) {
      return new Response(
        JSON.stringify({ error: "Description must be at least 5 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          sent: false,
          reason: "RESEND_API_KEY is not configured in Supabase Edge Function secrets.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toEmail = Deno.env.get("REPORT_TO_EMAIL") || "support@citizenscore.ie";
    const fromEmail =
      Deno.env.get("REPORT_FROM_EMAIL") || "CitizenScore Reports <onboarding@resend.dev>";

    const category = (body.category || "General").trim();
    const contactEmail = (body.contactEmail || "").trim();
    const activeTab = (body.activeTab || "unknown").trim();
    const pageUrl = (body.pageUrl || "").trim();
    const userAgent = (body.userAgent || "").trim();
    const userId = body.userId || "anonymous";
    const submittedAt = new Date().toISOString();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 8px; color: #059669;">New Problem Report — CitizenScore.ie</h2>
        <p style="margin-top: 0; color: #475569; font-size: 13px;">Submitted at ${escapeHtml(submittedAt)}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; width: 140px;">Category</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(category)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">User Email</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(contactEmail || "Not provided")}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">User ID</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(userId)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Active Tab</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(activeTab)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Page URL</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(pageUrl || "N/A")}</td>
          </tr>
        </table>
        <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 6px;">Description</div>
          <div style="white-space: pre-wrap; line-height: 1.5;">${escapeHtml(description)}</div>
        </div>
        <p style="margin-top: 16px; font-size: 11px; color: #64748b;">User Agent: ${escapeHtml(userAgent || "N/A")}</p>
      </div>
    `;

    const text = [
      `New Problem Report — CitizenScore.ie`,
      `Submitted: ${submittedAt}`,
      `Category: ${category}`,
      `User Email: ${contactEmail || "Not provided"}`,
      `User ID: ${userId}`,
      `Active Tab: ${activeTab}`,
      `Page URL: ${pageUrl || "N/A"}`,
      ``,
      `Description:`,
      description,
      ``,
      `User Agent: ${userAgent || "N/A"}`,
    ].join("\n");

    const resendPayload: Record<string, unknown> = {
      from: fromEmail,
      to: [toEmail],
      subject: `[CitizenScore Report] ${category}`,
      html,
      text,
    };
    if (contactEmail && contactEmail.includes("@")) {
      resendPayload.reply_to = contactEmail;
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({ sent: false, error: resendData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sent: true, id: resendData.id || null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ sent: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
