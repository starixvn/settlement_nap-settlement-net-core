using Settlement.Core.Models;

namespace Settlement.Log.Models;

public class ProviderLog
{
    public MatchDetail MatchDetail { get; set; }

    public List<ResultLog> ProviderResultLog { get; set; }
}