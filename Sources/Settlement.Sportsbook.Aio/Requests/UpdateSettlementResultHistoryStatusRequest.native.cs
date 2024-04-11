using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Requests;

public class UpdateSettlementResultHistoryStatusRequest : IRequest<bool>
{
    public int MatchId { get; set; }
    public string SessionIds { get; set; }
}