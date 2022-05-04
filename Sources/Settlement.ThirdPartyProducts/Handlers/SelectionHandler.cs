using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using Settlement.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class SelectionHandler : IRequestHandler<GetSelectionRequest, SelectionPermissionModel>
    {
        private readonly BetBuilderService betBuilderService;

        private readonly PermissionService permissionService;

        public SelectionHandler(BetBuilderService betBuilderService, PermissionService permissionService)
        {
            this.betBuilderService = betBuilderService;
            this.permissionService = permissionService;
        }

        public async Task<SelectionPermissionModel> Handle(GetSelectionRequest request, CancellationToken cancellationToken) => new SelectionPermissionModel
        {
            Permission = permissionService.Permission,
            SelectionDetail = await betBuilderService.GetSelection(request.MatchId)
        };
    }
}