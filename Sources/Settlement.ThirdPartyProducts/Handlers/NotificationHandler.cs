using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class NotificationHandler : IRequestHandler<GetNotificationRequest, NotificationStatusModel>
    {
        private readonly BetBuilderService betBuilderService;

        public NotificationHandler(BetBuilderService betBuilderService)
        {
            this.betBuilderService = betBuilderService;
        }

        public async Task<NotificationStatusModel> Handle(GetNotificationRequest request, CancellationToken cancellationToken) => await betBuilderService.GetNotificationStatus();
    }
}