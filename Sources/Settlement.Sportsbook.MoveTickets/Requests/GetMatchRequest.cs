using MediatR;
using Settlement.Sportsbook.MoveTickets.Models;
using System;

namespace Settlement.Sportsbook.MoveTickets.Requests
{
    public class GetMatchRequest : IRequest<MultiSportModel>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string MatchCode { get; set; }

        public string TicketStatus { get; set; }

        public string MatchStatus { get; set; }

        public string LeagueIds { get; set; }

        public string SportTypes { get; set; }

        public bool IsIncludeTest { get; set; }

        public int Remark { get; set; }
    }
}