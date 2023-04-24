using MediatR;
using Settlement.Core.Models;

namespace Settlement.ThirdPartyProducts.Requests.CashOut;

public class VoidBetRequest : IRequest
{
    public int MatchId { get; set; }

    public string MatchCode { get; set; }

    public List<VoidBetInfo> VoidBetInfos { get; set; }

    public string Action { get; set; }

    public int SportType { get; set; }

    public int HomeId { get; set; }

    public int AwayId { get; set; }
}