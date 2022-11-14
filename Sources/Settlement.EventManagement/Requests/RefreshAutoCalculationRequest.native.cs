using MediatR;
using Settlement.EventManagement.Models.Calculation;

namespace Settlement.EventManagement.Requests;

public class RefreshAutoCalculationRequest : IRequest<List<Match>>
{
    public int LeagueId { get; set; }
}