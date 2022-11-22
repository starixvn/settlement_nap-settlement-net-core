using Settlement.Core.Models;

namespace Settlement.EventManagement.Requests;

public class CalculateParlayRequest : IRequest<Result>
{
    public string MatchIds { get; set; }

    public int AdminId { get; set; }
}