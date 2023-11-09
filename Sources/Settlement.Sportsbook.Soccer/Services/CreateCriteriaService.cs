using AutoMapper;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services.GetMatch;

namespace Settlement.Sportsbook.Soccer.Services;

public interface ICreateCriteriaService
{
    public CalculateCriteria CreateCalculateCriteria(SettleRequest request);

    public CalculateCriteria CreateUnCalculateCriteria(SettleRequest request);

    public CalculateEarlyCriteria CreateCalculateEarlyCriteria(SettleEarlyRequest request);

    public RefundCriteria CreateRefundCriteria(RefundRequest request);

    public CalculateCriteria CreateUnCalculateFtCriteria(UncalculateFtRequest request);

    public InsertLogCriteria CreateResettleLogCriteria(CalculateCriteria request);

    public InsertLogCriteria CreateResettleLogRefundCriteria(RefundCriteria request);
}

public class CreateCriteriaServiceImp : ICreateCriteriaService
{
    private readonly IMapper mapper;

    private readonly IHttpContextAccessor accessor;

    private readonly IResourceService resourceService;

    private readonly ISoccerBetStatusService soccerBetStatusService;

    private readonly XmlConvertService xmlConvertService;

    private readonly IBetStatusAllService betStatusAllService;

    private readonly IMatchService matchService;

    public CreateCriteriaServiceImp(
        IResourceService resourceService,
        IHttpContextAccessor accessor,
        ISoccerBetStatusService soccerBetStatusService,
        XmlConvertService xmlConvertService,
        IMapper mapper,
        IBetStatusAllService betStatusAllService,
        IMatchService matchService)
    {
        this.resourceService = resourceService;
        this.accessor = accessor;
        this.soccerBetStatusService = soccerBetStatusService;
        this.xmlConvertService = xmlConvertService;
        this.mapper = mapper;
        this.betStatusAllService = betStatusAllService;
        this.matchService = matchService;
    }

    public CalculateCriteria CreateCalculateCriteria(SettleRequest request)
    {
        var criteria = new CalculateCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            GoalRecord = string.IsNullOrWhiteSpace(request.GoalRecord) ? string.Empty : request.GoalRecord.ToUpperInvariant(),
            ResourceResult = GetResourceResultCalculate(request),
            BetStatus = soccerBetStatusService.CreateBetStatus(request),
            Action = request.ActionName,
            HalfTimeHome = request.HalfTimeHomeScore ?? 0,
            HalfTimeAway = request.HalfTimeAwayScore ?? 0,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            IsReSettledTickets = request.IsReSettledTickets,
            ChildMatchIds = request.ChildMatchIds,
            LeagueGroupId = request.LeagueGroupId
        };

        if (request.ActionName.Equals(ActionType.CalculateFullTime) || request.ActionName.Equals(ActionType.CalculateAll))
        {
            criteria.FullTimeHome = request.FinalHomeScore ?? 0;
            criteria.FullTimeAway = request.FinalAwayScore ?? 0;
        }

