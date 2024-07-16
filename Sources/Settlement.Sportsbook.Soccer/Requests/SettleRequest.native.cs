using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class SettleRequest : SettleBaseRequest, IRequest<Result>
{
    public bool IsReSettledTickets { get; set; }

    public string ChildMatchIds { get; set; }
    public bool isFantasyMatch { get; set; }
}