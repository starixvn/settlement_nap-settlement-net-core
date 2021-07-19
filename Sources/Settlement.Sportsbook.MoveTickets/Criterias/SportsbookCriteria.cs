using Fanex.Data.Repository;
using System;

namespace Settlement.Sportsbook.MoveTickets.Criterias
{
    public class SportsbookCriteria : CriteriaBase
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string TicketStatus { get; set; }

        public string MatchStatus { get; set; }

        public string MatchCode { get; set; }

        public string LeagueIds { get; set; }

        public string SportTypes { get; set; }

        public bool IsIncludeTest { get; set; }

        public string HoldStatus { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_MatchOtherSportsSel";
        }

        public override bool IsValid()
        {
            return FromDate <= ToDate;
        }
    }
}