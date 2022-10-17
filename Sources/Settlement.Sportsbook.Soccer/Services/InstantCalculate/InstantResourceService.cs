using Kaden.XmlConverter;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.Soccer.Services.InstantCalculate
{
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

        private readonly char homeValue = 'H';

        private readonly string fgHomeBetStatus = "FL:1-0;";

        private readonly string fgAwayBetStatus = "FL:2-0;";

        private readonly string htfgHomeBetStatus = "1FL:1-0;";

        private readonly string htfgAwayBetStatus = "1FL:2-0;";

        private readonly string fl = "FL";

        private readonly string halfTimeFl = "1FL";

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
                var resource = GetResource127L(goalCondition);
                resources.Add(resource);
            }

            if (goalCondition.IsExistFgNg)
            {
                var resource = GetResource14F(goalCondition);
                resources.Add(resource);
            }

            return resources;
        }

        public List<XmlResource> FullTime(InstantGoalCondition goalCondition)
        {
            var resources = new List<XmlResource>();
            if (goalCondition.IsExistFgNg)
            {
                var resource = GetResource14F(goalCondition);
                resources.Add(resource);
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

            var fullTimeGoalChecking = instantGoalCheckingService.IsFullTimeGoallChecking(goalCondition);
            if (goalCondition.IsExistFgLg && !goalCondition.IsExistFgNg || fullTimeGoalChecking)
            {
                resources.Add(InitialResource(ResourceKey.FullTimeFirstGoal));
            }

            return resources;
        }

        public string BetStatusFl(InstantCalculationRequest request, string betStatus)
        {
            var goalOnly = request.GoalRecord.Replace(";", string.Empty);
            var indexOfHtFl = betStatus.IndexOf(halfTimeFl, StringComparison.CurrentCulture);
            var betStatusExcludeHtFl = indexOfHtFl > -1 ? betStatus.Remove(indexOfHtFl, 8) : betStatus;
            var isNotExistBetStatusFl = !betStatusExcludeHtFl.Contains(fl);
            if (goalOnly.Length > 0 && request.IsExistFG && isNotExistBetStatusFl)
            {
                return request.GoalRecord[0] == homeValue ? fgHomeBetStatus : fgAwayBetStatus;
            }

            return string.Empty;
        }

        public string BetStatusHtFl(InstantCalculationRequest request, string betStatus)
        {
            var goalRecord = request.GoalRecord ?? string.Empty;
            var goalOnly = goalRecord.Split(";").First();
            var isNotExistBetStatusHtFl = !betStatus.Contains(halfTimeFl);
            if (goalOnly.Length > 0 && request.IsExistHTFG && isNotExistBetStatusHtFl)
            {
                return request.GoalRecord[0] == homeValue ? htfgHomeBetStatus : htfgAwayBetStatus;
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
                var indexOfKey = betStatus.IndexOf(halfTimeFl, StringComparison.CurrentCulture);
                betStatus = indexOfKey > -1 ? betStatus.Remove(indexOfKey, htfgHomeBetStatus.Length) : betStatus;
            }

            if (request.IsExistFG)
            {
                var indexOfKey = betStatus.IndexOf(fl, StringComparison.CurrentCulture);
                betStatus = indexOfKey > -1 ? betStatus.Remove(indexOfKey, fgHomeBetStatus.Length) : betStatus;
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

        private XmlResource GetResource127L(InstantGoalCondition goalCondition)
        {
            var halftimeGoal = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
            var goalAction = CreateGoalAction(halftimeGoal, string.Empty);
            var fristGoal = goalRecordService.FirstGoalRecord(goalAction.FirstGoal, goalAction.IsRefund);

            return new XmlResource
            {
                ResourceId = ResourceKey.HalftimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = goalAction.FirstGoalSettlementStatusId,
                HomeValue = fristGoal
            };
        }

        private XmlResource GetResource14F(InstantGoalCondition goalCondition)
        {
            var halftime = goalRecordService.HalftimeGoal(goalCondition.GoalRecord);
            var fullTime = goalRecordService.FullTimeGoal(goalCondition.GoalRecord);
            var goalAction = CreateGoalAction(halftime, fullTime);
            var fullTimeGoal = $"{goalAction.FirstGoal}{goalAction.LastGoal}";
            var fristGoal = goalRecordService.FirstGoalRecord(fullTimeGoal, goalAction.IsRefund);

            return new XmlResource
            {
                ResourceId = ResourceKey.FullTimeFirstGoal,
                ResultStatusId = ResultStatus.ManuallySettled,
                SettlementStatusId = goalAction.FirstGoalSettlementStatusId,
                HomeValue = fristGoal
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
}