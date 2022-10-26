using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface NewInfoMatchService
    {
        string NewEventStatus(Match match);

        string EventStatusColor(Match match);

        string EarlySettlementStatus(Match match);

        void TicketInfo(Match match);
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

        public string EventStatusColor(Match match)
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

            if (match.Remark.IsPending && match.EventStatus.IgnoreCaseEquals(EventStatus.ResultPending))
            {
                return siteMatchService.IsExistMarkedTickets(match)
                    ? Background.BrightYellowBlinking
                    : Background.BrightYellow;
            }

            return siteMatchService.IsExistMarkedTickets(match) ? Background.WhiteBlinking : string.Empty;
        }

        public string NewEventStatus(Match match)
        {
            var newEventStatus = IsCheckingEventStatusReasons(match) ? eventStatusReasonTitles[match.EventStatusReason - 1] : match.EventStatus;
            if (match.IsCalculatingSingle != CalculateStatus.IsWaiting && match.IsCalculatingSingle != CalculateStatus.IsCalculating)
            {
                return newEventStatus;
            }

            return match.IsCalculatingSingle == CalculateStatus.IsWaiting ? EventStatus.Waiting : EventStatus.Calculating;
        }

        public string EarlySettlementStatus(Match match)
        {
            return siteMatchService.EarlySettlementStatus(match);
        }

        public void TicketInfo(Match match)
        {
            match.IsExistMarkedTicket = siteMatchService.IsExistMarkedTicketsSingle(match);
            match.IsExistRunningTicket = siteMatchService.IsExistRunningTickets(match);
            match.IsExistMarkedTicketParlay = siteMatchService.IsExistMarkedTicketParlay(match);
            match.IsExistRunningTicketParlay = siteMatchService.IsExistRunningTicketParlay(match);
            match.IsCalculatingSingle = siteMatchService.IsCalculatingSingle(match);
        }

        private bool IsCheckingEventStatusReasons(Match match)
        {
            return match.EventStatus.IgnoreCaseEquals(EventStatus.Running)
                   && eventStatusReasons.Contains(match.EventStatusReason);
        }
    }
}