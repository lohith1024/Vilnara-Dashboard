using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using WebApi.Models;

namespace WebApi.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string code, string message);
    }

    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;

        public EmailService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;
        }

        public async Task SendVerificationEmailAsync(string email, string code, string message)
        {
            var client = new SmtpClient(_smtpSettings.Host)
            {
                Port = _smtpSettings.Port,
                Credentials = new NetworkCredential(_smtpSettings.Username, _smtpSettings.Password),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_smtpSettings.FromEmail),
                Subject = "Email Verification",
                Body = $@"
                    <h2>Email Verification</h2>
                    <p>Your verification code is: <strong>{code}</strong></p>
                    <p>Please enter this code in the verification page to complete your registration.</p>",
                IsBodyHtml = true
            };
            mailMessage.To.Add(email);

            try
            {
                await client.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                // Log the error
                throw new Exception("Failed to send email verification", ex);
            }
        }
    }
}