import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");

interface SendSubmissionEmailProps {
  formOwnerEmail: string;
  formOwnerName: string | null;
  formId: string;
  formName: string;
  submissionId: string;
  answers: { fieldKey: string; value: unknown }[];
  submittedAt: Date;
  totalResponses: number;
}

export async function sendSubmissionEmail({
  formOwnerEmail,
  formOwnerName,
  formId,
  formName,
  submissionId,
  answers,
  submittedAt,
  totalResponses,
}: SendSubmissionEmailProps) {
  // Take top 3 answers for the snippet to keep it clean
  const previewAnswers = answers.slice(0, 3);
  
  const answersHtml = previewAnswers
    .map(
      (a) => `
      <tr>
        <td style="padding: 8px 0; color: #475467; font-size: 14px; font-weight: 500;">
          ${a.fieldKey.replace(/_/g, " ")}: 
          <span style="color: #101828; font-weight: 600;">${String(a.value ?? "—")}</span>
        </td>
      </tr>`
    )
    .join("");

  const nameFallback = formOwnerName ? formOwnerName.split(" ")[0] : "there";
  const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/forms/${formId}/responses?submissionId=${submissionId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Submission on ${formName}</title>
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #eaecf0;">
          
          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="background-color: #f3f0ff; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; border: 1px solid #e9d5ff; vertical-align: middle; text-align: center; line-height: 32px;">
                  🔥
                </div>
                <span style="font-size: 18px; font-weight: 700; color: #101828; display: inline-block; vertical-align: middle; margin-left: 8px;">
                  FormForge
                </span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td>
              <p style="margin: 0 0 16px; font-size: 16px; color: #344054;">
                Hi ${nameFallback},
              </p>
              
              <p style="margin: 0 0 16px; font-size: 16px; color: #475467; line-height: 1.5;">
                You just received a new response on your form <strong>"${formName}"</strong>! This brings your total responses for this form up to <strong>${totalResponses}</strong>.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; color: #475467; line-height: 1.5;">
                Here is a quick snippet of what they submitted:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #eaecf0;">
                ${answersHtml}
              </table>

              <p style="margin: 0 0 8px; font-size: 16px; color: #475467;">
                Thanks,
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #475467;">
                The FormForge Team
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-bottom: 40px;">
              <a href="${actionUrl}" style="
                display: inline-block;
                background-color: #7c3aed;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
              ">View Full Response</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #eaecf0; padding-top: 32px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #667085; line-height: 1.5;">
                This email was sent to <a href="mailto:${formOwnerEmail}" style="color: #6941c6; text-decoration: none;">${formOwnerEmail}</a>. If you'd rather not receive this kind of email, you can <a href="#" style="color: #6941c6; text-decoration: underline;">unsubscribe</a> or <a href="#" style="color: #6941c6; text-decoration: underline;">manage your email preferences</a>.
              </p>
              
              <p style="margin: 0 0 32px; font-size: 14px; color: #667085;">
                © 2026 FormForge, 100 Innovation Drive, San Francisco CA 94107
              </p>
            </td>
          </tr>

          <!-- Footer Logo -->
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="background-color: #f3f0ff; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid #e9d5ff; vertical-align: middle; text-align: center; line-height: 24px;">
                  🔥
                </div>
                <span style="font-size: 14px; font-weight: 700; color: #101828; display: inline-block; vertical-align: middle; margin-left: 8px;">
                  FormForge
                </span>
              </div>
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
    from: "FormForge <notifications@formforge.com>",
    to: formOwnerEmail,
    subject: `🔥 New response on "${formName}"`,
    html,
  });
}