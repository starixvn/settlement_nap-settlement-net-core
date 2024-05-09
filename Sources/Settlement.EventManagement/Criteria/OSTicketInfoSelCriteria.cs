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
    public int SportType { get; set; }

    [JsonPropertyName("cmt")]
    public int ChildMatchType { get; set; }

    [JsonPropertyName("e")]
    public string EventStatus { get; set; }

    [JsonPropertyName("cfht")]
    public bool ConfirmHT { get; set; }

    [JsonPropertyName("cfft")]
    public bool ConfirmFT { get; set; }
}

public class OSTicketInfoSelCriteria : CriteriaBase
{
    public string MatchInfo { get; set; }
    public string MatchOverStatus { get; set; }

    public override string GetSettingKey() => "";

    public override bool IsValid() => true;
}