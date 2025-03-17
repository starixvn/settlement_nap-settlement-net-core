using System.Text.Json.Serialization;
using Settlement.Core.Services;

namespace Settlement.Core.Models;

public class MatchDetail
{
    private const string CalculatedStatus = "Calculated";

    [JsonIgnore]
    public IRefDataService RefDataService { get; set; }

    public int SportType { get; set; }

    public string SportName => RefDataService.GetSportName(SportType);

    public int MatchId { get; set; }

    public string MatchCode { get; set; }

    public int LeagueId { get; set; }

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public string KickOffTime { get; set; }

    public DateTime EventDate { get; set; }

    public string EventStatus { get; set; }

    public int HomeId { get; set; }

    public string HomeName => RefDataService.GetTeamName(HomeId);

    public int AwayId { get; set; }

    public string AwayName => RefDataService.GetTeamName(AwayId);

    public int PlayTime { get; set; }

    public int? HalfTimeHomeScore { get; set; }

    public int? HalfTimeAwayScore { get; set; }

    public int? FinalHomeScore { get; set; }

    public int? FinalAwayScore { get; set; }

    public string BetStatus { get; set; }

    public int? ExHTHomeScore { get; set; }

    public int? ExHTAwayScore { get; set; }

    public int? ExFTHomeScore { get; set; }

    public int? ExFTAwayScore { get; set; }

    public bool IsCalculated { get; set; }

    public bool IsRefund { get; set; }

    public bool IsCalRefund { get; set; }

    public bool IsHalfTimeCal { get; set; }

    public bool IsMultiCaled { get; set; }

    private bool IsCalculatedAction => IsCalculated || IsMultiCaled || IsHalfTimeCal;

    public string HtStatus { get; set; }

    public string FtStatus { get; set; }

    public int ConfirmHT { get; set; }

    public int ConfirmFT { get; set; }

    private static bool CompareStatus(string status, string expected) => !string.IsNullOrEmpty(status) && status.Equals(expected);

    public bool IsUnCalculate
    {
        get
        {
            var betStatus = string.IsNullOrWhiteSpace(BetStatus) ? string.Empty : BetStatus.ToLowerInvariant();
            var refundAction = IsCalRefund || IsRefund || betStatus.Contains(Constants.EventStatus.Refund);
            var action = IsCalculatedAction || refundAction;
            var status = CompareStatus(HtStatus, CalculatedStatus);
            return action || status;
        }
    }

    public bool IsHalfTimeSettled => IsHalfTimeCal || (!string.IsNullOrWhiteSpace(BetStatus)
                                                       && BetStatus.IgnoreCaseContains(Constants.EventStatus.RefundHt));

    public bool IsFullTimeSettled => IsCalculated || IsRefundFullTime;

    private bool IsRefundFullTime => !string.IsNullOrWhiteSpace(BetStatus)
                                     && (BetStatus.IgnoreCaseContains(Constants.EventStatus.Abandoned)
                                         || (BetStatus.IgnoreCaseContains(Constants.EventStatus.Refund) && !BetStatus.IgnoreCaseContains(Constants.EventStatus.RefundHt)));

    public string ExternalSourceName { get; set; }

    public bool IsHtOnly { get; set; }

    public int ChildMatchType { get; set; }
}