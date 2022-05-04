using MediatR;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests
{
    public class MatchInfoRequest : IRequest<MatchDetailModel>
    {
        public int MatchId { get; set; }
    }
}