using MessagePack;

namespace Settlement.Core.Models;

[MessagePackObject]
public class Permission
{
    [Key("canCalculate")]
    public bool CanCalculate { get; set; }

    [Key("canCalculateOutright")]
    public bool CanCalculateOutright { get; set; }

    [Key("canMarkPending")]
    public bool CanMarkPending { get; set; }

    [Key("canMarkUnDecided")]
    public bool CanMarkUnDecided { get; set; }

    [Key("canUncalculate")]
    public bool CanUncalculate { get; set; }

    [Key("canUncalculateInstant")]
    public bool CanUncalculateInstant { get; set; }

    [Key("canUncalculateOutright")]
    public bool CanUncalculateOutright { get; set; }

    [Key("canRefund")]
    public bool CanRefund { get; set; }

    [Key("canAutoPayout")]
    public bool CanAutoPayout { get; set; }

    [Key("canViewSettlementLog")]
    public bool CanViewSettlementLog { get; set; }

    [Key("canItAdmin")]
    public bool CanItAdmin { get; set; }

    [Key("isLeader")]
    public bool IsLeader { get; set; }

    [Key("canChangeScoreSource")]
    public bool CanChangeScoreSource { get; set; }

    [Key("canMoveTickets")]
    public bool CanMoveTickets { get; set; }

    [Key("isTrader")]
    public bool IsTrader { get; set; }

    [Key("autoSettlement")]
    public bool AutoSettlement { get; set; }
}