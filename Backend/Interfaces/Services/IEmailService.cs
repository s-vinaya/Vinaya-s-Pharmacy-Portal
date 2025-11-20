namespace ReactPharmacyPortal.Interfaces.Services
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string email, string name, string role);
        Task SendApprovalEmailAsync(string email, string name);
        Task SendRejectionEmailAsync(string email, string name, string rejectionReason);
        Task SendPasswordResetEmailAsync(string email, string name, string resetToken);
    }
}