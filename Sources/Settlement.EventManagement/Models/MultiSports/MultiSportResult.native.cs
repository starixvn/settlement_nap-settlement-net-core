namespace Settlement.EventManagement.Models.MultiSports;

public class MultiSportResult
{
    public List<Match> Matches { get; set; } = new();

    public List<ResultDetail> ResultDetails { get; set; }
}