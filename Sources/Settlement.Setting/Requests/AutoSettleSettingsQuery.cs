using Settlement.Setting.Responses;

namespace Settlement.Setting.Requests;

public class AutoSettleSettingsQuery : IRequest<GetAutoSettleSettingsResponse>

{
    public int LeagueId { get; set; }
    public int MatchId { get; set; }
    public short SportType { get; set; }
    public string TypeObject { get; set; } = "League";
}
