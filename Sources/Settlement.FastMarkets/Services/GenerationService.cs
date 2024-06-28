using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Services;
using Settlement.FastMarkets.Constants;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Services;

public interface GenerationService
{
    List<BetType> BetTypesList(List<FastMarketResult> fastMarkets, string odds);

    Task<PushFastMarketResultCriteria> QuerySettle(SettleRequest request);
}

public class GenerationServiceImp(
    IFastMarketResultService fastMarketResultService,
    IEventCounterService eventCounterService,
    IMapper mapper,
    INapSession currentSession,
    IHttpContextAccessor accessor,
    IRefDataService refDataService,
    ResultLabelService resultLabelService)
    : GenerationService
{
    public async Task<PushFastMarketResultCriteria> QuerySettle(SettleRequest request)
    {
        var eventCounter = eventCounterService.Result(request);
        var results = fastMarketResultService.Result(request.BetTypes, request.Action);

        var criteria = mapper.Map<SettleRequest, PushFastMarketResultCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        criteria.EventCounters = eventCounter;
        criteria.Results = results;
        criteria.OldResults = await fastMarketResultService.OldResults(request.BetTypes, request.MatchId);

        return criteria;
    }

    public List<BetType> BetTypesList(List<FastMarketResult> fastMarkets, string odds)
    {
        return fastMarkets
        .GroupBy(m => m.BetType)
            .Select(m => new BetType { RefDataService = refDataService, BetTypeId = m.Key, ResultName = ResultName(m.Key, odds), FastMarketResults = m.ToList() })
            .OrderBy(m => m.BetTypeId)
            .ToList();
    }

    private ResultItemLabel ResultName(int betType, string odds)
    {
        return betType switch
        {
            FastMarketBetType.NextFiveMinutes => resultLabelService.NextFiveMinutes(odds),
            FastMarketBetType.NextOneMinuteSetPiece => resultLabelService.NextOneMinuteSetPiece(),
            FastMarketBetType.TimeMachineHdp => resultLabelService.TimeMachineHdp(),
            _ => new ResultItemLabel()
        };
    }
}