using MediatR;
using Settlement.EventManagement.Models.Calculation;

namespace Settlement.EventManagement.Requests
{
    public class RefreshCalculationRequest : IRequest<List<Match>>
    {
        public string LeagueIds { get; set; }
    }
}