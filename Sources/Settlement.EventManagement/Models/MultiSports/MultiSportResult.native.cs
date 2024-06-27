namespace Settlement.EventManagement.Models.MultiSports;

public class MultiSportResult
{
    public List<Match> Matches { get; set; } = [];

    public List<ResultDetail> ResultDetails { get; set; }
}