using System.Collections.Generic;
using MediatR;

namespace Settlement.Sportsbook.Aio.Requests
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