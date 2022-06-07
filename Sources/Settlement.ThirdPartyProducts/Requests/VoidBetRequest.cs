using MediatR;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.Requests
{
    public class VoidBetRequest : IRequest
    {
        public int MatchId { get; set; }

        public string MatchCode { get; set; }

        public List<string> SelectedResources { get; set; }

        public string Action { get; set; }

        public int SportType { get; set; }

        public int HomeId { get; set; }

        public int AwayId { get; set; }
    }
}