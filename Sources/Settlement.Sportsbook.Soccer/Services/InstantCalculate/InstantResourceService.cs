using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.Services.InstantCalculate;

public interface IInstantResourceService
{
    List<XmlResource> Halftime(InstantGoalCondition goalCondition);

    List<XmlResource> FullTime(InstantGoalCondition goalCondition);

    List<XmlResource> UnCalculate(InstantGoalCondition goalCondition);

    string BetStatusFl(InstantCalculationRequest request, string betStatus);

    string BetStatusHtFl(InstantCalculationRequest request, string betStatus);

    string RemoveBetStatus(InstantCalculationRequest request);

    string GenerateResource(List<XmlResource> resources);
}

public class InstantResourceServiceImp : IInstantResourceService
{
    private readonly IInstantGoalCheckingService instantGoalCheckingService;

    private readonly IGoalRecordService goalRecordService;

    private readonly XmlConvertService xmlConvertService;

    private const char HomeValue = 'H';
    private const char AwayValue = 'A';

    private const string FgHomeBetStatus = "FL:1-0;";

    private const string FgAwayBetStatus = "FL:2-0;";

    private const string HtfgHomeBetStatus = "1FL:1-0;";

    private const string HtfgAwayBetStatus = "1FL:2-0;";

    private const string Fl = "FL";

    private const string HalfTimeFl = "1FL";

    public InstantResourceServiceImp(
        IInstantGoalCheckingService instantGoalCheckingService,
        IGoalRecordService goalRecordService,
        XmlConvertService xmlConvertService)
    {
        this.instantGoalCheckingService = instantGoalCheckingService;
        this.goalRecordService = goalRecordService;
        this.xmlConvertService = xmlConvertService;
    }

    public List<XmlResource> Halftime(InstantGoalCondition goalCondition)
    {
        var resources = new List<XmlResource>();

        if (goalCondition.IsExistHtFgNg)
        {
            var resource = GetHalftimeFirstGoalResource(goalCondition);
            resources.Add(resource);
        }

        if (goalCondition.IsExistFgNg)
        {
            var resource = GetFirstGoalResource(goalCondition);
            resources.Add(resource);
        }

        if (goalCondition.IsExistHTFirstCorner)
        {
            var resource = GetHTFirstCornerResource(goalCondition);
            resources.Add(resource);
        }

        if (goalCondition.IsExistFirstCorner)
        {
            var resource = GetFirstCornerResource(goalCondition);
            resources.Add(resource);
        }

        if (goalCondition.IsExistHTCorner)
        {
            var resource = GetExistHTCornerRaceResource(goalCondition);
            resources.AddRange(resource);
        }


        if (goalCondition.IsExistCorner)
        {
            var resource = GetExistCornerRaceResource(goalCondition);
            resources.AddRange(resource);
        }

        return resources;
    }

    private List<XmlResource> GetExistHTCornerRaceResource(InstantGoalCondition goalCondition)
    {
        var halftimeGoal = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
        var result = ConvertGoalRecordToRace(halftimeGoal);

        return result.Select(v => new XmlResource
        {
            HomeValue = $"{v.value}",
            ResourceId = $"{ResourceKey.HalftimeCornerRace}{ConvertIntToString(v.raceTo)}",
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed,
        }).ToList();
    }

    private List<XmlResource> GetExistCornerRaceResource(InstantGoalCondition goalCondition)
    {
        var fullTimeGoalRecord = CreateFullTimeGoalRecord(goalCondition.GoalRecord);
        var result = ConvertGoalRecordToRace(fullTimeGoalRecord);

        return result.Select(v => new XmlResource
        {
            HomeValue = $"{v.value}",
            ResourceId = $"{ResourceKey.CornerRace}{ConvertIntToString(v.raceTo)}",
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed,
        }).ToList();
    }

