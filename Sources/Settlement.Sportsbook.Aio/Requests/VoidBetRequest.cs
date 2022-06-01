using System.Collections.Generic;
using MediatR;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class VoidBetRequest : IRequest
    {
        public int MatchId { get; set; }

        public List<string> SelectedResources { get; set; }

        public string Action { get; set; }
    }
}