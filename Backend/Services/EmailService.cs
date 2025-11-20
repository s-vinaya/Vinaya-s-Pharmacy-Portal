using System.Net;
using System.Net.Mail;
using System.Text;
using ReactPharmacyPortal.Interfaces.Services;

namespace ReactPharmacyPortal.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        // Send welcome email to new users 
        public async Task SendWelcomeEmailAsync(string email, string name, string role)
        {
            var subject = $"Welcome to Vinaya's Pharmacy Portal - {role} Account Created";

            var body = role == "Customer"
                ? GetCustomerWelcomeBody(name)
                : GetPharmacistWelcomeBody(name);

            await SendEmailAsync(email, subject, body, isHtml: true);
        }

        
        public async Task SendApprovalEmailAsync(string email, string name)
        {
            var subject = "Vinaya's Pharmacy Portal - Pharmacist Account Approved";
            var body = $@"
                <html>
                <body style='font-family:Segoe UI, sans-serif; color:#333;'>
                    <p>Dear {name},</p>
                    <p>Congratulations! Your pharmacist account has been <b>approved</b>.</p>
                    <p>You can now log in and start managing medicines, inventory, and customer orders.</p>
                    <br/>
                    <p>Best regards,<br/><b>The Vinaya's Pharmacy Team</b></p>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body, isHtml: true);
        }

        
        public async Task SendRejectionEmailAsync(string email, string name, string rejectionReason)
        {
            var subject = "Vinaya's Pharmacy Portal - Pharmacist Application Status";
            var body = $@"
                <html>
                <body style='font-family:Segoe UI, sans-serif; color:#333;'>
                    <p>Dear {name},</p>
                    <p>Thank you for your interest in joining Vinaya's Pharmacy Portal as a pharmacist.</p>
                    <p>After careful review, we regret to inform you that your application has been <b>declined</b> at this time.</p>
                    <p><b>Reason:</b> {rejectionReason}</p>
                    <p>You may reapply in the future once the mentioned issues are addressed.</p>
                    <p>For any questions, please contact us at <a href='mailto:admin@vinayaspharmacy.com'>admin@vinayaspharmacy.com</a>.</p>
                    <br/>
                    <p>Best regards,<br/><b>The Vinaya's Pharmacy Team</b></p>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body, isHtml: true);
        }

        // Send password reset email 
        public async Task SendPasswordResetEmailAsync(string email, string name, string resetToken)
        {
            var subject = "Vinaya's Pharmacy Portal - Password Reset Request";
            var resetUrl = $"http://localhost:5173/reset-password?token={resetToken}";
            var body = $@"
                <html>
                <body style='font-family:Segoe UI, sans-serif; color:#333;'>
                    <p>Dear {name},</p>
                    <p>We received a request to reset your password for your Vinaya's Pharmacy Portal account.</p>
                    <p>Click the link below to reset your password:</p>
                    <p><a href='{resetUrl}' style='background-color:#0077b6; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>Reset Password</a></p>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <br/>
                    <p>Best regards,<br/><b>The Vinaya's Pharmacy Team</b></p>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body, isHtml: true);
        }

        // Core method to send emails using SMTP configuration
        private async Task SendEmailAsync(string email, string subject, string body, bool isHtml = true)
        {
            try
            {
                var smtpHost = _config["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
                var fromEmail = _config["EmailSettings:FromEmail"] ?? "noreply@vinayaspharmacy.com";
                var fromPassword = _config["EmailSettings:FromPassword"] ?? "";

                using var smtpClient = new SmtpClient(smtpHost)
                {
                    Port = smtpPort,
                    Credentials = new NetworkCredential(fromEmail, fromPassword),
                    EnableSsl = true
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, "Vinaya's Pharmacy Portal"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml,
                    BodyEncoding = Encoding.UTF8
                };

                mailMessage.To.Add(email);

                await smtpClient.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", email, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", email);
                throw;
            }
        }

        // Generate HTML email template for customer welcome message
        private string GetCustomerWelcomeBody(string name) => $@"
            <html>
            <body style='font-family:Segoe UI, sans-serif; color:#333;'>
                <p>Dear {name},</p>
                <p>Welcome to <b>Vinaya's Pharmacy Portal</b>!</p>
                <p>We're delighted to have you with us. Your <b>Customer Account</b> has been successfully created. 
                You can now explore a wide range of medicines, health products, and pharmacy services right from your dashboard.</p>

                <p><b>Here's what you can do next:</b></p>
                <ul>
                    <li>Browse and order medicines online with ease</li>
                    <li>Track your order status in real time</li>
                    <li>Save prescriptions securely for future reference</li>
                    <li>Get exclusive offers and discounts on health essentials</li>
                </ul>

                <p>If you have any questions, feel free to reach out to our support team anytime at 
                <a href='mailto:support@vinayaspharmacy.com'>support@vinayaspharmacy.com</a>.</p>

                <p>We're here to make your healthcare journey simple, safe, and reliable.</p>

                <br/>
                <p>Warm regards,<br/><b>The Vinaya's Pharmacy Team</b></p>
            </body>
            </html>";

        // Generate HTML email template for pharmacist welcome message (pending approval)
        private string GetPharmacistWelcomeBody(string name) => $@"
            <html>
            <body style='font-family:Segoe UI, sans-serif; color:#333;'>
                <p>Dear {name},</p>
                <p>Welcome to <b>Vinaya's Pharmacy Portal</b>!</p>

                <p>Thank you for registering as a <b>Pharmacist Partner</b> with us. 
                Your account has been successfully created and is currently <b>pending admin approval</b>.</p>

                <p>Once approved, you'll be able to:</p>
                <ul>
                    <li>Manage and fulfill medicine orders</li>
                    <li>Update product availability and pricing</li>
                    <li>Access your sales dashboard and insights</li>
                    <li>Connect with customers in need of trusted pharmacy services</li>
                </ul>

                <p>If you have any questions, please reach out to our admin team at 
                <a href='mailto:admin@vinayaspharmacy.com'>admin@vinayaspharmacy.com</a>.</p>

                <p>Thank you for joining us in making healthcare more accessible and efficient.</p>

                <br/>
                <p>Best regards,<br/><b>The Vinaya's Pharmacy Team</b></p>
            </body>
            </html>";
    }
}