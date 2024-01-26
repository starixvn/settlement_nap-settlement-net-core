using System.Text.Json.Serialization;
using MediatR;
using Settlement.Core.Models;
using Settlement.Setting.Models;

namespace Settlement.Setting.Requests;

public class UpdateRemarkRequest : IRequest<MatchAndPermission>
{
    public int MatchId { get; set; }

    public int Type { get; set; }

    public bool IsEnabled { get; set; }
}

public class UpdateHoldMatchSettingRequest : IRequest<MatchAndPermission>
{
    public int MatchId { get; set; }

    public Remark Remark { get; set; }
    public Remark OrgRemark { get; set; }
    public bool IsApplyChild { get; set; }
}

public record Remark(bool IsPending, bool IsUndecided, bool IsUnderSettle, bool IsMtdHold, bool IsKeyHold);

public class RemarkLog
{
    [JsonPropertyName("m")]
    public int MatchId { get; set; }

    [JsonPropertyName("rm")]
    public string Remark { get; set; }
}