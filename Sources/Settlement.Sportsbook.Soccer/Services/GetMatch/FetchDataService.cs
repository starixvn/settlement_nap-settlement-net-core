namespace Settlement.Sportsbook.Soccer.Services.GetMatch;

using AutoMapper;
using Criteria;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Models;
using Requests;
using Settlement.Core.Models;
using Match = Models.Match;
using MatchDetail = Models.MatchDetail;

public interface IFetchDataService
{
    public Task<Match> GetMatchInfo(GetMatchRequest request);

    public Task<BetDaq> GetMultiServersBetDaq(BetDaqCheckingCriteria criteria);

    public Task<BetFair> GetMultiServersBetFair(BetFairCheckingCriteria criteria);

    public Task<(List<ResultDetailModel>, TicketCounts)> GetEarlyTicketDetails(GetResultDetailEarlyCriteria criteria);

    public Task<bool> IsDeterminedHedgeMatch(int matchId);

    Task<CountTicketResponse> CountTickets(int matchId);
}

public class FetchDateServiceImp(IDynamicRepository repository,
    IMapper mapper,
    IOptions<AppSettingsKey> appSettingsKey,
    IMergeDataService mergeDataService)
    : IFetchDataService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    public async Task<Match> GetMatchInfo(GetMatchRequest request)
    {
        var criteria = mapper.Map<GetMatchRequest, GetMatchDetailCriteria>(request);

        var result = await repository.FetchMultipleAsync<MatchDetail, ChildMatchModel>(criteria);
        var baseMatchDetail = result.Item1.FirstOrDefault();

        var siteMatch = GetSiteMatchInfo(criteria.MatchId);

        baseMatchDetail!.SiteMatch = siteMatch;

        var ticketCounts = mergeDataService.MergeTicketCounts(siteMatch);
        var matchDetail = mergeDataService.MergeSiteMatch(baseMatchDetail, ticketCounts);
        var childMatches =
            mergeDataService.MergeDataChildMatches(result.Item2.ToList(), siteMatch);

        return new Match
        {
            MatchDetail = matchDetail,
            TicketCounts = ticketCounts,
            ChildMatches = childMatches
        };
    }

    private List<SiteMatch> GetSiteMatchInfo(int matchId)
    {
        return appSettingsKey.SiteDbServer.Select(server => GetSiteMatchByServer(matchId, server)).ToList();
    }

    private SiteMatch GetSiteMatchByServer(int matchId, string server)
    {
        var criteria = new GetTicketInfoCriteria { MatchId = matchId, DbServer = server };
        var result = repository.FetchMultiple<SiteMatch, TicketCounts, ChildMatchTicketInfos>(criteria);

        var siteMatch = result.Item1.First();
        siteMatch.TicketCounts = result.Item2.ToList();
        siteMatch.SiteChildMatches = result.Item3.ToList();

        return siteMatch;
    }

    public async Task<BetDaq> GetMultiServersBetDaq(BetDaqCheckingCriteria criteria)
    {
        var betDaqs = new List<BetDaq>();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var betDaq = await repository.GetAsync<BetDaq>(criteria);
            betDaqs.Add(betDaq);
        }

        var baseData = betDaqs[0];
        var nodeData = betDaqs.Skip(1).ToList();

        // merge function
        var existConflictData = nodeData.Exists(betDaq => baseData.IsExcludeBetDaq != betDaq.IsExcludeBetDaq
                                                       || baseData.IsMoveBetDaq != betDaq.IsMoveBetDaq
                                                       || baseData.IsRefundRunningBetDaq !=
                                                       betDaq.IsRefundRunningBetDaq
                                                       || baseData.IsSettleAbandonedMatchBetDaq !=
                                                       betDaq.IsSettleAbandonedMatchBetDaq);
        return existConflictData ? mergeDataService.MergeBetDaq(baseData, nodeData) : baseData;
    }

    public async Task<BetFair> GetMultiServersBetFair(BetFairCheckingCriteria criteria)
    {
        var betFairs = new List<BetFair>();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            var betFair = await repository.GetAsync<BetFair>(criteria);
            betFairs.Add(betFair);
        }

        var baseData = betFairs[0];
        var nodeData = betFairs.Skip(1).ToList();

        // merge function
        var existConflictData = nodeData.Exists(betDaq => baseData.IsExcludeBetFair != betDaq.IsExcludeBetFair
                                                          || baseData.IsMoveBetFair != betDaq.IsMoveBetFair
                                                          || baseData.IsRefundRunningBetFair !=
                                                          betDaq.IsRefundRunningBetFair
                                                          || baseData.IsSettleAbandonedMatchBetFair !=
                                                          betDaq.IsSettleAbandonedMatchBetFair);
        return existConflictData ? mergeDataService.MergeBetFair(baseData, nodeData) : baseData;
    }

    public async Task<(List<ResultDetailModel>, TicketCounts)> GetEarlyTicketDetails(GetResultDetailEarlyCriteria criteria)
    {
        var multipleTicketDetails = new List<(List<ResultDetailModel>, TicketCounts)>();
        var getTicketCriteria = new GetEarlyTicketInfoCriteria { MatchId = criteria.MatchId };
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            var ticketDetails = await GetTicketDetailByServer(getTicketCriteria, server);
            multipleTicketDetails.Add(ticketDetails);
        }

        return mergeDataService.MergeEarlyTicketDetails(multipleTicketDetails);
    }

    private async Task<(List<ResultDetailModel> betTypes, TicketCounts ticketCounts)> GetTicketDetailByServer(GetEarlyTicketInfoCriteria criteria, string server)
    {
        criteria.DbServer = server;
        var (ticketDetails, ticketCounts) = await repository.FetchMultipleAsync<ResultDetailModel, TicketCounts>(criteria);

        return (ticketDetails.ToList(), ticketCounts.FirstOrDefault());
    }

    public async Task<bool> IsDeterminedHedgeMatch(int matchId)
    {
        var criteria = new GetHedgeMatchDeterminedInfo { HedgeMatchId = matchId };
        var determinedHedgeMatch = new DeterminedHedgeMatch();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            determinedHedgeMatch = await repository.GetAsync<DeterminedHedgeMatch>(criteria);
            if (determinedHedgeMatch.IsDeterminedHedgeMatch)
            {
                return determinedHedgeMatch.IsDeterminedHedgeMatch;
            }
        }

        return determinedHedgeMatch.IsDeterminedHedgeMatch;
    }

    public async Task<CountTicketResponse> CountTickets(int matchId)
    {
        //TODO
        var tasks = appSettingsKey.SiteDbServer
            .Select(server => FetchTicketGroupCounts(matchId, server));


        var results = await Task.WhenAll(tasks.ToArray());

        var groupedResults = results
            .SelectMany(result => result)
            .GroupBy(ticket => ticket.GroupResult)
            .Select(group => new TicketGroupCount
            {
                GroupResult = group.Key,
                TotalTicket = group.Sum(y => y.TotalTicket)
            }).ToList();

        return new CountTicketResponse(groupedResults);
    }

    private async Task<IEnumerable<TicketGroupCount>> FetchTicketGroupCounts(int matchId, string server)
    {
        var criteria = new GetTicketGroupCountCriteria
        {
            MatchId = matchId,
            DbServer = server
        };

        return await repository.FetchAsync<TicketGroupCount>(criteria);
    }
}