        return criteria;
    }

    public CalculateCriteria CreateUnCalculateCriteria(SettleRequest request)
    {
        var criteria = new CalculateCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            GoalRecord = string.IsNullOrWhiteSpace(request.GoalRecord) ? string.Empty : request.GoalRecord.ToUpperInvariant(),
            ResourceResult = GetResourceResultUnCalculate(request),
            BetStatus = string.Empty,
            Action = request.ActionName,
            HalfTimeHome = request.HalfTimeHomeScore ?? 0,
            HalfTimeAway = request.HalfTimeAwayScore ?? 0,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            IsReSettledTickets = request.IsReSettledTickets,
            ChildMatchIds = request.ChildMatchIds
        };

        return criteria;
    }

    public CalculateCriteria CreateUnCalculateFtCriteria(UncalculateFtRequest request)
    {
        var matchGoalRecord = matchService.GetMatchGoalRecord(request.MatchId) ?? new MatchGoalRecordModel();
        var htGoalRecord = GoalRecordHt(matchGoalRecord.GoalRecord, request.ResultDetails);
        var criteria = new CalculateCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            GoalRecord = htGoalRecord,
            BetStatus = soccerBetStatusService.CreateBetStatusAfterUncalculateFt(request, matchGoalRecord.BetStatus, htGoalRecord),
            ResourceResult = GetResourceResultUnCalculateFt(htGoalRecord),
            HalfTimeAway = request.HalfTimeAway ?? 0,
            HalfTimeHome = request.HalfTimeHome ?? 0,
            Action = ActionType.UnCalculateFullTime,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
        };

        return criteria;
    }

    public CalculateEarlyCriteria CreateCalculateEarlyCriteria(SettleEarlyRequest request)
    {
        var criteria = new CalculateEarlyCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            Action = request.ActionName,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            IsReSettledTickets = request.IsReSettledTickets,
            SelectedResources = CreateResources(request.SelectedResources)
        };

        return criteria;
    }

    public RefundCriteria CreateRefundCriteria(RefundRequest request)
    {
        var criteria = new RefundCriteria
        {
            MatchId = request.MatchId,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            AdminId = request.AdminId,
            GoalSequence = request.GoalRecord,
            HalfTimeHome = request.HalfTimeHomeScore ?? 0,
            HalfTimeAway = request.HalfTimeAwayScore ?? 0,
            FullTimeAway = request.FinalAwayScore ?? 0,
            FullTimeHome = request.FinalHomeScore ?? 0,
            Action = request.ActionName,
            BetStatus = GetBetStatus(request),
            ResourceResult = GetResourceResult(request)
        };

        if (IsAbandonedMatch(request) && request.ActionName.Equals(ActionType.RefundAll))
        {
            criteria.FullTimeAway = request.HalfTimeAwayScore ?? 0;
            criteria.FullTimeHome = request.HalfTimeHomeScore ?? 0;
        }

        return criteria;
    }

    private static bool IsAbandonedMatch(RefundRequest request)
    {
        return request.IsSettleAbandonedMatchIbc || request.IsSettleAbandonedMatchBetDaq || request.IsSettleAbandonedMatchBetFair;
    }

    private string GetResourceResult(RefundRequest request)
    {
        var goalCondition = mapper.Map<RefundRequest, GoalCondition>(request);
        List<XmlResource> resources;
        var actionName = request.ActionName;

        if (IsAbandonedMatch(request) && actionName.Equals(ActionType.RefundFullTime))
        {
            resources = resourceService.FullTimeResourcesSettleDetermined(goalCondition);
        }
        else if (IsAbandonedMatch(request) && actionName.Equals(ActionType.RefundAll))
        {
            resources = resourceService.AllResourcesSettleDetermined(goalCondition);
        }
        else
        {
            resources = actionName switch
            {
                ActionType.RefundHalfTime => resourceService.HalftimeResources(goalCondition, SettlementStatus.RefundHt),
                ActionType.RefundFullTime => resourceService.FullTimeResources(goalCondition, SettlementStatus.RefundFt),
                _ => resourceService.AllResources(goalCondition, SettlementStatus.Refund)
            };
        }

        return resources.Count > 0
            ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
            : string.Empty;
    }

    private string GetBetStatus(RefundRequest request)
    {
        if (request.ActionName.Equals(ActionType.RefundHalfTime))
        {
            return string.Empty;
        }

        return IsAbandonedMatch(request) ? betStatusAllService.GetBetStatusRefund(request) : request.BetStatus;
    }

    private string CreateResources(List<ResourceItem> selectedResources)
    {
        var resources = new Resources<ResourceItem>
        {
            ResourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    private string GetResourceResultCalculate(SettleRequest request)
    {
        var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
        var actionName = request.ActionName;
        var resources = actionName switch
        {
            ActionType.CalculateHalfTime => resourceService.HalftimeResources(goalCondition, SettlementStatus.Completed),
            ActionType.CalculateFullTime => resourceService.FullTimeResources(goalCondition, SettlementStatus.Completed),
            _ => resourceService.AllResources(goalCondition, SettlementStatus.Completed)
        };

        return resources.Count > 0
            ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
            : string.Empty;
    }

    private string GetResourceResultUnCalculate(SettleRequest request)
    {
        var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
        var resources = resourceService.UnCalculateResources(goalCondition);

        return resources.Count > 0
            ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
            : string.Empty;
    }

    private string GetResourceResultUnCalculateFt(string goalRecord)
    {
        var resources = resourceService.UnCalculateFtResources(goalRecord);

        return xmlConvertService.Serialize(new XmlResults { Resources = resources });
    }

    private static string GoalRecordHt(string goalRecord, IEnumerable<ResultDetail> resultDetails)
    {
        var halfTime = resultDetails.FirstOrDefault(item => item.ResourceId == ResourceType.Halftime);
        if (string.IsNullOrEmpty(goalRecord) || halfTime?.SettlementStatusId == SettlementStatus.RefundHt)
        {
            return string.Empty;
        }

        var semicolonIndex = goalRecord.IndexOf(';');
        return semicolonIndex < 0 ? goalRecord : goalRecord[..(semicolonIndex + 1)].ToUpperInvariant();
    }

    public InsertLogCriteria CreateResettleLogCriteria(CalculateCriteria criteria)
    {
        var resettleLogCriteria = mapper.Map<InsertLogCriteria>(criteria);
        resettleLogCriteria.Sporttype = SportType.Soccer;
        var resourceItems = new List<ResourceItem>();
        if (criteria.Action is ActionType.CalculateHalfTime or ActionType.CalculateAll)
        {
            resourceItems.Add(new ResourceItem(ResourceType.Halftime) { AwayValue = criteria.HalfTimeAway.ToString(), HomeValue = criteria.HalfTimeHome.ToString() });
        }

        if (criteria.Action is ActionType.CalculateFullTime or ActionType.CalculateAll)
        {
            resourceItems.Add(new ResourceItem(ResourceType.Final) { AwayValue = criteria.FullTimeAway.ToString(), HomeValue = criteria.FullTimeHome.ToString() });
        }

        AddResourceResult(resourceItems, criteria.ResourceResult);

        resettleLogCriteria.SelectedResources = CreateResources(resourceItems);

        return resettleLogCriteria;
    }

    public InsertLogCriteria CreateResettleLogRefundCriteria(RefundCriteria criteria)
    {
        var resettleLogCriteria = mapper.Map<InsertLogCriteria>(criteria);
        resettleLogCriteria.Sporttype = SportType.Soccer;
        var resourceItems = new List<ResourceItem>();
        if (criteria.HalfTimeAway is not null && criteria.HalfTimeHome is not null)
        {
            resourceItems.Add(new ResourceItem(ResourceType.Halftime) { AwayValue = criteria.HalfTimeAway.ToString(), HomeValue = criteria.HalfTimeHome.ToString() });
        }

        if (criteria.FullTimeAway is not null && criteria.FullTimeHome is not null)
        {
            resourceItems.Add(new ResourceItem(ResourceType.Final) { AwayValue = criteria.FullTimeAway.ToString(), HomeValue = criteria.FullTimeHome.ToString() });
        }

        AddResourceResult(resourceItems, criteria.ResourceResult);

        resettleLogCriteria.SelectedResources = CreateResources(resourceItems);

        return resettleLogCriteria;
    }

    private void AddResourceResult(List<ResourceItem> resourceItems, string ResourceResult)
    {
        if (string.IsNullOrEmpty(ResourceResult))
        {
            return;
        }
        var resourceResult = xmlConvertService.Deserialize<XmlResults>(ResourceResult);
        var resourceItemFromResult = mapper.Map<List<ResourceItem>>(resourceResult.Resources);
        resourceItems.AddRange(resourceItemFromResult);
    }
}