using Fanex.Data.Repository;
using System.Linq;
using System.Threading.Tasks;
using Settlement.Setting.Models.Notification;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Services;
using Settlement.Setting.Criteria.Notification;

namespace Settlement.Setting.Services
{
    public interface NotificationService
    {
        Task<ShowNotificationModel> GetNotifications();

        Task<ShowNotificationModel> ShowTopNotifications(int top);
    }

    public class NotificationServiceImp : NotificationService
    {
        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly INapSession currentSession;

        public NotificationServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            INapSession currentSession)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.currentSession = currentSession;
        }

        public async Task<ShowNotificationModel> GetNotifications()
        {
            var criteria = new GetNumberOfNotificationCriteria
            {
                AdminId = currentSession.UserId
            };

            var notifications = (await repository.FetchAsync<NotificationModel>(criteria)).ToList();
            notifications.ForEach(x => x.RefDataService = refDataService);
            var numberError = criteria.NumberError;

            return new ShowNotificationModel
            {
                NumberError = numberError,
                Notifications = notifications
            };
        }

        public async Task<ShowNotificationModel> ShowTopNotifications(int top)
        {
            var criteria = new ShowTopNotificationCriteria
            {
                Top = top,
                AdminId = currentSession.UserId
            };

            var result = await repository.FetchMultipleAsync<int, NotificationModel>(criteria);
            var notifications = result.Item2.ToList();
            notifications.ForEach(x => x.RefDataService = refDataService);

            return new ShowNotificationModel
            {
                NumberError = result.Item1.FirstOrDefault(),
                Notifications = notifications
            };
        }
    }
}
