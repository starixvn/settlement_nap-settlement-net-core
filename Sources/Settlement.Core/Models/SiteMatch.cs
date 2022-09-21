using System.Collections.Generic;

namespace Settlement.Core.Models
{
    public class SiteMatch
    {
        public bool IsExistResultAndFirstTeamScore { get; set; }

        public bool IsExistFgNg { get; set; }

        public bool IsExistHtFgLg { get; set; }

        public bool IsExistFgLg { get; set; }

        public bool IsLive { get; set; }

        public bool IsEnabledGoalRecordHt { get; set; }

        public bool IsEnabledGoalRecordFt { get; set; }

        public int? IsCalculatingSingle { get; set; }

        public bool IsExistMarkedTicket { get; set; }

        public bool IsExistMarkedTicketParlay { get; set; }

        public bool IsExistRunningTicket { get; set; }

        public bool IsExistRunningTicketParlay { get; set; }

        public bool IsExistEarlyBetTypes { get; set; }

        public bool IsRunningEarlyBetTypes { get; set; }

        public bool IsWaitingEarlyBetTypes { get; set; }

        public bool IsExistFastMarket { get; set; }

        public bool IsExistFastMarketResult { get; set; }

        public bool IsRunningFastMarket { get; set; }

        public bool IsExistsConfirmedEarly { get; set; }

        public bool IsExistEarlyBettypesParlay { get; set; }

        public bool IsRunningEarlyBettypesParlay { get; set; }

        public bool IsWaitingEarlyBettypesParlay { get; set; }

        public List<ChildMatchTicketInfos> SiteChildMatches { get; set; }

        public List<TicketCounts> TicketCounts { get; set; }
    }
}