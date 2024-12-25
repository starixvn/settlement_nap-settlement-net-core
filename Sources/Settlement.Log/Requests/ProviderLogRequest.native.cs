using MediatR;
using Settlement.Log.Models;

namespace Settlement.Log.Requests;

public class ProviderLogRequest : IRequest<ProviderLog>
{
    public int MatchId { get; set; }

    public string ResourceIds { get; set; }

    public string ResourceName { get; set; }

    public string SourceIds { get; set; }

    public bool LatestRecord { get; set; }

    public bool IsLive { get; set; }
}