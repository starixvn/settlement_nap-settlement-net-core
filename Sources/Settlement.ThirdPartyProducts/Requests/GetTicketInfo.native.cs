using Fanex.Settlement.MessageBridge.JackTime;
using MediatR;
using ResourceItem = Settlement.ThirdPartyProducts.Models.ResourceItem;

namespace Settlement.ThirdPartyProducts.Requests;

public class GetTicketInfo : IRequest<List<VoidBetInfo>>
{
    public int MatchId { get; set; }

    public IEnumerable<ResourceItem> SelectedResources { get; set; }

    public string Action { get; set; }

    public bool IsResettledTickets { get; set; }

    public int DeterminedType { get; set; }
}