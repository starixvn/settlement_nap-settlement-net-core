using Settlement.Setting.Models.Notification;
using Settlement.Setting.Requests.Notification;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

public class NotificationHandler(NotificationService notificationService) :
    IRequestHandler<ShowNotificationRequest, int>,
    IRequestHandler<NotificationBetBuilderRequest, bool>,
    IRequestHandler<TopNotificationRequest, ShowNotificationModel>
{
    public async Task<int> Handle(ShowNotificationRequest request, CancellationToken cancellationToken)
        => await notificationService.NumberNotifications();

    public async Task<bool> Handle(NotificationBetBuilderRequest request, CancellationToken cancellationToken)
       => await notificationService.IsNotificationsBetBuilder();

    public async Task<ShowNotificationModel> Handle(TopNotificationRequest request, CancellationToken cancellationToken)
        => await notificationService.ShowTopNotifications(request.Top);
}