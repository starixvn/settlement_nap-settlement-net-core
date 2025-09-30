namespace Settlement.Sportsbook.Soccer.Requests;

public class ResultJackTimeRequest
{
    public int MatchId { get; set; }

    public string SelectedResources { get; set; }

    public string Action { get; set; }
}