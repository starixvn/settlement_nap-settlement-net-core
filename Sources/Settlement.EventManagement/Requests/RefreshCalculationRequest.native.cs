using Settlement.EventManagement.Models.Calculation;

namespace Settlement.EventManagement.Requests;

public class RefreshCalculationRequest : IRequest<List<CalculateMatchWaiting>>
{
    public string LeagueIds { get; set; }
}