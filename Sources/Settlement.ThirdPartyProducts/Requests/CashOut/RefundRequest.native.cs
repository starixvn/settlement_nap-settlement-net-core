using MediatR;

namespace Settlement.ThirdPartyProducts.Requests.CashOut;

public class RefundRequest : IRequest
{
    public int MatchId { get; set; }

    public string Betstatus { get; set; }

    public int Half { get; set; }
}