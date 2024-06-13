namespace Fanex.Settlement.ScaleOut.Request;

public class RefundChildMatchRequest
{
    public int ParentId { get; set; }

    public string ChildMatchIds { get; set; }

    public int LeagueGroupId { get; set; }

    public string ActionName { get; set; }

    public int? HomeValue { get; set; }

    public int? AwayValue { get; set; }
}