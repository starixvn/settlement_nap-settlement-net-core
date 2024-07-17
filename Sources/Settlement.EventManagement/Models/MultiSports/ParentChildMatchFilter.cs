using System.Text.Json.Serialization;

namespace Settlement.EventManagement.Models.MultiSports;

public class ParentChildMatchFilter
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("p")]
    public int ParentId { get; set; }

    [JsonPropertyName("e")]
    public string Eventstatus { get; set; }
}