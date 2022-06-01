using MediatR;
using Settlement.Core.Models;
using Settlement.Gaming.Models;
using System.Collections.Generic;

namespace Settlement.Gaming.Requests
{
    public class Happy5SettlementRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public List<BallModel> Balls { get; set; }

        public string Action { get; set; }
    }
}