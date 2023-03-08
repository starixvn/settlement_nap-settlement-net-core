using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Core.Services;
using System.Globalization;

namespace Settlement.EventManagement.Models;

[MessagePackObject]
public class BaseMatch
{
    private string eventStatus = string.Empty;

    private const string Dash = "-";

    private string suspenderHalfTime = string.Empty;

    private string suspenderFullTime = string.Empty;

    [JsonIgnore, IgnoreMember]
    public IRefDataService RefDataService { get; set; }

    [Key("matchId")]
    public int MatchId { get; set; }

    [Key("leagueId")]
    public int LeagueId { get; set; }

    [Key("leagueName")]
    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    [JsonIgnore, IgnoreMember]
    public int HomeId { get; set; }

    [Key("homeName")]
    public string HomeName => RefDataService.GetTeamName(HomeId) + (IsNeutral ? " (N)" : string.Empty);

    [JsonIgnore, IgnoreMember]
    public int AwayId { get; set; }

    [Key("awayName")]
    public string AwayName => RefDataService.GetTeamName(AwayId);

    [Key("matchCode")]
    public string MatchCode { get; set; }

    [IgnoreMember]
    public DateTime KickOffTime { get; set; }

    [Key("kickOffTime")]
    public string KickOff => KickOffTime.ToString(CultureInfo.InvariantCulture);

    [JsonIgnore, IgnoreMember]
    public DateTime EventDate { get; set; }

    [JsonIgnore, IgnoreMember]
    public bool IsNeutral { get; set; }

    [Key("halfTimeHomeScore")]
    public int? HalfTimeHomeScore { get; set; }

    [Key("halfTimeAwayScore")]
    public int? HalfTimeAwayScore { get; set; }

    [Key("finalHomeScore")]
    public int? FinalHomeScore { get; set; }

    [Key("finalAwayScore")]
    public int? FinalAwayScore { get; set; }

    [IgnoreMember]
    public bool IsExistEarlyBetTypes { get; set; }

    [IgnoreMember]
    public bool IsRunningEarlyBetTypes { get; set; }

    [IgnoreMember]
    public bool IsWaitingEarlyBetTypes { get; set; }

    [Key("isCalculatingSingle")]
    public int? IsCalculatingSingle { get; set; }

    [IgnoreMember]
    public bool IsOpenOdds { get; set; }

    [Key("isExistRunningTicket")]
    public bool IsExistRunningTicket { get; set; }

    [Key("isCalculatingMP")]
    public int? IsCalculatingMP { get; set; }

    [Key("isCalculated")]
    public bool IsCalculated { get; set; }

    [Key("isHalfTimeCal")]
    public bool IsHalfTimeCal { get; set; }

    [Key("isCalRefund")]
    public bool IsCalRefund { get; set; }

    [IgnoreMember]
    public int EventStatusReason { get; set; }

    [Key("eventStatus")]
    public string EventStatus
    {
        get => eventStatus.MapToString(BetStatus, Remark.IsPending);

        set
        {
            OriginalEventStatus ??= value;
            eventStatus = value;
        }
    }

    [IgnoreMember]
    public string OriginalEventStatus { get; set; }

    [Key("betStatus")]
    public string BetStatus { get; set; }

    [Key("remark")]
    public RemarkSettingModel Remark => new(SettlementStatus);

    [IgnoreMember]
    public byte SettlementStatus { get; set; }

    [Key("sportType")]
    public int SportType { get; set; }

    [Key("newEventStatus")]
    public string NewEventStatus { get; set; }

    [IgnoreMember]
    public int AutoSetting { get; set; }

    [IgnoreMember]
    public int AutoSettingForLeague { get; set; }

    [Key("earlySettleStatus")]
    public string EarlySettleStatus { get; set; }

    [Key("eventStatusColor")]
    public string EventStatusColor { get; set; }

    [Key("isNotConsistentExHtScore")]
    public bool IsNotConsistentExHtScore { get; set; }

    [Key("isNotConsistentExFtScore")]
    public bool IsNotConsistentExFtScore { get; set; }

    [Key("suspenderHalfTime")]
    public string SuspenderHalfTime
    {
        get => string.IsNullOrEmpty(suspenderHalfTime) ? Dash : suspenderHalfTime;

        set => suspenderHalfTime = value;
    }

    [Key("suspenderFullTime")]
    public string SuspenderFullTime
    {
        get => string.IsNullOrEmpty(suspenderFullTime) ? Dash : suspenderFullTime;

        set => suspenderFullTime = value;
    }

    [Key("confirmHalfTimeScore")]
    public string ConfirmHalfTimeScore { get; set; }

    [Key("confirmFullTimeScore")]
    public string ConfirmFullTimeScore { get; set; }

    [Key("isExistMarkedTicket")]
    public bool IsExistMarkedTicket { get; set; }

    [IgnoreMember]
    public int ChildMatchType { get; set; }

    [IgnoreMember]
    public List<SiteMatch> SiteMatch { get; set; } = new();

    [Key("offerLive")]
    public bool OfferLive { get; set; }

    [Key("directWaitingTime")]
    public int DirectWaitingTime { get; set; }
}