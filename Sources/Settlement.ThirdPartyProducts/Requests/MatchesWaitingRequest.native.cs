using MediatR;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests;

public class MatchesWaitingRequest : IRequest<List<MatchDetailModel>>
{
    public string LeagueIds { get; set; }

    public string SportTypes { get; set; }
}