namespace DonationAPI.Helpers
{
    public static class EmailTemplates
    {
        private static string Wrap(string title, string bodyHtml) => $@"
<div style=""font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;"">
    <h2 style=""color: #16a34a; margin-bottom: 16px;"">{title}</h2>
    {bodyHtml}
    <p style=""margin-top: 24px; font-size: 12px; color: #9ca3af;"">HopeCare · Together We Can Make A Difference</p>
</div>";

        public static string DonorThankYou(string donorName, string campaignTitle, decimal amount) => Wrap(
            "Thank You For Your Donation! 💚",
            $@"<p>Hi {donorName},</p>
               <p>Thank you for donating <strong>₹{amount:N0}</strong> to <strong>{campaignTitle}</strong>. Your generosity is making a real difference.</p>
               <p>We'll keep you updated on how your contribution is being used.</p>"
        );

        public static string AdminNewDonation(string donorName, string donorEmail, decimal amount, string campaignTitle) => Wrap(
            "New Donation Received",
            $@"<p>A new donation has just come in:</p>
               <ul>
                 <li><strong>Donor:</strong> {donorName}</li>
                 <li><strong>Email:</strong> {donorEmail}</li>
                 <li><strong>Amount:</strong> ₹{amount:N0}</li>
                 <li><strong>Campaign:</strong> {campaignTitle}</li>
               </ul>"
        );

        public static string AdminNewAssistanceRequest(string applicantName, string reason, decimal amount) => Wrap(
            "New Donation Request Received",
            $@"<p>A new assistance request has been submitted:</p>
               <ul>
                 <li><strong>Name:</strong> {applicantName}</li>
                 <li><strong>Reason:</strong> {reason}</li>
                 <li><strong>Amount Needed:</strong> ₹{amount:N0}</li>
               </ul>
               <p>Please review it in the Admin Dashboard.</p>"
        );

        public static string ApplicantApproved(string applicantName, decimal amount) => Wrap(
            "Your Request Has Been Approved! 🎉",
            $@"<p>Hi {applicantName},</p>
               <p>Great news — your request for <strong>₹{amount:N0}</strong> has been approved by our team.</p>
               <p>Funds will be disbursed to you shortly. We'll notify you once the transfer is complete.</p>"
        );
        public static string AdminNewContactMessage(string name, string email, string? phone, string? organization, string requestFor, string message) => Wrap(
            "New Contact Message",
            $@"<p>A new message was submitted via the Contact page:</p>
               <ul>
                 <li><strong>Name:</strong> {name}</li>
                 <li><strong>Email:</strong> {email}</li>
                 <li><strong>Phone:</strong> {phone ?? "—"}</li>
                 <li><strong>Organization:</strong> {organization ?? "—"}</li>
                 <li><strong>Request Type:</strong> {requestFor}</li>
               </ul>
               <p><strong>Message:</strong><br/>{message}</p>"
        );
        public static string UrgentCampaignAlert(string donorName, string message, string donationUrl)
        {
            var safeName = string.IsNullOrWhiteSpace(donorName) ? "Friend" : donorName;

            return $@"
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <style>
        @media only screen and (max-width: 600px) {{
          .container {{ width: 100% !important; }}
          .px {{ padding-left: 16px !important; padding-right: 16px !important; }}
          .cta-btn {{ width: 100% !important; text-align: center !important; }}
        }}
      </style>
    </head>
    <body style='margin:0; padding:0; background:#f1f5f9; font-family: Segoe UI, Arial, sans-serif;'>
      <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9; padding: 24px 0;'>
        <tr>
          <td align='center'>
            <table role='presentation' class='container' width='560' cellpadding='0' cellspacing='0' style='background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.06);'>

              <tr>
                <td style='background:linear-gradient(90deg,#dc2626,#ea580c); padding:28px 32px;' class='px'>
                  <p style='margin:0; color:#fecaca; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase;'>Urgent Appeal</p>
                  <h1 style='margin:8px 0 0; color:#ffffff; font-size:22px; font-weight:800;'>Emergency Support Needed</h1>
                </td>
              </tr>

              <tr>
                <td style='padding:32px;' class='px'>
                  <p style='margin:0 0 16px; font-size:15px; color:#111827;'>Dear {safeName},</p>
                  <p style='margin:0 0 20px; font-size:15px; line-height:1.6; color:#374151; white-space:pre-line;'>{System.Net.WebUtility.HtmlEncode(message)}</p>

                  <table role='presentation' cellpadding='0' cellspacing='0' style='margin:0 auto 20px;'>
                    <tr>
                      <td align='center' bgcolor='#dc2626' style='border-radius:8px;'>
                        <a href='{donationUrl}' class='cta-btn' target='_blank'
                           style='display:inline-block; padding:14px 32px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:8px; background:linear-gradient(90deg,#dc2626,#ea580c);'>
                          Donate Now &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style='margin:0; font-size:13px; color:#9ca3af; line-height:1.5;'>
                    Every contribution — big or small — helps us respond faster to those affected. Thank you for standing with us in this moment.
                  </p>
                </td>
              </tr>

              <tr>
                <td style='background:#f9fafb; padding:18px 32px; border-top:1px solid #e5e7eb;' class='px'>
                  <p style='margin:0; font-size:12px; color:#9ca3af;'>
                    You're receiving this because you've previously donated through our platform.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>";
        }
    }
}