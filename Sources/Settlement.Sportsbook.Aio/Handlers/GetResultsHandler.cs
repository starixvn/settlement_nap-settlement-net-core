using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using MatchDetail = Settlement.Sportsbook.Aio.Models.MatchDetail;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;


namespace Settlement.Sportsbook.Aio.Handlers;

public class GetResultsHandler(
    IRefDataService refDataService,
    IDynamicRepository repository,
    IMapperFactory mapperFactory,
    IOptions<AppSettingsKey> options)
    : IRequestHandler<GetResultsRequest, AioMatch>
{
    private static HashSet<string> BaseBetTypes = ["653", "662", "659", "656", "665", "667"];
    private static string ResultDetailKey = "basketball-result-detail";

    public async Task<AioMatch> Handle(GetResultsRequest request, CancellationToken cancellationToken)
    {
        var matchDetail = await GetMatchDetail(request.MatchId);
        var ticketDetails = await GetTicketDetails(request.MatchId, matchDetail.SportType);
        var resultDetails = await GetResultDetails(request.MatchId, ticketDetails);
        var externalResults = await GetExternalResults(request.MatchId);

        return new AioMatch
        {
            MatchDetail = matchDetail,
            ResultDetails = resultDetails,
            ExternalResults = externalResults
        };
    }

    private async Task<List<ExternalResultModel>> GetExternalResults(int matchId)
    {
        var criteria = new GetProviderCriteria
        {
            MatchId = matchId,
            SettleType = SettleType.Early
        };

        var results = (await repository.FetchAsync<ExternalResultDetailModel>(criteria))
            .Where(x => x.SourceId == SourceType.ConfirmSTD)
            .ToList();

        var groupResult = GroupExternalResults(results);


        return groupResult;
    }

    private async Task<List<ResultDetail>> GetTicketDetails(int matchId, int sportType)
    {
        var criteria = new GetTicketDetailsCriteria
        {
            MatchId = matchId,
            SettleType = SettleType.Early,
            SportType = sportType
        };
        var tasks = options.Value.SiteDbServer.Select(server => GetTicketDetailsByServer(criteria, server));
        var results = await Task.WhenAll(tasks);

        var allTicketDetails = results.SelectMany(r => r.Item1)
            .GroupBy(x => x.ResourceId)
            .Select(g => g.Aggregate((a, b) =>
            {
                a.InRunning += b.InRunning;
                a.InWaiting += b.InWaiting;
                a.BetMarkedCount += b.BetMarkedCount;
                a.BetSettledCount += b.BetSettledCount;
                a.BetCount += b.BetCount;
                return a;
            }))
            .ToList();

        return allTicketDetails;
    }


    private async Task<(List<ResultDetail>, TicketCounts)> GetTicketDetailsByServer(GetTicketDetailsCriteria criteria, string server)
    {
        criteria.DbServer = server;
        var (ticketDetails, ticketCounts) = await repository.FetchMultipleAsync<ResultDetail, TicketCounts>(criteria);

        return ([.. ticketDetails], ticketCounts.FirstOrDefault() ?? new TicketCounts());
    }

    private static bool IsBaseBetType(ResultDetail resultDetail) => BaseBetTypes.Any(resultDetail.ResourceId.StartsWith);

    private async Task<MatchDetail> GetMatchDetail(int matchId)
    {
        var matchDetail = await repository.GetAsync<MatchDetail>(new GetMatchDetailCriteria
        {
            MatchId = matchId
        });
        matchDetail.RefDataService = refDataService;

        return matchDetail;
    }

    private async Task<List<ResultDetail>> GetResultDetails(int matchId, List<ResultDetail> ticketDetails)
    {
        var resultDetails = await repository.FetchAsync<ResultDetail>(new GetResultDetailCriteria
        {
            MatchId = matchId,
            SettleType = "EAR",
            SportType = 2
        });

        var allResultDetails = resultDetails
            .Concat(ticketDetails.Except(resultDetails))
            .Select(x =>
            {
                x.MatchId = matchId;
                var relatedTicket = ticketDetails.Find(t => t.ResourceId == x.ResourceId);
                x.TicketStatus = CreateTicketStatus(relatedTicket, SettleType.Early, 2);
                return x;
            })
            .Where(x => x.TicketStatus != TicketStatus.NotIncluded)
            .ToList();

        var mapperService = mapperFactory.GetMapperService(ResultDetailKey);
        if (mapperService != null)
        {
            await mapperService.Decorate(allResultDetails);
        }

        return [.. allResultDetails.Where(x => IsBaseBetType(x))];
    }

    private static string CreateTicketStatus(ResultDetail ticketDetail, string settleType, int sportType) =>
        ticketDetail switch
        {
            null => sportType == SportType.BasketBall ? TicketStatus.NoTicket : TicketStatus.NotIncluded,
            { BetCount: var c, InWaiting: var w } when c == 0 || c == w => TicketStatus.NoTicket,
            { InRunning: > 0 } => TicketStatus.Running,
            { BetMarkedCount: > 0 } => TicketStatus.Marked,
            { BetSettledCount: > 0 } => TicketStatus.Calculated,
            { BetRefundedCount: > 0 } when settleType != SettleType.Early => TicketStatus.Refunded,
            _ => TicketStatus.Calculated
        };

    private static List<ExternalResultModel> GroupExternalResults(IEnumerable<ExternalResultDetailModel> resultDetails)
    {
        return [.. resultDetails.GroupBy(resultDetail => new
        {
            resultDetail.SourceId,
            resultDetail.SourceName,
            resultDetail.OrderNo,
            resultDetail.Remark
        }).Select(resultDetail => new ExternalResultModel
        {
            SourceId = resultDetail.Key.SourceId,
            SourceName = resultDetail.Key.SourceName,
            OrderNo = resultDetail.Key.OrderNo,
            Remark = resultDetail.Key.Remark,
            ResultDetails = [.. resultDetail]
        })];
    }
}
