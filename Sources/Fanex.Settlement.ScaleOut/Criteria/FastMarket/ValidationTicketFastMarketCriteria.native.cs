namespace Fanex.Settlement.ScaleOut.Criteria.FastMarket;

public class ValidationTicketFastMarketCriteria : ExecuteCriteria
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public bool IsAuto { get; set; }

    public string Results { get; set; }

    public bool IsSettleDetermined { get; set; }

    public override string GetSettingKey() => $"NAP_Admin_Settlement_ValidationFM_Ticket_{DbServer}";

    public override bool IsValid() => MatchId > 0;
}