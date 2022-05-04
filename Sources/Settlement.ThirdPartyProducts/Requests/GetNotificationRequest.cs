using MediatR;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests
{
    public class GetNotificationRequest : IRequest<NotificationStatusModel>
    {
    }
}