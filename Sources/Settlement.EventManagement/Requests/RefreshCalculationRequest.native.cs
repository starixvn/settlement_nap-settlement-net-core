using MediatR;
using Settlement.EventManagement.Models.Calculation;
using System.Collections.Generic;

namespace Settlement.EventManagement.Requests
{
    public class RefreshCalculationRequest : IRequest<List<Match>>
    {
        public int LeagueId { get; set; }

        public bool IsAutoCalculatePage { get; set; }
    }
}
