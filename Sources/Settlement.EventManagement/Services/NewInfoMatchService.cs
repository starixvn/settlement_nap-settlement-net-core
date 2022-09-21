using System.Collections.Generic;
using Kaden.Extensions;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Models;
using Match = Settlement.EventManagement.Models.Calculation.Match;
using MultiSportMatch = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.Services
{
    public interface NewInfoMatchService
    {
        string NewEventStatus(BaseMatch match);

        string EventStatusColor(BaseMatch match);

        string EarlySettlementStatus(BaseMatch match);

        string FastMarketStatus(Match match);

        string ConfirmScore(List<ResultDetail> listResultDetail, string resource);

        bool IsNotConsistentScore(string suspenderConfirm, List<ResultDetail> resultDetail, List<ResultDetail> sourceResultDetail, string resource);

        GoalIcon GoalIcon(Match match);

        void TicketInfo(BaseMatch match);

        bool IsExistsConfirmedEarly(MultiSportMatch match);
    }

    public class NewInfoMatchServiceImp : NewInfoMatchService
    {
        private readonly List<int> eventStatusReasons = new List<int> { 1, 2, 3, 4 };

        private readonly List<string> eventStatusReasonTitles = new List<string>
        {
            EventStatus.IrregularTime1H,
            EventStatus.IrregularTime,
            EventStatus.WrongTeamName,
            EventStatus.Suspended,
        };

        private readonly SiteMatchService siteMatchService;

        private readonly IGoalIconService goalIconService;

        public NewInfoMatchServiceImp(
            SiteMatchService siteMatchService,
            IGoalIconService goalIconService)
        {
            this.siteMatchService = siteMatchService;
            this.goalIconService = goalIconService;
        }

        public string EventStatusColor(BaseMatch match)
        {
            if (match.EventStatus.IgnoreCaseEquals(EventStatus.PostPoned))
            {
                return siteMatchService.IsExistMarkedTickets(match)
                    ? Background.YellowBlinking
                    : Background.Yellow;
            }

            if (match.EventStatus.IgnoreCaseEquals(EventStatus.Completed))
            {
                return siteMatchService.GetBackgroundCompletedStatus(match);
            }

            if (match.Remark.IsPending && match.EventStatus.IgnoreCaseEquals(EventStatusExtensions.ResultPending))
            {
                return siteMatchService.IsExistMarkedTickets(match)
                    ? Background.BrightYellowBlinking
                    : Background.BrightYellow;
            }

            return siteMatchService.IsExistMarkedTickets(match) ? Background.WhiteBlinking : string.Empty;
        }

        public string NewEventStatus(BaseMatch match)
        {
            var newEventStatus = IsCheckingEventStatusReasons(match) ? eventStatusReasonTitles[match.EventStatusReason - 1] : match.EventStatus;
            if (match.IsCalculatingSingle != CalculateStatus.IsWaiting && match.IsCalculatingSingle != CalculateStatus.IsCalculating)
            {
                return newEventStatus;
            }

            return match.IsCalculatingSingle == CalculateStatus.IsWaiting ? EventStatus.Waiting : EventStatus.Calculating;
        }

        public string EarlySettlementStatus(BaseMatch match)
        {
            return siteMatchService.EarlySettlementStatus(match);
        }

        public string FastMarketStatus(Match match)
        {
            return siteMatchService.FastMarketStatus(match);
        }

        public string ConfirmScore(List<ResultDetail> listResultDetail, string resource)
        {
            var resultDetail = listResultDetail.Find(result => result.ResourceId == resource
                                                               && !string.IsNullOrWhiteSpace(result.AwayValue)
                                                               && !string.IsNullOrWhiteSpace(result.HomeValue));

            return resultDetail != null
                ? $"({resultDetail.SourceName}: {resultDetail.HomeValue}-{resultDetail.AwayValue})"
                : string.Empty;
        }

        public bool IsNotConsistentScore(string suspenderConfirm, List<ResultDetail> resultDetail, List<ResultDetail> sourceResultDetail, string resource)
        {
            if (string.Equals(suspenderConfirm, "-"))
            {
                return false;
            }

            var resultDetailByResource = resultDetail.Find(r => r.ResourceId == resource);
            var sourceResultDetailByResource = sourceResultDetail.Find(r => r.ResourceId == resource);

            if (sourceResultDetailByResource != null)
            {
                return (resultDetailByResource != null
                        && (resultDetailByResource.HomeValue != sourceResultDetailByResource.HomeValue || resultDetailByResource.AwayValue != sourceResultDetailByResource.AwayValue))
                       || resultDetailByResource == null;
            }
            return false;
        }

        public GoalIcon GoalIcon(Match match)
        {
            var goalIconQuery = GoalIconQuery(match);
            return goalIconService.GetGoalIcon(goalIconQuery);
        }

        public void TicketInfo(BaseMatch match)
        {
            match.IsExistMarkedTicket = siteMatchService.IsExistMarkedTicketsSingle(match);
            match.IsExistRunningTicket = siteMatchService.IsExistRunningTickets(match);
            match.IsExistMarkedTicketParlay = siteMatchService.IsExistMarkedTicketParlay(match);
            match.IsExistRunningTicketParlay = siteMatchService.IsExistRunningTicketParlay(match);
            match.IsCalculatingSingle = siteMatchService.IsCalculatingSingle(match);
        }

        public bool IsExistsConfirmedEarly(MultiSportMatch match)
        {
            return siteMatchService.IsExistsConfirmedEarly(match);
        }

        private GoalIconQueryModel GoalIconQuery(Match match)
        {
            return new GoalIconQueryModel
            {
                BetStatus = match.BetStatus,
                GoalRecord = match.GoalRecord,
                FinalAwayScore = match.FinalAwayScore,
                FinalHomeScore = match.FinalHomeScore,
                IsExistFgLg = siteMatchService.IsExistFgLg(match),
                IsExistHtFgLg = siteMatchService.IsExistHtFgLg(match)
            };
        }

        private bool IsCheckingEventStatusReasons(BaseMatch match)
        {
            return match.EventStatus.IgnoreCaseEquals(EventStatus.Running)
                   && eventStatusReasons.Contains(match.EventStatusReason);
        }
    }
}