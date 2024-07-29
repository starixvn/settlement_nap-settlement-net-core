using System.Text.Json.Serialization;

namespace Settlement.Core.Models;

public class MatchOverStatus
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("r")]
    public string ResourceId { get; set; }

    [JsonPropertyName("o")]
    public int OverStatus { get; set; }
}