using Kaden.Extensions;
using Settlement.Core.Models;

namespace Settlement.EventManagement.Models.MultiSports
{
    public class Match : BaseMatch
    {
        public bool IsHavingIntervalScore { get; set; }

        public Core.Models.MoreScores MoreScores { get; set; }

        public string SportName => RefDataService.GetSportName(SportType);

        #region Match Status

        public bool IsRefund { get; set; }

        public bool IsMultiCaled { get; set; }

        #endregion Match Status

        public int AutoSettingForLeague { get; set; }

        public int AutoPayoutStatus { get; set; }

        public AutoCalculationSetting AutoCalcSetting => new AutoCalculationSetting(AutoSetting, AutoSettingForLeague);

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
}