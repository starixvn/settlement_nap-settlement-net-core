using MediatR;
using Settlement.Sportsbook.Cricket.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Cricket.Requests
{
    public class GetRecalResultRequest : IRequest<List<MatchResultDetail>>
    {
        public int MatchId { get; set; }

        public int SportType { get; set; }
    }
}