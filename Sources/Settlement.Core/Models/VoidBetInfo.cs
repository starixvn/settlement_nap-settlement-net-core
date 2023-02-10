using Newtonsoft.Json;

namespace Settlement.Core.Models;

public class VoidBetInfo
{
    public string TransId { get; set; }

    public string CustId { get; set; }

    [JsonIgnore]
    public int StatusId { get; set; }
}