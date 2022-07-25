using System.Collections.Generic;
using System.Linq;
using Kaden.Extensions;
using Settlement.Core.Constants;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.Services.Calculation
{
    public interface NewInfoMatchService
    {
        string NewEventStatus(Match match);

        string EventStatusColor(Match match);

        string EarlySettlementStatus(Match match);

        string AutoSettleFastMarket(Match match);
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

        private const int IsWaiting = 0;

        private readonly SiteMatchService siteMatchService;

        public NewInfoMatchServiceImp(SiteMatchService siteMatchService)
        {
            this.siteMatchService = siteMatchService;
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

            if (match.Remark.IsPending && match.EventStatus.IgnoreCaseEquals(EventStatusExtensions.ResultPending))
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
            if (siteMatchService.IsEventStatusOnSite(match))
            {
                return newEventStatus;
            }

            var isWaiting = match.SiteMatch.All(m => m.IsCalculatingSingle == IsWaiting);
            return match.IsCalculatingSingle == IsWaiting && isWaiting ? EventStatus.Waiting : EventStatus.Calculating;
        }
        

        public string EarlySettlementStatus(Match match)
        {
            return siteMatchService.EarlySettlementStatus(match);
        }

        public string AutoSettleFastMarket(Match match)
        {
            return siteMatchService.AutoSettleFastMarket(match);
        }

        private bool IsCheckingEventStatusReasons(Match match)
        {
            return match.SportType == SportType.Soccer
                   && match.EventStatus.IgnoreCaseEquals(EventStatus.Running)
                   && eventStatusReasons.Contains(match.EventStatusReason);
        }
    }
}