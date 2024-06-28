using MediatR;
using Settlement.Models;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests;

public class CalculateRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public string ActionName { get; set; }

    public List<ResourcesItemModel> Resources { get; set; }
}