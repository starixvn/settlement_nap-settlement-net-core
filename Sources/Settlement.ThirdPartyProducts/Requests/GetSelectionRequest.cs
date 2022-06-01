using MediatR;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests
{
    public class GetSelectionRequest : IRequest<SelectionPermissionModel>
    {
        public int MatchId { get; set; }
    }
}