namespace Fanex.Settlement.ScaleOut.Criteria.Normal;

public class ValidateTicketCriteria : ExecuteCriteria
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public string Mode { get; set; }

    public bool IsAuto { get; set; }

    public string SelectedResources { get; set; }

    public string ResourceResult { get; set; }

    public string SpName { get; set; }

    public int SDTRecord { get; set; }

    public int InstantKey { get; set; }

    public int SettleAbandonedMatchIBCParlay { get; set; }

    public int DestinationMatchId { get; set; }

    public override string GetSettingKey() => $"NAP_Admin_Settlement_Validation_Ticket_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}