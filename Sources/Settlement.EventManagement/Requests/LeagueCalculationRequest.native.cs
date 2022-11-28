using Settlement.EventManagement.Models;

namespace Settlement.EventManagement.Requests;

public class LeagueCalculationRequest : IRequest<List<LeagueTypeModel>>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }
}