using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.FastMarkets.Requests;

public class GetOuTimeMachineResultRequest : IRequest<List<TimeMachineResult>>
{
    public int MatchId { get; set; }
}