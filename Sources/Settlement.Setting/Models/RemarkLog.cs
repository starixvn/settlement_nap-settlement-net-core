using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Settlement.Setting.Models;

public record Remark(bool IsPending, bool IsUndecided, bool IsUnderSettle, bool IsMtdHold, bool IsKeyHold);

public class RemarkLog
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("rm")]
    public string Remark { get; set; }
}

public class ChildMatchRemark
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("p")]
    public int ParentMatchId { get; set; }
}