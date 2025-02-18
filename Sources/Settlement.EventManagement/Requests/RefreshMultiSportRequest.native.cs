namespace Settlement.EventManagement.Requests;

public class RefreshMultiSportRequest
{
    public string LeagueIds { get; set; }

    public string MatchIds { get; set; }

    public bool IsLeader { get; set; }
}