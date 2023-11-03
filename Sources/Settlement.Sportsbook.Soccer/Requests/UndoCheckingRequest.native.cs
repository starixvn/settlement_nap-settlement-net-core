using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class UndoCheckingRequest : IRequest<UndoCheckingModel>
{
    public int MatchId { get; set; }
}