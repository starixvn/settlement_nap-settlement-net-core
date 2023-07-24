namespace Settlement.EventManagement.Models.MultiSports;

public class MultiSportResult
{
    public MultiSportResult()
    {
        Matches = new List<Match>();
    }

    public List<Match> Matches { get; set; }

    public List<ResultDetail> ResultDetails { get; set; }
}