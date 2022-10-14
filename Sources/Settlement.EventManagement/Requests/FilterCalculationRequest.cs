using MediatR;
using Settlement.EventManagement.Models.Calculation;
using System;

namespace Settlement.EventManagement
{
    public class FilterCalculationRequest : IRequest<CalculationLeagues>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string MatchCode { get; set; }

        public string LeagueIds { get; set; }

        public bool IsIncludeTest { get; set; }

        public string MatchStatus { get; set; }

        public int FilterOver { get; set; }

        public string HoldStatus { get; set; }

        public int MatchType { get; set; }
    }
}