using MediatR;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.Log.Services;

namespace Settlement.Log.Handlers;

public class ProviderHandler(ProviderLogService providerLogService) :
    IRequestHandler<ProviderNameRequest, List<ProviderName>>,
    IRequestHandler<ProviderLogRequest, ProviderLog>

{
    public async Task<List<ProviderName>> Handle(ProviderNameRequest request, CancellationToken cancellationToken)
    {
        return (await providerLogService.GetProviderName()).ToList();
    }

    public async Task<ProviderLog> Handle(ProviderLogRequest request, CancellationToken cancellationToken)
    {
        var matchDetail = await providerLogService.GetMatchDetail(request.MatchId);
        if (matchDetail == null)
        {
            return new ProviderLog();
        }

        var sportType = matchDetail.SportType;
        var resultLog = (await providerLogService.GetProviderLog(request, sportType)).ToList();

        return new ProviderLog
        {
            MatchDetail = matchDetail,
            ProviderResultLog = resultLog
        };
    }
}