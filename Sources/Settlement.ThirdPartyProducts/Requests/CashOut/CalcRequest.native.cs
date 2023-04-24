using MediatR;

namespace Settlement.ThirdPartyProducts.Requests.CashOut;

public class CalcRequest : IRequest
{
    public int MatchId { get; set; }

    public string Betstatus { get; set; }
}