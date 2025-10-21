
using Settlement.Setting.Requests.Notification;

namespace Settlement.Setting.Handlers;

public class NotificationOutrightHandler : IRequestHandler<NotificationOutrightRequest, bool>
{
    public async Task<bool> Handle(NotificationOutrightRequest request, CancellationToken cancellationToken)
    {
        return false;
    }
}
