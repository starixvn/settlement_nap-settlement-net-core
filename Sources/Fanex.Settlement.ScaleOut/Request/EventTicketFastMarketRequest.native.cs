namespace Fanex.Settlement.ScaleOut.Request;

public class EventTicketFastMarketRequest
{
    public int MatchId { get; set; }

    public string Action { get; set; }

    public bool IsAuto { get; set; }

    public string Results { get; set; }

    public int AutoSetting { get; set; }

    public bool IsSettleDetermined { get; set; }
}