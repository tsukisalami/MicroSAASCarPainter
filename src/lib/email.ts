import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

interface SendQuoteEmailParams {
  to: string;
  customerName: string;
  shopName: string;
  quoteNumber: string;
  quoteTotal: string;
  vehicleInfo: string;
  quoteUrl: string;
  shopPhone?: string;
  shopEmail?: string;
}

export async function sendQuoteEmail(params: SendQuoteEmailParams) {
  const resend = getResend();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
      
      <div style="background:#1e40af;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">${params.shopName}</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Paint Job Quote</p>
      </div>
      
      <div style="padding:32px 24px;">
        <p style="font-size:16px;color:#333;margin:0 0 16px;">Hi ${params.customerName},</p>
        <p style="font-size:14px;color:#666;margin:0 0 24px;line-height:1.5;">
          Thank you for your interest. Here's your paint job quote for your <strong>${params.vehicleInfo}</strong>.
        </p>
        
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:0 0 24px;text-align:center;">
          <p style="font-size:12px;color:#666;margin:0 0 4px;text-transform:uppercase;">Quote ${params.quoteNumber}</p>
          <p style="font-size:32px;font-weight:bold;color:#1e40af;margin:0;">${params.quoteTotal}</p>
        </div>
        
        <div style="text-align:center;margin:0 0 24px;">
          <a href="${params.quoteUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
            View Full Quote & Approve
          </a>
        </div>
        
        <p style="font-size:12px;color:#999;margin:0;line-height:1.5;">
          Click the button above to view the detailed breakdown and approve or decline this quote. 
          This quote is valid for 30 days.
        </p>
      </div>
      
      <div style="border-top:1px solid #e5e5e5;padding:16px 24px;background:#fafafa;">
        <p style="font-size:12px;color:#999;margin:0;text-align:center;">
          ${params.shopPhone ? `Call us: ${params.shopPhone}` : ""}
          ${params.shopPhone && params.shopEmail ? " &bull; " : ""}
          ${params.shopEmail ? `Email: ${params.shopEmail}` : ""}
        </p>
        <p style="font-size:11px;color:#ccc;margin:8px 0 0;text-align:center;">
          Powered by QuotePaint
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const fromAddress = process.env.EMAIL_FROM || "quotes@quotepaint.com";

  return resend.emails.send({
    from: `${params.shopName} <${fromAddress}>`,
    to: params.to,
    subject: `Paint Quote ${params.quoteNumber} — ${params.quoteTotal}`,
    html,
  });
}
