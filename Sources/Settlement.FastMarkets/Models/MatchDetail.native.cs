using Settlement.Core.Models;
using Settlement.Core.Services;

namespace Settlement.FastMarkets.Models;

public class MatchDetail
{
    private const int ConvertToBase = 2;
    private string halfTimeHomeScore = string.Empty;
    private string halfTimeAwayScore = string.Empty;
    private string finalHomeScore = string.Empty;
    private string finalAwayScore = string.Empty;
    private string goalRecord = string.Empty;
    private AutoSettingIcon autoSettingIcon;

    public IRefDataService RefDataService { get; set; }

    public int LeagueId { get; set; }

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public int HomeId { get; set; }

    public string HomeName => RefDataService.GetTeamName(HomeId);

    public int AwayId { get; set; }

    public string AwayName => RefDataService.GetTeamName(AwayId);

    public string MatchCode { get; set; }

    public int MatchId { get; set; }

    public DateTime KickOffTime { get; set; }

    public string HalfTimeHomeScore
    {
        get
        {
            return EmptyScore(halfTimeHomeScore);
        }

        set
        {
            halfTimeHomeScore = value;
        }
    }

    public string HalfTimeAwayScore
    {
        get
        {
            return EmptyScore(halfTimeAwayScore);
        }

        set
        {
            halfTimeAwayScore = value;
        }
    }

    public string FinalHomeScore
    {
        get
        {
            return EmptyScore(finalHomeScore);
        }

        set
        {
            finalHomeScore = value;
        }
    }

    public string FinalAwayScore
    {
        get
        {
            return EmptyScore(finalAwayScore);
        }

        set
        {
            finalAwayScore = value;
        }
    }

    public string BetStatus { get; set; }

    public bool IsCalRefund { get; set; }

    public string GoalRecord
    {
        get
        {
            var homeScore = HalfTimeHomeScore.Equals("-") ? 0 : Convert.ToInt32(HalfTimeHomeScore);
            var awayScore = HalfTimeAwayScore.Equals("-") ? 0 : Convert.ToInt32(HalfTimeAwayScore);
            var goal = new GoalRecord(IsCalRefund, goalRecord, BetStatus, homeScore, awayScore);
            return goal.GetGoalRecord();
        }

        set
        {
            goalRecord = string.IsNullOrEmpty(value) ? value : value.ToUpperInvariant();
        }
    }

    public bool IsExistFgLg { get; set; }

    public bool IsExistHtFgLg { get; set; }

    public GoalIcon GoalIcon { get; set; }

    public int AutoSetting { get; set; }

    public int AutoSettingForLeague { get; set; }

    public AutoSettingIcon AutoSettingIcon => autoSettingIcon ?? (autoSettingIcon = new AutoSettingIcon
    {
        MatchSetting = Convert.ToString(AutoSetting, ConvertToBase).Reverse(),
        LeagueSetting = Convert.ToString(AutoSettingForLeague, ConvertToBase).Reverse()
    });

    private static string EmptyScore(string score)
    {
        return string.IsNullOrEmpty(score) ? "-" : score;
    }
}