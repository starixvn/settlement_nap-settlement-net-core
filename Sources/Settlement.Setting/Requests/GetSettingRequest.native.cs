namespace Settlement.Setting.Requests;

public class GetSettingRequest : IRequest<string>
{
    public int LeagueId { get; set; }

    public int MatchId { get; set; }
}