    public List<XmlResource> FullTime(InstantGoalCondition goalCondition)
    {
        var resources = new List<XmlResource>();
        if (goalCondition.IsExistFgNg)
        {
            var resource = GetFirstGoalResource(goalCondition);
            resources.Add(resource);
        }

        if (goalCondition.IsExistFirstCorner)
        {
            var resource = GetFirstCornerResource(goalCondition);
            resources.Add(resource);
        }

        var fullTimeGoal = goalRecordService.FullTimeGoal(goalCondition.GoalRecord);
        if (goalCondition.IsExist2HFirstCorner && !string.IsNullOrEmpty(fullTimeGoal))
        {
            var resource = Get2HFirstCornerResource(goalCondition);
            resources.Add(resource);
        }


        if (goalCondition.IsExistCorner)
        {
            var resource = GetExistCornerRaceResource(goalCondition);
            resources.AddRange(resource);
        }

        return resources;
    }

    public List<XmlResource> UnCalculate(InstantGoalCondition goalCondition)
    {
        var resources = new List<XmlResource>();

        var halftimeGoalChecking = instantGoalCheckingService.IsHalftimeGoalChecking(goalCondition);
        if (goalCondition.IsExistHtFgLg && !goalCondition.IsExistHtFgNg || halftimeGoalChecking)
        {
            resources.Add(InitialResource(ResourceKey.HalftimeFirstGoal));
        }

        var fullTimeGoalChecking = instantGoalCheckingService.IsFullTimeGoalChecking(goalCondition);
        if (goalCondition.IsExistFgLg && !goalCondition.IsExistFgNg || fullTimeGoalChecking)
        {
            resources.Add(InitialResource(ResourceKey.FullTimeFirstGoal));
        }

        return resources;
    }



    public string BetStatusFl(InstantCalculationRequest request, string betStatus)
    {
        var goalOnly = request.GoalRecord.Replace(";", string.Empty);
        var indexOfHtFl = betStatus.IndexOf(HalfTimeFl, StringComparison.CurrentCulture);
        var betStatusExcludeHtFl = indexOfHtFl > -1 ? betStatus.Remove(indexOfHtFl, 8) : betStatus;
        var isNotExistBetStatusFl = !betStatusExcludeHtFl.Contains(Fl);
        if (goalOnly.Length > 0 && request.IsExistFG && isNotExistBetStatusFl)
        {
            return request.GoalRecord[0] == HomeValue ? FgHomeBetStatus : FgAwayBetStatus;
        }

        return string.Empty;
    }

    public string BetStatusHtFl(InstantCalculationRequest request, string betStatus)
    {
        var goalRecord = request.GoalRecord ?? string.Empty;
        var goalOnly = goalRecord.Split(";").First();
        var isNotExistBetStatusHtFl = !betStatus.Contains(HalfTimeFl);
        if (goalOnly.Length > 0 && request.IsExistHTFG && isNotExistBetStatusHtFl)
        {
            return request.GoalRecord[0] == HomeValue ? HtfgHomeBetStatus : HtfgAwayBetStatus;
        }

        return string.Empty;
    }

    public string RemoveBetStatus(InstantCalculationRequest request)
    {
        if (string.IsNullOrEmpty(request.BetStatus))
        {
            return string.Empty;
        }

        var betStatus = request.BetStatus;

        if (request.IsExistHTFG)
        {
            var indexOfKey = betStatus.IndexOf(HalfTimeFl, StringComparison.CurrentCulture);
            betStatus = indexOfKey > -1 ? betStatus.Remove(indexOfKey, HtfgHomeBetStatus.Length) : betStatus;
        }

        if (request.IsExistFG)
        {
            var indexOfKey = betStatus.IndexOf(Fl, StringComparison.CurrentCulture);
            betStatus = indexOfKey > -1 ? betStatus.Remove(indexOfKey, FgHomeBetStatus.Length) : betStatus;
        }



        return betStatus;
    }

    private XmlResource InitialResource(string resourceId)
    {
        return new XmlResource
        {
            ResourceId = resourceId,
            ResultStatusId = ResultStatus.Initial,
            SettlementStatusId = SettlementStatus.Running,
            HomeValue = string.Empty
        };
    }

