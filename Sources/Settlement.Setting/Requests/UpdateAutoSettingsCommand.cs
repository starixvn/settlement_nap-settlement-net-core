using Settlement.Setting.Responses;

namespace Settlement.Setting.Requests;

public class UpdateAutoSettingsCommand
{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public string MatchName { get; set; }
    public string LeagueName { get; set; }
    public string TypeObject { get; set; } // "League" hoặc "Match"
    public bool IsApplyAll { get; set; }

    public List<GetAutoSettleSettingResponseItem> ResultSettings { get; set; }
}
