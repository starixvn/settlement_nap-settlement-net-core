using MediatR;
using Settlement.Setting.Models.Notification;

namespace Settlement.Setting.Requests.Notification
{
    public class TopNotificationRequest : IRequest<ShowNotificationModel>
    {
        public int Top { get; set; }
    }
}
