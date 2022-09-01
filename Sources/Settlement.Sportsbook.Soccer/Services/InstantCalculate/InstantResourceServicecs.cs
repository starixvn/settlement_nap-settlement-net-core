using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Services.InstantCalculate
{
    public interface IInstantResourceService
    {
        List<XmlResource> Halftime(InstantGoalCondition goalCondition);

        List<XmlResource> FullTime(InstantGoalCondition goalCondition);

        List<XmlResource> UnCalculate(InstantGoalCondition goalCondition);

        string BetStatusFL(InstantCalculationRequest request);

        string BetStatusHTFL(InstantCalculationRequest request);

        string BetStatusUncalc(InstantCalculationRequest request);

        string RemoveOldValue(string betStatus);
    }

    public class InstantResourceServiceImp : IInstantResourceService
    {
        private readonly IInstantGoalCheckingService instantGoalCheckingService;

        private readonly IGoalRecordService goalRecordService;

        private readonly char HomeValue = 'H';

        private readonly string FGHomeBetStatus = "FL:1-0;";

        private readonly string FGAwayBetStatus = "FL:2-0;";

        private readonly string HTFGHomeBetStatus = "1FL:1-0;";

        private readonly string HTFGAwayBetStatus = "1FL:2-0;";

        private readonly string Fl = "FL";

        private readonly string HalfTimeFl = "1FL";

        public InstantResourceServiceImp(
            IInstantGoalCheckingService instantGoalCheckingService,
            IGoalRecordService goalRecordService)
        {
            this.instantGoalCheckingService = instantGoalCheckingService;
            this.goalRecordService = goalRecordService;
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

        public string RemoveOldValue(string betStatus)
        {
            if (betStatus != null)
            {
                return string.Empty;
            }

            betStatus = removeBetStatus(HTFGHomeBetStatus, betStatus);
            betStatus = removeBetStatus(HTFGAwayBetStatus, betStatus);
            betStatus = removeBetStatus(FGHomeBetStatus, betStatus);
            betStatus = removeBetStatus(FGAwayBetStatus, betStatus);

            return betStatus;
        }

        private string removeBetStatus(string key, string betStatus)
        {
            var indexOfKey = betStatus.IndexOf(key);
            if (indexOfKey > -1)
            {
                return betStatus.Remove(indexOfKey, 8);
            }

            return betStatus;
        }

        public string BetStatusFL(InstantCalculationRequest request)
        {
            var goalOnly = request.GoalRecord.Replace(";", string.Empty);
            if (goalOnly.Length > 0 && request.IsExistFG)
            {
                return request.GoalRecord[0] == HomeValue ? FGHomeBetStatus : FGAwayBetStatus;
            }

            return string.Empty;
        }

        public string BetStatusHTFL(InstantCalculationRequest request)
        {
            var goalOnly = request.GoalRecord.Replace(";", string.Empty);

            if (goalOnly.Length > 0 && request.IsExistHTFG)
            {
                return request.GoalRecord[0] == HomeValue ? HTFGHomeBetStatus : HTFGAwayBetStatus;
            }

            return string.Empty;
        }

        public string BetStatusUncalc(InstantCalculationRequest request)
        {
            var betStatus = request.BetStatus;
            if (request.IsExistFG)
            {
                betStatus = removeBetStatus(FGHomeBetStatus, betStatus);
                betStatus = removeBetStatus(FGAwayBetStatus, betStatus);
            }

            if (request.IsExistHTFG)
            {
                betStatus = removeBetStatus(HTFGHomeBetStatus, betStatus);
                betStatus = removeBetStatus(HTFGAwayBetStatus, betStatus);
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
    }
}