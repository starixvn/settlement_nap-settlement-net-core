using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.Requests
{
    public class CalculateRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public string ActionName { get; set; }

        public List<ResourcesItemModel> Resources { get; set; }
    }
}