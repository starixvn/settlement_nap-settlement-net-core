using Settlement.EventManagement.Models.Calculation;

namespace Settlement.EventManagement.Requests;

public class RefreshAutoCalculationRequest : IRequest<List<CalculateMatchWaiting>>
{
    public int LeagueId { get; set; }
}