using System.IO;
using Fanex.MailDeliver.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using RazorEngine;
using RazorEngine.Templating;
using Settlement.Core.Constants;
using Settlement.Setting.Models.Notification;

namespace Settlement.Setting.Services
{
    public interface SendMailService
    {
        void SendMail(NotificationModel item);
    }

    public class SendMailServiceImp : SendMailService
    {
        private readonly IHostingEnvironment environment;

        private readonly IConfiguration configuration;

        public SendMailServiceImp(
            IConfiguration configuration,
            IHostingEnvironment environment)
        {
            this.configuration = configuration;
            this.environment = environment;
        }

        public void SendMail(NotificationModel item)
        {
             var mailRecord = new MailRecord
            {
                MailTo = MailTo(item.SportType),
                Title = "NAP - Settlement System",
                Subject = Subject(item),
                Body = MailBody(item)
            };

            using var mailClient = new Fanex.MailDeliver.MailClient.API.MailDeliver();
            
            mailClient.SendMail(mailRecord);
        }

        private string Subject(NotificationModel item) {
            return $"Settlement issue - [{item.Action}] - [{item.MatchCode}/{item.MatchId}] {item.HomeName} - {item.AwayName}";

        }
        private string MailTo(int sportType) {
            return sportType switch
            {
                SportType.Soccer => configuration.GetSection("EmailGroups:Soccer").Value,
                SportType.BasketBall => configuration.GetSection("EmailGroups:VoidBet").Value,
                _ => configuration.GetSection("EmailGroups:OtherSport").Value,
            };
        }

        private string MailBody(NotificationModel item) {
            var filePath = environment.WebRootPath;
            var pathWithFolderName = $"{Path.Combine(filePath, "email-templates")}{Path.DirectorySeparatorChar}notification-error.html";
            return Engine.Razor.RunCompile(File.ReadAllText(pathWithFolderName), "Alert Template", model: item);

        }
    }
}