    private XmlResource GetHTFirstCornerResource(InstantGoalCondition goalCondition)
    {
        var halftimeGoal = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
        var firstGoalRecord = goalRecordService.FirstGoalRecord(halftimeGoal);

        return new XmlResource
        {
            ResourceId = ResourceKey.HaftTimeFirstCorner,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed,
            HomeValue = $"{firstGoalRecord}",
        };
    }

    private XmlResource GetFirstCornerResource(InstantGoalCondition goalCondition)
    {
        var fullTimeGoalRecord = CreateFullTimeGoalRecord(goalCondition.GoalRecord);
        var firstGoalRecord = goalRecordService.FirstGoalRecord(fullTimeGoalRecord);

        return new XmlResource
        {
            ResourceId = ResourceKey.FirstCorner,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed,
            HomeValue = $"{firstGoalRecord}",
        };
    }

    private XmlResource Get2HFirstCornerResource(InstantGoalCondition goalCondition)
    {
        var twoHGoalRecord = goalRecordService.FullTimeGoal(goalCondition.GoalRecord);
        var firstGoalRecord = goalRecordService.FirstGoalRecord(twoHGoalRecord);

        return new XmlResource
        {
            ResourceId = ResourceKey.TowHFirstCorner,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = SettlementStatus.Completed,
            HomeValue = $"{firstGoalRecord}",
        };
    }

    private XmlResource GetHalftimeFirstGoalResource(InstantGoalCondition goalCondition)
    {
        var halftimeGoal = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
        var goalAction = CreateGoalAction(halftimeGoal, string.Empty);
        var firstGoalRecord = goalRecordService.FirstGoalRecord(goalAction.FirstGoal, goalAction.IsRefund);

        return new XmlResource
        {
            ResourceId = ResourceKey.HalftimeFirstGoal,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = goalAction.FirstGoalSettlementStatusId,
            HomeValue = firstGoalRecord
        };
    }
    private string CreateFullTimeGoalRecord(string goalRecord) => goalRecord.Replace(";", "");

    private static string ConvertIntToString(int num) => num < 10 ? $"0{num}" : $"{num}";

    private static List<GoalRecordCorner> ConvertGoalRecordToRace(string goalRecord)
    {
        var homeRaceTo = 0;
        var awayRaceTo = 0;
        var result = new List<GoalRecordCorner>();

        foreach (var item in goalRecord)
        {
            if (item.Equals(HomeValue))
            {
                homeRaceTo = homeRaceTo + 1;
                if (homeRaceTo > awayRaceTo)
                {
                    result.Add(new GoalRecordCorner(item, homeRaceTo));
                }
            }
            else
            {
                awayRaceTo = awayRaceTo + 1;
                if (awayRaceTo > homeRaceTo)
                {
                    result.Add(new GoalRecordCorner(item, awayRaceTo));
                }
            }
        }

        return result;
    }

    private XmlResource GetFirstGoalResource(InstantGoalCondition goalCondition)
    {
        var halftime = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
        var fullTime = goalRecordService.FullTimeGoal(goalCondition.GoalRecord);
        var goalAction = CreateGoalAction(halftime, fullTime);
        var fullTimeGoal = $"{goalAction.FirstGoal}{goalAction.LastGoal}";
        var firstGoalRecord = goalRecordService.FirstGoalRecord(fullTimeGoal, goalAction.IsRefund);

        return new XmlResource
        {
            ResourceId = ResourceKey.FullTimeFirstGoal,
            ResultStatusId = ResultStatus.ManuallySettled,
            SettlementStatusId = goalAction.FirstGoalSettlementStatusId,
            HomeValue = firstGoalRecord
        };
    }

    private GoalAction CreateGoalAction(string halftimeGoal, string fullTimeGoal)
    {
        return new GoalAction
        {
            FirstGoal = halftimeGoal,
            LastGoal = fullTimeGoal,
            FirstGoalSettlementStatusId = SettlementStatus.Completed,
            LastGoalSettlementStatusId = SettlementStatus.Completed
        };
    }

    public string GenerateResource(List<XmlResource> resources)
    {
        return resources.Count > 0
            ? xmlConvertService.Serialize(new XmlResults { Resources = resources })
            : string.Empty;
    }
}



