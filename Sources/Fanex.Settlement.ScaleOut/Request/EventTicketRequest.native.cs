namespace Fanex.Settlement.ScaleOut.Request;

public class EventTicketRequest
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

    public bool IsAutoRefund { get; set; }
}