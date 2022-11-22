using Settlement.EventManagement.Models;

namespace Settlement.EventManagement.Requests;

public class LeagueRequest : IRequest<List<LeagueTypeModel>>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string SportTypes { get; set; }

    public byte Page { get; set; }
}