using MediatR;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class GetRecalResultRequest : IRequest<List<ResultDetail>>
    {
        public int MatchId { get; set; }

        public int SportType { get; set; }
    }
}