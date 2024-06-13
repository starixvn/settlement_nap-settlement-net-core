namespace Fanex.Settlement.ScaleOut.Criteria.Normal;

public class ValidateEventCriteria : ExecuteSingleCriteria
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public string Mode { get; set; }

    public bool IsAuto { get; set; }

    public string SelectedResources { get; set; }

    public int InstantKey { get; set; }

    public string SpName { get; set; }

    public int SDTRecord { get; set; }

    public int SettleAbandonedMatchIBCParlay { get; set; }

    public int DestinationMatchId { get; set; }

    public bool IsAutoRefund { get; set; }

    public override string GetSettingKey() => "NAP_Admin_Settlement_Validation_Event";

    public override bool IsValid() => MatchId > 0;
}