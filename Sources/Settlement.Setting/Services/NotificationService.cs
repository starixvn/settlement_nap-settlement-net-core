using System.Collections.Generic;
using Fanex.Data.Repository;
using System.Linq;
using System.Threading.Tasks;
using Settlement.Setting.Models.Notification;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Criteria.Notification;

namespace Settlement.Setting.Services
{
    public interface NotificationService
    {
        Task<bool> IsNotificationsBetBuilder();

        Task<int> NumberNotifications();

        Task<ShowNotificationModel> ShowTopNotifications(int top);
    }

    public class NotificationServiceImp : NotificationService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly INapSession currentSession;

        private readonly SendMailService sendMailService;

        private readonly AppSettingsKey appSettingsKey;

        public NotificationServiceImp(
            IDynamicRepository repository,
            IOptions<AppSettingsKey> appSettingsKey,
            IRefDataService refDataService,
            INapSession currentSession,
            SendMailService sendMailService)
        {
            this.repository = repository;
            this.appSettingsKey = appSettingsKey.Value;
            this.refDataService = refDataService;
            this.currentSession = currentSession;
            this.sendMailService = sendMailService;
        }

        public async Task<bool> IsNotificationsBetBuilder()
        {
            return await repository.GetAsync<bool>(new NotificationBetBuilderCriteria());
        }

        public async Task<int> NumberNotifications()
        {
            var numberError = 0;
            var notifications = new List<NotificationModel>();
            var criteria = new GetNumberOfNotificationCriteria
            {
                AdminId = currentSession.UserId
            };

            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var list = (await repository.FetchAsync<NotificationModel>(criteria)).ToList();
                notifications.AddRange(list);
                numberError += criteria.NumberError;
            }

            if (numberError > 0)
            {
                SendErrorMessage(notifications);
            }

            return numberError;
        }

        private void SendErrorMessage(List<NotificationModel> notifications)
        {
            foreach (var item in notifications)
            {
                item.RefDataService = refDataService;
                sendMailService.SendMail(item);
            }
        }

        public async Task<ShowNotificationModel> ShowTopNotifications(int top)
        {
            var numberError = 0;
            var notifications = new List<NotificationModel>();
            var criteria = new ShowTopNotificationCriteria
            {
                Top = top,
                AdminId = currentSession.UserId
            };

            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                var result = await repository.FetchMultipleAsync<int, NotificationModel>(criteria);

                numberError += result.Item1.FirstOrDefault();
                notifications.AddRange(result.Item2);
            }
            
            notifications.ForEach(x => x.RefDataService = refDataService);

            return new ShowNotificationModel
            {
                NumberError = numberError,
                Notifications = notifications
            };
        }
    }
}
