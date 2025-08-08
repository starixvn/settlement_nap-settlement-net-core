namespace Settlement.Setting.Responses;

public class GetAutoSettleSettingsResponse
{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public string LeagueName { get; set; }
    public string TypeObject { get; set; }

    public List<GetAutoSettleSettingResponseItem> ResultSettings { get; set; }
}
