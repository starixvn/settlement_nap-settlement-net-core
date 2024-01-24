using MediatR;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.Log.Services;

namespace Settlement.Log.Handlers;

public class ProviderHandler :
    IRequestHandler<ProviderNameRequest, List<ProviderName>>,
    IRequestHandler<ProviderLogRequest, List<ProviderResultLog>>

{
    private readonly ProviderLogService providerLogService;

    public ProviderHandler(ProviderLogService providerLogService)
    {
        this.providerLogService = providerLogService;
    }

    public async Task<List<ProviderName>> Handle(ProviderNameRequest request, CancellationToken cancellationToken)
    {
        return (await providerLogService.GetProviderName()).ToList();
    }

    public async Task<List<ProviderResultLog>> Handle(ProviderLogRequest request, CancellationToken cancellationToken)
    {
        return (await providerLogService.GetProviderLog(request)).ToList();
    }
}