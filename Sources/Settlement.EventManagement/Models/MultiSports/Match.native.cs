using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.MultiSports;

public class Match : BaseMatch
{
    private const int ConvertToBase = 2;

    private const int DirectPayoutBit = 4;

    public bool IsHavingIntervalScore { get; set; }

    public Core.Models.MoreScores MoreScores { get; set; }

    public string SportName => RefDataService.GetSportName(SportType);

    #region Match Status

    public bool IsRefund { get; set; }

    public bool IsMultiCaled { get; set; }

    #endregion Match Status

    public int AutoSettingForLeague { get; set; }

    public int AutoPayoutStatus { get; set; }

    public bool IsAutoPayoutForLeague
    {
        get
        {
            var leagueSetting = Convert.ToString(AutoSettingForLeague, ConvertToBase).Reverse();

            if (string.IsNullOrWhiteSpace(leagueSetting))
            {
                return false;
            }

            if (leagueSetting.Length <= DirectPayoutBit)
            {
                return leagueSetting[0].Equals('1');
            }

            return leagueSetting[0].Equals('1') && leagueSetting[DirectPayoutBit].Equals('0');
        }
    }

    public bool IsAutoPayoutForMatch
    {
        get
        {
            var matchSetting = Convert.ToString(AutoSetting, ConvertToBase).Reverse();
            if (string.IsNullOrWhiteSpace(matchSetting))
            {
                return false;
            }

            if (matchSetting.Length <= DirectPayoutBit)
            {
                return matchSetting[0].Equals('1');
            }

            return matchSetting[0].Equals('1') && matchSetting[DirectPayoutBit].Equals('0');
        }
    }

    public bool IsKeyScore => BetStatus.IsKeyScore(HalfTimeHomeScore, HalfTimeAwayScore, FinalHomeScore, FinalAwayScore);

    public MixParlay MixParlay => new MixParlay(
        IsCalculated, IsKeyScore,
        IsCalculatingSingle,
        IsCalculatingMP, BetStatus ?? string.Empty, Remark);

    public bool IsExistsConfirmedEarly { get; set; }

    public int BestOfMap { get; set; }

    public ResultDetail ExHTResult { get; set; }

    public ResultDetail ExFTResult { get; set; }

    public override bool Equals(object obj)
    {
        return obj is Match match && match.MatchId == MatchId;
    }

    public override int GetHashCode()
    {
        return MatchId;
    }
}