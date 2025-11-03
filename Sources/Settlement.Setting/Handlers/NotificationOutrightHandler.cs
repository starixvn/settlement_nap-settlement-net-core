
using Settlement.Setting.Criteria.Notification;
using Settlement.Setting.Requests.Notification;

namespace Settlement.Setting.Handlers;

public class NotificationOutrightHandler(IDynamicRepository repository) : IRequestHandler<NotificationOutrightRequest, bool>
{
    public async Task<bool> Handle(NotificationOutrightRequest request, CancellationToken cancellationToken)
    {
        return await repository.GetAsync<bool>(new NotificationOutrightCriteria());
    }
}
