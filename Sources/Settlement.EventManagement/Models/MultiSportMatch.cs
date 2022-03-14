using MessagePack;
using Settlement.Core.Models;

namespace Settlement.EventManagement.Models
{
    [MessagePackObject]
    public class MultiSportMatch
    {
        [Key("leagueId")]
        public int LeagueId { get; set; }

        [Key("sportName")]
        public string SportName { get; set; }

        [Key("leagueName")]
        public string LeagueName { get; set; }

        [Key("homeName")]
        public string HomeName { get; set; }

        [Key("awayName")]
        public string AwayName { get; set; }

        [Key("matchCode")]
        public string MatchCode { get; set; }

        [Key("kickOffTime")]
        public string KickOffTime { get; set; }

        [Key("showLink")]
        public bool ShowLink { get; set; }

        [Key("matchId")]
        public int MatchId { get; set; }

        [Key("sportType")]
        public int SportType { get; set; }

        [Key("eventStatus")]
        public string EventStatus { get; set; }

        [Key("betStatus")]
        public string BetStatus { get; set; }

        [Key("halfTimeHomeScore")]
        public int? HalfTimeHomeScore { get; set; }

        [Key("halfTimeAwayScore")]
        public int? HalfTimeAwayScore { get; set; }

        [Key("finalHomeScore")]
        public int? FinalHomeScore { get; set; }

        [Key("finalAwayScore")]
        public int? FinalAwayScore { get; set; }

        [Key("isCalculatingSingle")]
        public int? IsCalculatingSingle { get; set; }

        [Key("isCalculatingMP")]
        public int? IsCalculatingMP { get; set; }

        [Key("isCalculated")]
        public bool IsCalculated { get; set; }

        [Key("isMultiCaled")]
        public bool IsMultiCaled { get; set; }

        [Key("isRefund")]
        public bool IsRefund { get; set; }

        [Key("isCalRefund")]
        public bool IsCalRefund { get; set; }

        [Key("isHalfTimeCal")]
        public bool IsHalfTimeCal { get; set; }

        [Key("suspenderHalfTime")]
        public string SuspenderHalfTime { get; set; }

        [Key("suspenderFullTime")]
        public string SuspenderFullTime { get; set; }

        [Key("earlySettleStatus")]
        public string EarlySettleStatus { get; set; }

        [Key("isExistRunningTicket")]
        public bool IsExistRunningTicket { get; set; }

        [Key("isExistMarkedTicket")]
        public bool IsExistMarkedTicket { get; set; }

        [Key("isExistMarkedTicketParlay")]
        public bool IsExistMarkedTicketParlay { get; set; }

        [Key("autoPayoutStatus")]
        public int AutoPayoutStatus { get; set; }

        [Key("moreScores")]
        public MoreScores MoreScores { get; set; }

        [Key("eventStatusColor")]
        public string EventStatusColor { get; set; }

        [Key("newEventStatus")]
        public string NewEventStatus { get; set; }

        [Key("isHavingIntervalScore")]
        public bool IsHavingIntervalScore { get; set; }

        [Key("autoCalcSetting")]
        public AutoCalculationSetting AutoCalcSetting { get; set; }

        [Key("remark")]
        public RemarkSettingModel Remark { get; set; }

        [Key("mixParlay")]
        public MixParlay MixParlay { get; set; }

        [Key("confirmHalfTimeColor")]
        public string ConfirmHalfTimeColor { get; set; }

        [Key("confirmFullTimeColor")]
        public string ConfirmFullTimeColor { get; set; }

        [Key("exHalfTimeScore")]
        public string ExHalfTimeScore { get; set; }

        [Key("exFullTimeScore")]
        public string ExFullTimeScore { get; set; }

        [Key("isMergedParlay")]
        public bool IsMergedParlay { get; set; }

        [Key("isExistsConfirmedEarly")]
        public bool IsExistsConfirmedEarly { get; set; }

        [Key("isExistRunningTicketParlay")]
        public bool IsExistRunningTicketParlay { get; set; }
    }
}