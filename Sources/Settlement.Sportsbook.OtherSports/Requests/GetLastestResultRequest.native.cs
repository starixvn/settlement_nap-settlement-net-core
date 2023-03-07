using MediatR;
using Settlement.Sportsbook.OtherSports.Models;

namespace Settlement.Sportsbook.OtherSports.Requests;

public class GetLastestResultRequest : IRequest<MatchResultDetail>
{
    public int MatchId { get; set; }
}