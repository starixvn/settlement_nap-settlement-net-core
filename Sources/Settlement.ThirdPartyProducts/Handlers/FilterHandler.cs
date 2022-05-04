using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using Settlement.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.ThirdPartyProducts.Handlers
{
    public class FilterHandler : IRequestHandler<FilterRequest, MultiSportsModel>
    {
        private readonly MatchService searchService;

        private readonly PermissionService permissionService;

        public FilterHandler(MatchService searchService, PermissionService permissionService)
        {
            this.searchService = searchService;
            this.permissionService = permissionService;
        }

        public async Task<MultiSportsModel> Handle(FilterRequest request, CancellationToken cancellationToken)
        {
            return new MultiSportsModel
            {
                SportLeagues = await searchService.Search(request),
                Permission = permissionService.Permission
            };
        }
    }
}