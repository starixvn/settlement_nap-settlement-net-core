namespace Settlement.Sportsbook.Soccer.Services.GetMatch;

using AutoMapper;
using Criteria;
using Fanex.Data.Repository;
using Models;
using Requests;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Core.Services.SpecificService;
using System.Threading.Tasks;
using Match = Models.Match;
using MatchDetail = Models.MatchDetail;

public interface IMatchService
{
    string GetBetStatus(int matchId);

    public MatchGoalRecordModel GetMatchGoalRecord(int matchId);

    Task<Match> GetMatch(GetMatchRequest request);

    Task<Match> GetMatchRefund(GetMatchRequest request);

    Task<MatchDetail> GetLatestMatchDetail(GetLatestMatchDetailRequest request);

    Task<List<string>> GetSpecificBetTypes(GetSpecificBetTypeRequest request);

    Task<List<MatchMoveBetTicket>> GetMatchDetailThirdPartyBetTicket(GetMatchDetailThirdPartyBetTicketsRequest request);

    Task<FantasyMatch> GetRelatedMatches(int matchId);

    Task<List<ResultDetail>> GetResultDetail(int matchId);


}

public class MatchServiceImp(
    IDynamicRepository repository,
    PermissionService permissionService,
    IMapper mapper,
    IRefDataService refDataService,
    GoalIconService goalIconService,
    IFetchDataService fetchDataService)
    : IMatchService
{
    private static readonly List<string> resourcesSoccer = [ResourceType.Halftime, ResourceType.Final];

    public string GetBetStatus(int matchId)
    {
        var criteria = new GetMatchInfoCriteria
        {
            MatchId = matchId
        };

        var matchInfo = repository.Get<MatchDetail>(criteria);

        return matchInfo != null ? matchInfo.BetStatus : string.Empty;
    }

    public MatchGoalRecordModel GetMatchGoalRecord(int matchId)
    {
        var criteria = new GetMatchInfoCriteria
        {
            MatchId = matchId
        };

        var matchInfo = repository.Get<MatchGoalRecordModel>(criteria);

        return matchInfo;
    }

    public async Task<Match> GetMatch(GetMatchRequest request)
    {
        var match = await fetchDataService.GetMatchInfo(request);
        var resultDetails = await GetResultDetail(request.MatchId);

        var matchDetail = match.MatchDetail;
        matchDetail.RefDataService = refDataService;
        SetNormalResults(matchDetail, resultDetails);

        var goalIconQuery = GoalIconQuery(matchDetail);
        matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

        var externalResults = await GetOutsideSources(matchDetail.MatchId);

        var hedgeMatchDetail = await GetHedgeMatch(request.MatchId);

        var fantasyMatch = new FantasyMatch();
        if (matchDetail.IsFantasyMatch)
        {
            fantasyMatch = await GetRelatedMatches(matchDetail.MatchId);
        }

        var childMatches = match.ChildMatches.OrderBy(child => child.MatchCode)
            .ThenBy(child => child.MatchId).ToList();

        foreach (var item in childMatches)
        {
            item.RefDataService = refDataService;
        }

        var resultSorted = resultDetails
            .Where(r => r.SourceId == SourceType.Normal && resourcesSoccer.Contains(r.ResourceId))
            .OrderBy(r => resourcesSoccer.IndexOf(r.ResourceId));

        return new Match
        {
            MatchDetail = matchDetail,
            ResultDetails = resultSorted,
            TicketCounts = match.TicketCounts,
            ChildMatches = childMatches,
            FantasyMatch = fantasyMatch,
            HedgeMatchDetail = hedgeMatchDetail,
            Permission = permissionService.Permission,
            ExternalResults = externalResults
        };
    }

    private async Task<List<ExternalResultModel>> GetOutsideSources(int matchId)
    {
        var criteria = new GetExternalResultDetailsCriteria
        {
            MatchId = matchId
        };

        var results = await repository.FetchAsync<ExternalResultDetailModel>(criteria);
        var listResult = results.ToList();
        var externalResult = listResult.GroupBy(resultDetail => new { resultDetail.SourceId, resultDetail.SourceName, resultDetail.OrderNo, resultDetail.Remark })
            .Select(resultDetail => new ExternalResultModel
            {
                SourceId = resultDetail.Key.SourceId,
                SourceName = resultDetail.Key.SourceName,
                OrderNo = resultDetail.Key.OrderNo,
                Remark = resultDetail.Key.Remark,
                ResultDetails = resultDetail.ToList()
            })
            .OrderBy(result => result.OrderNo)
            .ThenBy(result => result.SourceName)
            .ToList();

        return externalResult;

    }

    public async Task<Match> GetMatchRefund(GetMatchRequest request)
    {
        var match = await fetchDataService.GetMatchInfo(request);
        var matchDetail = match.MatchDetail;
        var resultDetails = await GetResultDetail(request.MatchId);

        matchDetail.RefDataService = refDataService;
        SetExMatchScore(matchDetail, resultDetails);
        var goalIconQuery = GoalIconQuery(matchDetail);
        matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

        var hedgeMatchCriteria = new GetHedgeMatchCriteria { MatchId = request.MatchId };
        var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);
        if (hedgeMatchDetail != null)
        {
            hedgeMatchDetail.IsDeterminedHedgeMatch = await fetchDataService.IsDeterminedHedgeMatch(hedgeMatchDetail.MatchId);
        }

        var betDaqCriteria = new BetDaqCheckingCriteria { MatchId = request.MatchId };
        var betDaq = await fetchDataService.GetMultiServersBetDaq(betDaqCriteria);

        var betFairCriteria = new BetFairCheckingCriteria { MatchId = request.MatchId };
        var betFair = await fetchDataService.GetMultiServersBetFair(betFairCriteria);

        return new Match
        {
            MatchDetail = matchDetail,
            ResultDetails = resultDetails,
            HedgeMatchDetail = hedgeMatchDetail,
            BetDaq = betDaq,
            BetFair = betFair,
            Permission = permissionService.Permission
        };
    }


    private static GoalIconQueryModel GoalIconQuery(MatchDetail match)
    {
        return new GoalIconQueryModel
        {
            BetStatus = match.BetStatus,
            GoalRecord = match.GoalRecord,
            FinalAwayScore = match.FinalAwayScore,
            FinalHomeScore = match.FinalHomeScore,
            IsExistFgLg = match.IsExistFgLg,
            IsExistHtFgLg = match.IsExistHtFgLg
        };
    }

    public async Task<List<ResultDetail>> GetResultDetail(int matchId)
    {
        var resultDetailCriteria = new GetResultDetailCriteria { MatchIdList = matchId.ToString() };
        return (await repository.FetchAsync<ResultDetail>(resultDetailCriteria)).ToList();
    }

    private async Task<HedgeMatchDetail> GetHedgeMatch(int matchId)
    {
        var hedgeMatchCriteria = new GetHedgeMatchCriteria { MatchId = matchId };
        return await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);
    }

    public async Task<FantasyMatch> GetRelatedMatches(int matchId)
    {
        var criteria = new GetFantasyMatchCriteria
        {
            MatchId = matchId
        };

        var result = await repository.FetchMultipleAsync<FantasyMatchDetail, FantasyRelatedMatch>(criteria);
        var matchDetail = result.Item1.FirstOrDefault();
        var relatedMatches = result.Item2.OrderBy(match => match.MatchCode).ToList();
        foreach (var match in relatedMatches)
        {
            match.RefDataService = refDataService;
        }

        return new FantasyMatch
        {
            FantasyMatchDetail = matchDetail,
            RelatedMatches = relatedMatches
        };
    }

    private static void SetExMatchScore(MatchDetail match, List<ResultDetail> resultDetails)
    {
        //TODO: Should Remove after Refund Popup use ResultDetail instead of Table Match
        var externalResultDetail = resultDetails.Where(result => result.SourceId == SourceType.Sbo).ToList();
        var halfTimeResult = externalResultDetail.Find(result => result.ResourceId == ResourceType.Halftime);
        var fullTimeResult = externalResultDetail.Find(result => result.ResourceId == ResourceType.Final);

        if (halfTimeResult != null && !string.IsNullOrWhiteSpace(halfTimeResult.AwayValue) &&
            !string.IsNullOrWhiteSpace(halfTimeResult.HomeValue))
        {
            match.ExHTAwayScore = halfTimeResult.AwayValue;
            match.ExHTHomeScore = halfTimeResult.HomeValue;
        }

        if (fullTimeResult != null && !string.IsNullOrWhiteSpace(fullTimeResult.AwayValue) &&
            !string.IsNullOrWhiteSpace(fullTimeResult.HomeValue))
        {
            match.ExFTAwayScore = fullTimeResult.AwayValue;
            match.ExFTHomeScore = fullTimeResult.HomeValue;
        }
    }

    private static void SetNormalResults(MatchDetail match, List<ResultDetail> resultDetails)
    {

        var internalResultDetail = resultDetails.Where(result => result.SourceId == SourceType.Normal).ToList();

        var halfTimeResult = internalResultDetail.Find(result => result.ResourceId == ResourceType.Halftime);
        var fullTimeResult = internalResultDetail.Find(result => result.ResourceId == ResourceType.Final);

        if (halfTimeResult != null)
        {
            halfTimeResult.TicketStatus = match.HtStatus;
        }
        else
        {
            resultDetails.Add(new ResultDetail { ResourceId = ResourceType.Halftime, SourceId = SourceType.Normal, TicketStatus = TicketStatus.Running });
        }

        if (fullTimeResult != null)
        {
            fullTimeResult.TicketStatus = match.FtStatus;
        }
        else
        {
            resultDetails.Add(new ResultDetail { ResourceId = ResourceType.Final, SourceId = SourceType.Normal, TicketStatus = TicketStatus.Running });
        }
    }

    public async Task<MatchDetail> GetLatestMatchDetail(GetLatestMatchDetailRequest request)
    {
        var criteria = mapper.Map<GetLatestMatchDetailRequest, GetLatestMatchDetailCriteria>(request);
        var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
        matchDetail.RefDataService = refDataService;

        return matchDetail;
    }

    public async Task<List<string>> GetSpecificBetTypes(GetSpecificBetTypeRequest request)
    {
        var criteria = mapper.Map<GetSpecificBetTypeRequest, SpecificBetTypesCriteria>(request);
        var listBetType = await repository.FetchAsync<int>(criteria);

        return listBetType.Select(item => refDataService.GetBetTypeName(item.ToString())).ToList();
    }

    public async Task<List<MatchMoveBetTicket>> GetMatchDetailThirdPartyBetTicket(GetMatchDetailThirdPartyBetTicketsRequest request)
    {
        var criteria = new GetMatchDetailThirdPartyBetTicketCriteria
        {
            MatchId = request.MatchId
        };

        var listMatch = await repository.FetchAsync<MatchMoveBetTicket>(criteria);
        return listMatch.ToList();
    }

}