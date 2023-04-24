using MediatR;

namespace Settlement.ThirdPartyProducts.Requests.CashOut;

public class RefundRequest : IRequest
{
    public int MatchId { get; set; }

    public string BetStatus { get; set; }

    public int Half { get; set; }
}