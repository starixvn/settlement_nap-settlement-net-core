using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Settlement.Core.Models;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.ProviderManager;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers
{
    public class ProviderManagerHandler : 
        IRequestHandler<GetProviderRequest, List<ProviderModel>>,
        IRequestHandler<UpdateProviderRequest, Result>
    {
        private readonly ProviderSettingService providerSettingService;

        public ProviderManagerHandler(ProviderSettingService providerSettingService)
        {
            this.providerSettingService = providerSettingService;
        }

        public async Task<List<ProviderModel>> Handle(GetProviderRequest request, CancellationToken cancellationToken) 
            => await providerSettingService.GetProvider(request);

        public async Task<Result> Handle(UpdateProviderRequest request, CancellationToken cancellationToken) 
            => await providerSettingService.UpdateProvider(request);
    }
}
