using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Constants;
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

    public InsertLogCriteria CreateCalculateLogCriteria(SettleRequest request);

    public InsertLogCriteria CreateCalculateEarlyLogCriteria(SettleEarlyRequest request);

    public InsertLogCriteria CreateUnCalculateLogCriteria(SettleRequest request);

    public InsertLogCriteria CreateUnCalculateFtLogCriteria(UncalculateFtRequest request);

    public InsertLogCriteria CreateRefundLogCriteria(RefundRequest request);

    public SaveScoreCriteria CreateSaveScoreCriteria(SaveScoreRequest request);

    public EventTicketRequest CreateEventTicketRequest(CalculateCriteria criteria);

    public EventTicketRequest CreateEventTicketReturnRequest(RefundCriteria criteria);

    public SoccerGetTicketInfoCriteria SoccerRefundGetTicketInfoCriteria(RefundCriteria criteria, bool isSettleAbandonedMatchIBC);

    public SoccerGetTicketInfoCriteria SoccerGetTicketInfoCriteria(CalculateCriteria criteria);

}

public class CreateCriteriaServiceImp(
    IResourceService resourceService,
    IHttpContextAccessor accessor,
    ISoccerBetStatusService soccerBetStatusService,
    XmlConvertService xmlConvertService,
    IMapper mapper,
    IBetStatusAllService betStatusAllService,
    IMatchService matchService,
    INapSession session)
    : ICreateCriteriaService
{
    public CalculateCriteria CreateCalculateCriteria(SettleRequest request)
    {
        var resources = GetResourcesCalculate(request);
        var resourceResult = CreateResources(resources);

        var criteria = new CalculateCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            GoalRecord = string.IsNullOrWhiteSpace(request.GoalRecord) ? string.Empty : request.GoalRecord.ToUpperInvariant(),
            ResourceResult = resourceResult,
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
        var resources = GetResourcesUnCalculate(request);
        var resourceResult = CreateResources(resources);

        return new CalculateCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            GoalRecord = string.IsNullOrWhiteSpace(request.GoalRecord) ? string.Empty : request.GoalRecord.ToUpperInvariant(),
            ResourceResult = resourceResult,
            BetStatus = string.Empty,
            Action = request.ActionName,
            HalfTimeHome = request.HalfTimeHomeScore ?? 0,
            HalfTimeAway = request.HalfTimeAwayScore ?? 0,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            IsReSettledTickets = request.IsReSettledTickets,
            ChildMatchIds = request.ChildMatchIds
        };
    }

    public CalculateCriteria CreateUnCalculateFtCriteria(UncalculateFtRequest request)
    {
        var matchGoalRecord = matchService.GetMatchGoalRecord(request.MatchId) ?? new MatchGoalRecordModel();
        var htGoalRecord = GoalRecordHt(matchGoalRecord.GoalRecord, request.ResultDetails);

        var resources = resourceService.UnCalculateFtResources(htGoalRecord);
        var resourceResult = CreateResources(resources);

        return new CalculateCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            GoalRecord = htGoalRecord,
            BetStatus = soccerBetStatusService.CreateBetStatusAfterUncalculateFt(request, matchGoalRecord.BetStatus, htGoalRecord),
            ResourceResult = resourceResult,
            HalfTimeAway = request.HalfTimeAway ?? 0,
            HalfTimeHome = request.HalfTimeHome ?? 0,
            Action = ActionType.UnCalculateFullTime,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString()
        };
    }

    public CalculateEarlyCriteria CreateCalculateEarlyCriteria(SettleEarlyRequest request)
    {
        return new CalculateEarlyCriteria
        {
            AdminId = request.AdminId,
            MatchId = request.MatchId,
            Action = request.ActionName,
            Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            IsReSettledTickets = request.IsReSettledTickets,
            SelectedResources = CreateResources(request.SelectedResources)
        };
    }

    public RefundCriteria CreateRefundCriteria(RefundRequest request)
    {
        var resources = GetResourcesRefund(request);
        var resourceResult = CreateResources(resources);

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
            ResourceResult = resourceResult
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

    private List<XmlResource> GetResourcesRefund(RefundRequest request)
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

        return resources;
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

    private string CreateResources(List<XmlResource> resources)
    {
        return resources.Count > 0
            ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
            : string.Empty;
    }

    private List<XmlResource> GetResourcesCalculate(SettleRequest request)
    {
        var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
        var actionName = request.ActionName;
        return actionName switch
        {
            ActionType.CalculateHalfTime => resourceService.HalftimeResources(goalCondition, SettlementStatus.Completed),
            ActionType.CalculateFullTime => resourceService.FullTimeResources(goalCondition, SettlementStatus.Completed),
            _ => resourceService.AllResources(goalCondition, SettlementStatus.Completed)
        };
    }

    private List<XmlResource> GetResourcesUnCalculate(SettleRequest request)
    {
        var goalCondition = mapper.Map<SettleRequest, GoalCondition>(request);
        return resourceService.UnCalculateResources(goalCondition);
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

    public InsertLogCriteria CreateCalculateEarlyLogCriteria(SettleEarlyRequest request)
    {
        var selectedResources = CreateResources(request.SelectedResources);

        return new InsertLogCriteria
        {
            MatchId = request.MatchId,
            Action = request.ActionName,
            Sporttype = SportType.Soccer,
            AdminId = request.AdminId,
            IsAuto = true,
            SelectedResources = selectedResources
        };
    }

    public InsertLogCriteria CreateCalculateLogCriteria(SettleRequest request)
    {
        var calResources = GetResourcesCalculate(request);
        var resourcesMapper = mapper.Map<List<ResourceItem>>(calResources);

        var resourceItems = resourceService.CalculateLogResources(request);
        resourceItems.AddRange(resourcesMapper);

        var selectedResources = CreateResources(resourceItems);

        return new InsertLogCriteria
        {
            MatchId = request.MatchId,
            Action = request.ActionName,
            Sporttype = SportType.Soccer,
            AdminId = request.AdminId,
            SelectedResources = selectedResources
        };
    }

    public InsertLogCriteria CreateUnCalculateLogCriteria(SettleRequest request)
    {
        var calResources = GetResourcesUnCalculate(request);
        var resourcesMapper = mapper.Map<List<ResourceItem>>(calResources);

        var resourceItems = resourceService.AllEmptyResources();
        resourceItems.AddRange(resourcesMapper);

        var selectedResources = CreateResources(resourceItems);

        return new InsertLogCriteria
        {
            MatchId = request.MatchId,
            Action = request.ActionName,
            Sporttype = SportType.Soccer,
            AdminId = request.AdminId,
            SelectedResources = selectedResources
        };
    }

    public InsertLogCriteria CreateUnCalculateFtLogCriteria(UncalculateFtRequest request)
    {
        var matchGoalRecord = matchService.GetMatchGoalRecord(request.MatchId) ?? new MatchGoalRecordModel();
        var htGoalRecord = GoalRecordHt(matchGoalRecord.GoalRecord, request.ResultDetails);
        var calResources = resourceService.UnCalculateFtResources(htGoalRecord);

        var resourceItems = mapper.Map<List<ResourceItem>>(calResources);
        var selectedResources = CreateResources(resourceItems);

        return new InsertLogCriteria
        {
            MatchId = request.MatchId,
            Action = ActionType.UnCalculateFullTime,
            Sporttype = SportType.Soccer,
            AdminId = request.AdminId,
            SelectedResources = selectedResources
        };
    }

    public InsertLogCriteria CreateRefundLogCriteria(RefundRequest request)
    {
        var refundResources = GetResourcesRefund(request);
        var resourcesMapper = mapper.Map<List<ResourceItem>>(refundResources);
        var resourceItems = new List<ResourceItem>();
        if (IsAbandonedMatch(request))
        {
            resourceItems.Add(resourceService.RefundAbandonedMatchLogResources(request));
        }
        else
        {
            resourceItems = resourceService.RefundLogResources(request);
        }
        resourceItems.AddRange(resourcesMapper);

        var selectedResources = CreateResources(resourceItems);

        return new InsertLogCriteria
        {
            MatchId = request.MatchId,
            Action = request.ActionName,
            Sporttype = SportType.Soccer,
            AdminId = request.AdminId,
            SelectedResources = selectedResources
        };
    }

    public SaveScoreCriteria CreateSaveScoreCriteria(SaveScoreRequest request)
    {
        var resourceItems = request.ResultDetails.Select(requestResultDetail =>
            new ResourceItem
            {
                ResourceId = requestResultDetail.ResourceId,
                HomeValue = requestResultDetail.HomeValue,
                AwayValue = requestResultDetail.AwayValue
            }).ToList();

        AddGoalRecordResourceItems(request, resourceItems);

        return new SaveScoreCriteria
        {
            MatchId = request.MatchId,
            UserId = session.UserId,
            SelectedResources = CreateResources(resourceItems)
        };
    }

    private void AddGoalRecordResourceItems(SaveScoreRequest request, List<ResourceItem> resourceItems)
    {
        if (request.IsEnabledGoalRecordFt && !string.IsNullOrEmpty(request.GoalRecord) && request.ResultDetails.Any(r => r.ResourceId == ResourceType.Final))
        {
            resourceItems.Add(new ResourceItem
            {
                ResourceId = ResourceType.FullTimeGoalRecord,
                HomeValue = request.GoalRecord
            });
        }

        if (request.IsEnabledGoalRecordHt && !string.IsNullOrEmpty(request.GoalRecord) && request.ResultDetails.Any(r => r.ResourceId == ResourceType.Halftime))
        {
            var semicolonIndex = request.GoalRecord.IndexOf(';');
            resourceItems.Add(new ResourceItem
            {
                ResourceId = ResourceType.HalftimeGoalRecord,
                HomeValue = semicolonIndex < 0 ? request.GoalRecord : request.GoalRecord[..(semicolonIndex + 1)].ToUpperInvariant()
            });
        }
    }

    public EventTicketRequest CreateEventTicketRequest(CalculateCriteria criteria)
    {
        var request = new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SpName = criteria.SpName,
            Mode = ActionKey.ActionDictionary[criteria.Action],
            ResourceResult = criteria.ResourceResult,
            SelectedResources = CreateResources(resourceService.CreateResourceByAction(criteria.Action))
        };

        return request;
    }

    public EventTicketRequest CreateEventTicketReturnRequest(RefundCriteria criteria)
    {
        return new EventTicketRequest
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SpName = criteria.SpName,
            Mode = ActionKey.ActionDictionary[criteria.Action],
            SDTRecord = criteria.SdtRecord,
            ResourceResult = criteria.ResourceResult,
            SelectedResources = CreateResources(resourceService.CreateResourceByAction(criteria.Action))
        };
    }

    public SoccerGetTicketInfoCriteria SoccerRefundGetTicketInfoCriteria(RefundCriteria criteria, bool isSettleAbandonedMatchIBC)
    {
        var validResource = resourceService.CreateRefundJTResource(criteria, isSettleAbandonedMatchIBC);

        return new SoccerGetTicketInfoCriteria
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            SelectedResources = CreateResources(validResource),
            SDTRecord = criteria.SdtRecord
        };
    }

    public SoccerGetTicketInfoCriteria SoccerGetTicketInfoCriteria(CalculateCriteria criteria)
    {
        var resources = resourceService.CreateJTResource(criteria);
        return new SoccerGetTicketInfoCriteria
        {
            MatchId = criteria.MatchId,
            SelectedResources = CreateResources(resources),
            Action = criteria.Action
        };
    }

}