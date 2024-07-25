using System.Text.Json.Serialization;
using Fanex.Data.Repository;
using Fanex.Data;

namespace Settlement.Core.Criteria;

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
    public int ConfirmHT { get; set; }

    [JsonPropertyName("cfft")]
    public int ConfirmFT { get; set; }

    [JsonPropertyName("p")]
    public int ParentId { get; set; }
}

public class OSTicketInfoSelCriteria : CriteriaBase
{
    public string MatchInfo { get; set; }
    public string MatchOverStatus { get; set; }
    public string ChildMatchInfo { get; set; }
    public string OverStatus { get; set; }
    public string MatchCode { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_MatchOtherSports_TicketInfoSel_{DbServer}";

    public override bool IsValid() => true;
}