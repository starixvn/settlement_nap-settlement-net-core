using MediatR;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests;

public class CalculateRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int SportType { get; set; }

    public string ActionName { get; set; }

    public string BroadcastSessionId { get; } = Guid.NewGuid().ToString();


    public List<ResourcesItemModel> Resources { get; set; }
}