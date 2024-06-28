using MediatR;
using Settlement.Models;
using Settlement.Setting.Requests.ProviderManager;
using Settlement.Setting.Services;

namespace Settlement.Setting.Handlers;

using Models.ProviderManager;

public class ProviderManagerHandler(ProviderSettingService providerSettingService) :
    IRequestHandler<GetProviderRequest, List<ProviderModel>>,
    IRequestHandler<UpdateProviderRequest, Result>
{
    public async Task<List<ProviderModel>> Handle(GetProviderRequest request, CancellationToken cancellationToken)
        => await providerSettingService.GetProvider(request);

    public async Task<Result> Handle(UpdateProviderRequest request, CancellationToken cancellationToken)
        => await providerSettingService.UpdateProvider(request);
}