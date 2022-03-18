using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Settlement.FastMarkets.Requests
{
    public class GetTimeMachineResultRequest : IRequest<List<TimeMachineResult>>
    {
        public int MatchId { get; set; }
    }
}