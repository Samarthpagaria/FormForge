import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendSubmissionEmailProps {
  formOwnerEmail: string;
  formName: string;
  submissionId: string;
  answers: { fieldKey: string; value: unknown }[];
  submittedAt: Date;
}

export async function sendSubmissionEmail({
  formOwnerEmail,
  formName,
  submissionId,
  answers,
  submittedAt,
}: SendSubmissionEmailProps) {
  const answersHtml = answers
    .map(
      (a, i) => `
      <tr style="background: ${i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)"};">
        <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #a78bfa; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${a.fieldKey.replace(/_/g, " ")}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; font-size: 14px;">${String(a.value ?? "—")}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Submission</title>
</head>
<body style="margin:0; padding:0; background:#0a0a0f; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Gradient Header Card -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #1a0533 0%, #0d1f3c 40%, #0a2a1f 100%);
              border-radius: 20px 20px 0 0;
              padding: 48px 40px 36px;
              text-align: center;
              position: relative;
              overflow: hidden;
              border: 1px solid rgba(139, 92, 246, 0.3);
              border-bottom: none;
            ">
              <!-- Grain overlay using noise pattern -->
              <div style="
                position: absolute;
                inset: 0;
                background-image: url('https://grainy-gradients.vercel.app/noise.svg');
                opacity: 0.15;
              "></div>

              <!-- Glow blobs -->
              <div style="
                position: absolute;
                top: -60px; left: -60px;
                width: 200px; height: 200px;
                background: radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%);
                border-radius: 50%;
              "></div>
              <div style="
                position: absolute;
                bottom: -40px; right: -40px;
                width: 180px; height: 180px;
                background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%);
                border-radius: 50%;
              "></div>
              <div style="
                position: absolute;
                top: 40%; left: 50%;
                width: 150px; height: 150px;
                background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%);
                border-radius: 50%;
                transform: translate(-50%, -50%);
              "></div>

              <!-- Logo -->
              <div style="
                display: inline-block;
                background: linear-gradient(135deg, #7c3aed, #3b82f6);
                border-radius: 14px;
                padding: 12px 20px;
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
              ">
                <span style="color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">⚡ FormForge</span>
              </div>

              <!-- Title -->
              <h1 style="
                margin: 0 0 8px;
                font-size: 28px;
                font-weight: 800;
                color: #ffffff;
                position: relative;
                z-index: 1;
                letter-spacing: -0.5px;
              ">New Submission</h1>

              <p style="
                margin: 0;
                font-size: 15px;
                color: rgba(255,255,255,0.6);
                position: relative;
                z-index: 1;
              ">Someone just filled out your form</p>
            </td>
          </tr>

          <!-- Form name badge -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #120824 0%, #0d1a2e 100%);
              padding: 24px 40px;
              border-left: 1px solid rgba(139, 92, 246, 0.3);
              border-right: 1px solid rgba(139, 92, 246, 0.3);
            ">
              <div style="
                background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15));
                border: 1px solid rgba(139,92,246,0.3);
                border-radius: 12px;
                padding: 16px 20px;
                display: flex;
                align-items: center;
              ">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin: 0 0 4px; font-size: 11px; color: #a78bfa; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Form Name</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">📋 ${formName}</p>
                    </td>
                    <td align="right">
                      <p style="margin: 0 0 4px; font-size: 11px; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Submitted At</p>
                      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #e2e8f0;">${submittedAt.toLocaleString()}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Answers Table -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #120824 0%, #0d1a2e 100%);
              padding: 0 40px 32px;
              border-left: 1px solid rgba(139, 92, 246, 0.3);
              border-right: 1px solid rgba(139, 92, 246, 0.3);
            ">
              <p style="margin: 0 0 12px; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Submission Answers</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.08);
              ">
                <thead>
                  <tr style="background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2));">
                    <th style="padding: 12px 16px; text-align: left; color: #c4b5fd; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; width: 40%;">Field</th>
                    <th style="padding: 12px 16px; text-align: left; color: #93c5fd; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  ${answersHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Submission ID -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #120824 0%, #0d1a2e 100%);
              padding: 0 40px 32px;
              border-left: 1px solid rgba(139, 92, 246, 0.3);
              border-right: 1px solid rgba(139, 92, 246, 0.3);
            ">
              <div style="
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 8px;
                padding: 10px 14px;
              ">
                <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.3);">
                  Submission ID: <span style="color: rgba(255,255,255,0.5); font-family: monospace;">${submissionId}</span>
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #120824 0%, #0d1a2e 100%);
              padding: 0 40px 40px;
              text-align: center;
              border-left: 1px solid rgba(139, 92, 246, 0.3);
              border-right: 1px solid rgba(139, 92, 246, 0.3);
            ">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="
                display: inline-block;
                background: linear-gradient(135deg, #7c3aed, #3b82f6);
                color: white;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 700;
                letter-spacing: 0.3px;
              ">View Dashboard →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background: rgba(255,255,255,0.02);
              border: 1px solid rgba(139, 92, 246, 0.2);
              border-top: 1px solid rgba(139,92,246,0.15);
              border-radius: 0 0 20px 20px;
              padding: 24px 40px;
              text-align: center;
            ">
              <p style="margin: 0 0 6px; font-size: 13px; color: rgba(255,255,255,0.3);">You're receiving this because you own a form on FormForge.</p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.2);">© 2026 FormForge. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  await resend.emails.send({
    from: "FormForge <notifications@yourdomain.com>",
    to: formOwnerEmail,
    subject: `⚡ New submission on "${formName}"`,
    html,
  });
}