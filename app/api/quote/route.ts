import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, zip, dealerArea, notes, buildSummary } = body;

    if (!name || !email || !phone || !zip) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Send email via SMTP if env vars are configured, otherwise log
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = process.env.QUOTE_TO_EMAIL ?? 'sales@ribitboats.com';

    if (smtpHost && smtpUser && smtpPass) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const subject = `New RIBIT Build Quote Request — ${name} (${zip})`;

      const text = `
NEW RIBIT BOATS QUOTE REQUEST
================================

Customer Information:
  Name:          ${name}
  Email:         ${email}
  Phone:         ${phone}
  Zip Code:      ${zip}
  Dealer Area:   ${dealerArea || 'Not specified'}
  Notes:         ${notes || 'None'}

Build Configuration:
${buildSummary}

================================
Submitted via ribitboats.com configurator
`.trim();

      const html = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: white; border-radius: 8px; padding: 24px; max-width: 600px; margin: 0 auto; }
  h1 { color: #0A84FF; font-size: 22px; margin: 0 0 4px; }
  .subtitle { color: #888; font-size: 13px; margin: 0 0 24px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px; }
  .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  .field-label { color: #555; }
  .field-value { color: #1a1a1a; font-weight: 600; }
  .build-box { background: #f0f7ff; border: 1px solid #b8d8ff; border-radius: 6px; padding: 14px; white-space: pre-line; font-size: 13px; color: #333; line-height: 1.7; }
  .footer { font-size: 11px; color: #aaa; margin-top: 20px; text-align: center; }
</style></head>
<body>
<div class="card">
  <h1>🚤 New RIBIT Quote Request</h1>
  <p class="subtitle">Submitted via RIBITBoats.com configurator</p>
  
  <div class="section">
    <div class="section-title">Customer Information</div>
    <div class="field"><span class="field-label">Name</span><span class="field-value">${name}</span></div>
    <div class="field"><span class="field-label">Email</span><span class="field-value">${email}</span></div>
    <div class="field"><span class="field-label">Phone</span><span class="field-value">${phone}</span></div>
    <div class="field"><span class="field-label">Zip Code</span><span class="field-value">${zip}</span></div>
    <div class="field"><span class="field-label">Dealer Area</span><span class="field-value">${dealerArea || 'Not specified'}</span></div>
    ${notes ? `<div class="field"><span class="field-label">Notes</span><span class="field-value">${notes}</span></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Build Configuration</div>
    <div class="build-box">${buildSummary}</div>
  </div>

  <div class="footer">RIBIT Boats Configurator — ribitboats.com</div>
</div>
</body>
</html>`;

      await transporter.sendMail({
        from: `RIBIT Boats Configurator <${smtpUser}>`,
        to: toEmail,
        replyTo: email,
        subject,
        text,
        html,
      });
    } else {
      // Log in development when SMTP not configured
      console.log('[Quote Request]', { name, email, phone, zip, dealerArea, notes, buildSummary });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Quote API Error]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
