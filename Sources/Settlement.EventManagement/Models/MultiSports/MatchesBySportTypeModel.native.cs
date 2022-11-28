namespace Settlement.EventManagement.Models.MultiSports;

internal class MatchesBySportTypeModel
{
    public int SportType { get; set; }

    public List<Match> Matches { get; set; }
}