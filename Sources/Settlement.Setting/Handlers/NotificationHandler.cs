using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Requests.Notification;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers
{
    public class NotificationHandler :
        IRequestHandler<ShowNotificationRequest, ShowNotificationModel>,
        IRequestHandler<TopNotificationRequest, ShowNotificationModel>
    {
        private readonly NotificationService notificationService;

        public NotificationHandler(NotificationService notificationService)
        {
            this.notificationService = notificationService;
        }
        public async Task<ShowNotificationModel> Handle(ShowNotificationRequest request, CancellationToken cancellationToken)
            => await notificationService.GetNotifications();

        public async Task<ShowNotificationModel> Handle(TopNotificationRequest request, CancellationToken cancellationToken)
            => await notificationService.ShowTopNotifications(request.Top);
    }
}
