using MediatR;
using Settlement.ThirdPartyProducts.Models;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.Requests;

public class MatchesWaitingRequest : IRequest<List<MatchDetailModel>>
{
    public string LeagueIds { get; set; }

    public string SportTypes { get; set; }
}