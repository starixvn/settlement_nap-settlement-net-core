using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Text.Json.Serialization;

namespace Settlement.Sportsbook.Soccer.Models;

public class FantasyRelatedMatch
{
    private string eventStatus = string.Empty;

    [JsonIgnore]
    public IRefDataService RefDataService { get; set; }

    public int MatchId { get; set; }

    public string MatchCode { get; set; }

    public DateTime KickOffTime { get; set; }

    public int HomeId { get; set; }

    public int AwayId { get; set; }

    public string HomeName => RefDataService.GetTeamName(HomeId);

    public string AwayName => RefDataService.GetTeamName(AwayId);

    public int? HtHomeScore { get; set; }

    public int? HtAwayScore { get; set; }

    public int? FinalHomeScore { get; set; }

    public int? FinalAwayScore { get; set; }

    public byte SettlementStatus { get; set; }

    public string BetStatus { get; set; }

    public string EventStatus
    {
        get => eventStatus.MapToString(BetStatus, Remark.IsPending);

        set => eventStatus = value;
    }

    public RemarkSettingModel Remark => new(SettlementStatus);

    public bool IsDeleted { get; set; }

    public short FtSettlementStatusId { get; set; }

    public short HtSettlementStatusId { get; set; }
}