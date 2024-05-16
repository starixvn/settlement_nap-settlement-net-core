using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Settlement.EventManagement.Models.MultiSports;

public class MatchOverStatus
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("b")]
    public int BetType { get; set; }

    [JsonPropertyName("bid")]
    public int BetId { get; set; }

    [JsonPropertyName("o")]
    public int OverStatus { get; set; }
}