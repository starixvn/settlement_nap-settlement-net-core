using System.Text.Json.Serialization;

namespace Settlement.Core.Models;

public class ParentChildMatchFilter
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("p")]
    public int ParentId { get; set; }

    [JsonPropertyName("e")]
    public string Eventstatus { get; set; }

    [JsonPropertyName("s")]
    public int SportType { get; set; }
}