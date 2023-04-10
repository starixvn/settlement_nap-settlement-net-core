using MediatR;
using Settlement.Core.Models;

namespace Settlement.ThirdPartyProducts.Requests;

public class GetTicketInfo : IRequest<List<VoidBetInfo>>
{
    public int MatchId { get; set; }

    public List<string> SelectedResources { get; set; }

    public string Action { get; set; }
}