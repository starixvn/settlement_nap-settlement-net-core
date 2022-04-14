using System;
using MediatR;
using Settlement.EventManagement.Models;

namespace Settlement.EventManagement
{
    public class FilterMultiSportRequest : IRequest<MultiSportModel>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string MatchCode { get; set; }

        public string TicketStatus { get; set; }

        public string MatchStatus { get; set; }

        public string LeagueIds { get; set; }

        public string SportTypes { get; set; }

        public bool IsIncludeTest { get; set; }

        public int AutoPayout { get; set; }

        public string HoldStatus { get; set; }

        public string OverStatus { get; set; }
    }
}