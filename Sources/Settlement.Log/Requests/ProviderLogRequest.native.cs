using MediatR;
using Settlement.Log.Models;

namespace Settlement.Log.Requests;

public class ProviderLogRequest : IRequest<List<ProviderResultLog>>
{
    public int MatchId { get; set; }

    public string ResultId { get; set; }

    public string ResultName { get; set; }

    public string Provider { get; set; }

    public bool IsLatestRecord { get; set; }
}