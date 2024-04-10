using System.Text.Json.Serialization;

namespace Settlement.Setting.Models;

public record Remark(bool IsPending, bool IsUndecided, bool IsUnderSettle, bool IsMtdHold, bool IsKeyHold);

public class RemarkLog
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("rm")]
    public string Remark { get; set; }

    public RemarkLog()
    {
    }

    public RemarkLog(int matchId, string remark)
    {
        MatchId = matchId;
        Remark = remark;
    }
}

public class ChildMatchRemark
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("p")]
    public int ParentMatchId { get; set; }
}