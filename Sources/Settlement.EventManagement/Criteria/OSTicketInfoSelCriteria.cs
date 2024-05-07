using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Settlement.EventManagement.Criteria;

public class MatchRequest
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }
    [JsonPropertyName("s")]
    public short SportType { get; set; }
    [JsonPropertyName("cmt")]
    public byte ChildMatchType { get; set; }
    [JsonPropertyName("e")]
    public int EventStatus { get; set; }
    [JsonPropertyName("cfht")]
    public bool ConfirmHT { get; set; }
    [JsonPropertyName("cfft")]
    public bool ConfirmFT { get; set; }
}

public class MatchOverStatus
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }
    [JsonPropertyName("b")]
    public int BetType { get; set; }
    [JsonPropertyName("bi")]
    public int BetId { get; set; }
    [JsonPropertyName("o")]
    public int OverStatus { get; set; }
}

public class OSTicketInfoSelCriteria
{
}